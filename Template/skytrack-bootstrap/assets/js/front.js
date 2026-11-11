/* =====================================================================
   SkyTrack — front-office (public site, "Utilisateur" actor)
   ---------------------------------------------------------------------
   Loaded after app.js. Renders the top navigation and footer, and
   provides the weather helpers shared by every front-office page.
   Followed cities, unit and read notifications are kept in
   localStorage here; in the real app they come from UserPreference
   (Analytics & Preferences) and Notification.read (Alert service).
   ===================================================================== */
(function () {
  "use strict";

  const D = window.SkyData;
  const S = window.Sky;
  const page = document.body.dataset.page || "";
  const TODAY = "2026-11-11";
  const USER = { id: 7, name: "Meriem Trabelsi", username: "meriem.t", email: "meriem.trabelsi@gmail.com", initials: "MT" };

  /* ---------------- storage (never required for rendering) ---------------- */
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* blocked: keep in memory */ }
  }
  const state = {
    unit: load("skytrack-unit", "C"),
    follow: load("skytrack-follow", [1, 3, 7]),
    read: load("skytrack-read", D.notifications.filter((n) => n.read).map((n) => n.id)),
    alertsEnabled: load("skytrack-alerts", true),
  };

  /* ---------------- weather helpers ---------------- */
  const city = (id) => D.cities.find((c) => c.id === Number(id));
  const current = (id) => D.forecasts.find((f) => f.cityId === Number(id) && f.date === TODAY);
  const toUnit = (c) => (state.unit === "F" ? c * 9 / 5 + 32 : c);
  const temp = (c) => `${Math.round(toUnit(c))}°`;
  const unitLabel = () => (state.unit === "F" ? "°F" : "°C");
  const SUMMARY_KEY = { "Ensoleillé": "sun", "Partiellement nuageux": "cloud-sun", "Nuageux": "cloud", "Averses": "rain", "Pluie légère": "rain", "Orageux": "storm", "Vent de sable": "cloud" };

  function week(id) {
    const f = current(id);
    const offset = f ? Math.round(f.weatherDetail.temperature - 22.4) : 0;
    return D.week.map((d, i) => {
      const src = i === 0 ? d : D.week[(i + Number(id)) % 7];
      const date = new Date(2026, 10, 11 + i);
      return {
        label: i === 0 ? "Aujourd’hui" : date.toLocaleDateString("fr-FR", { weekday: "long" }).replace(/^./, (c) => c.toUpperCase()),
        short: i === 0 ? "Auj." : date.toLocaleDateString("fr-FR", { weekday: "short" }),
        wx: i === 0 && f ? SUMMARY_KEY[f.summary] || "cloud" : src.wx,
        hi: src.hi + offset,
        lo: src.lo + offset,
        rain: i === 0 && f && /Averses|Pluie|Orageux/.test(f.summary) ? 80 : src.rain,
      };
    });
  }

  function hourly(id) {
    const f = current(id);
    const base = f ? f.weatherDetail.temperature : 20;
    const start = new Date().getHours();
    // Daily cycle: warmest around 14h, coolest before dawn.
    const peakIndex = (14 - start + 24) % 24;
    const phase = (2 * Math.PI * peakIndex) / 24 - Math.PI / 2;
    const temps = D.series(Number(id) * 31 + 7, 24, base - 3, 4, 0.8, phase);
    const rainy = f && /Averses|Pluie|Orageux/.test(f.summary);
    return temps.map((t, i) => {
      const hour = (start + i) % 24;
      const night = hour >= 18 || hour < 7;
      let wx = f ? SUMMARY_KEY[f.summary] || "cloud" : "cloud";
      if (night && (wx === "sun" || wx === "cloud-sun")) wx = "moon";
      const rain = rainy ? 40 + ((i * 17) % 50) : (i * 7) % 20;
      return { label: i === 0 ? "Maint." : `${String(hour).padStart(2, "0")}h`, hour, t, wx, rain };
    });
  }

  const wxIcon = (key) => key === "moon"
    ? '<i class="bi bi-moon-stars wx-cloud" aria-hidden="true"></i>'
    : S.wxIcon(key);

  const cityAlerts = (id) => D.alerts.filter((a) => a.active && a.cityId === Number(id));
  const activeAlerts = () => D.alerts.filter((a) => a.active);
  const unreadCount = () => D.notifications.filter((n) => !state.read.includes(n.id)).length;

  function alertBanner(a, href) {
    const s = S.SEVERITY[a.severity];
    const tag = href ? "a" : "div";
    return `<${tag} class="alert-banner ${s.cls}"${href ? ` href="${href}"` : ""}>
      <i class="bi ${s.icon}" aria-hidden="true"></i>
      <span class="min-w-0 flex-grow-1">
        <span class="title d-block">${S.esc(a.type)} · ${S.esc(D.cityName(a.cityId))} <span class="status status-${s.cls} ms-1">${s.label}</span></span>
        <span class="desc d-block">${S.esc(a.message)}</span>
      </span>
      ${href ? '<i class="bi bi-chevron-right text-3" aria-hidden="true" style="font-size:1rem"></i>' : ""}
    </${tag}>`;
  }

  /* ---------------- follow / unit / read ---------------- */
  function isFollowed(id) { return state.follow.includes(Number(id)); }
  function toggleFollow(id) {
    id = Number(id);
    state.follow = isFollowed(id) ? state.follow.filter((x) => x !== id) : state.follow.concat(id);
    save("skytrack-follow", state.follow);
    return isFollowed(id);
  }
  function setUnit(u) {
    state.unit = u;
    save("skytrack-unit", u);
    document.dispatchEvent(new CustomEvent("st:unitchange"));
  }
  function markRead(ids) {
    state.read = Array.from(new Set(state.read.concat(ids)));
    save("skytrack-read", state.read);
    renderNav();
  }
  function setAlertsEnabled(v) { state.alertsEnabled = v; save("skytrack-alerts", v); }

  /* ---------------- layout ---------------- */
  const LOGO = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 19h9.25a4.25 4.25 0 0 0 .55-8.46A6.25 6.25 0 0 0 5.4 10.2 4.4 4.4 0 0 0 7.5 19Z"/><path d="M2.8 7.2A10.5 10.5 0 0 1 8.6 3.4" opacity=".65"/><circle cx="11.3" cy="2.9" r="1.1" fill="#fff" stroke="none"/></svg>`;

  function renderNav() {
    const el = S.$("[data-fo-nav]");
    if (!el) return;
    const unread = unreadCount();
    const link = (id, href, icon, label, extra) =>
      `<a class="fo-link" href="${href}"${id === page ? ' aria-current="page"' : ""}><i class="bi ${icon}" aria-hidden="true"></i><span>${label}</span>${extra || ""}</a>`;
    el.innerHTML = `
      <div class="container-xl fo-nav-inner">
        <a class="brand" href="index.html"><span class="brand-mark">${LOGO}</span><span class="brand-name">Sky<span>Track</span></span></a>
        <nav class="fo-links ms-md-4" aria-label="Navigation principale">
          ${link("home", "index.html", "bi-house", "Accueil")}
          ${link("cities", "index.html#villes", "bi-geo-alt", "Villes")}
          ${link("alerts", "alerts.html", "bi-bell", "Mes alertes", unread ? `<span class="side-badge" aria-label="${unread} non lues">${unread}</span>` : "")}
          ${link("account", "account.html", "bi-person", "Mon compte")}
        </nav>
        <div class="ms-auto d-flex align-items-center gap-2">
          <div class="segmented d-none d-sm-inline-flex" role="radiogroup" aria-label="Unité de température">
            <input type="radio" class="btn-check" name="fo-unit-nav" id="nav-u-c" value="C"${state.unit === "C" ? " checked" : ""}><label class="btn" for="nav-u-c">°C</label>
            <input type="radio" class="btn-check" name="fo-unit-nav" id="nav-u-f" value="F"${state.unit === "F" ? " checked" : ""}><label class="btn" for="nav-u-f">°F</label>
          </div>
          <div class="dropdown">
            <button class="user-chip" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-label="Menu du compte">
              <span class="avatar avatar-sm a6">${USER.initials}</span>
              <span class="d-none d-lg-inline">${S.esc(USER.name.split(" ")[0])}</span>
              <i class="bi bi-chevron-down small text-3" aria-hidden="true"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end" style="width:264px">
              <div class="d-flex align-items-center gap-2 px-2 py-2">
                <span class="avatar a6">${USER.initials}</span>
                <div class="min-w-0"><div class="fw-semibold small">${S.esc(USER.name)}</div><div class="text-3 small text-truncate">${S.esc(USER.email)}</div></div>
              </div>
              <div class="dropdown-divider"></div>
              <h6 class="dropdown-header px-2">Thème</h6>
              <div class="theme-choice" role="radiogroup" aria-label="Thème">
                <input type="radio" class="btn-check" name="theme" id="th-system" value="system" autocomplete="off">
                <label class="btn" for="th-system"><i class="bi bi-circle-half" aria-hidden="true"></i>Système</label>
                <input type="radio" class="btn-check" name="theme" id="th-light" value="light" autocomplete="off">
                <label class="btn" for="th-light"><i class="bi bi-sun" aria-hidden="true"></i>Clair</label>
                <input type="radio" class="btn-check" name="theme" id="th-dark" value="dark" autocomplete="off">
                <label class="btn" for="th-dark"><i class="bi bi-moon-stars" aria-hidden="true"></i>Sombre</label>
              </div>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="account.html"><i class="bi bi-person" aria-hidden="true"></i>Mon compte</a>
              <a class="dropdown-item" href="alerts.html"><i class="bi bi-bell" aria-hidden="true"></i>Mes alertes</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="../login.html"><i class="bi bi-box-arrow-right" aria-hidden="true"></i>Se déconnecter</a>
            </div>
          </div>
        </div>
      </div>`;
    S.syncTheme();
  }

  function renderFooter() {
    const el = S.$("[data-fo-footer]");
    if (!el) return;
    el.innerHTML = `<div class="container-xl d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div class="d-flex align-items-center gap-2"><span class="brand-mark" style="width:26px;height:26px;border-radius:8px">${LOGO}</span><span>© 2026 SkyTrack · Données fournies par les microservices Forecast, IoT et Alert</span></div>
      <div class="d-flex gap-3"><a href="index.html#villes">Toutes les villes</a><a href="account.html">Préférences</a><a href="../backoffice/index.html">Espace professionnel</a></div>
    </div>`;
  }

  document.addEventListener("change", (e) => {
    // Each unit control has its own radio-group name; they are kept in sync here.
    if (e.target.name === "fo-unit" || e.target.name === "fo-unit-nav") setUnit(e.target.value);
  });
  document.addEventListener("st:unitchange", () => {
    S.$$('input[name="fo-unit"], input[name="fo-unit-nav"]').forEach((i) => (i.checked = i.value === state.unit));
  });

  /* ---------------- city search (ARIA combobox) ---------------- */
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  function initSearch(form) {
    const input = S.$("input", form);
    const list = S.$(".fo-suggest", form);
    const error = S.$(".search-error", form);
    let items = [], active = -1;

    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; }
    function go(c) { location.href = `city.html?id=${c.id}`; }
    function render() {
      const q = norm(input.value);
      error.hidden = true;
      if (!q) { close(); return; }
      items = D.cities.filter((c) => norm(c.name).includes(q) || norm(D.regionName(c.regionId)).includes(q)).slice(0, 6);
      if (!items.length) {
        list.innerHTML = `<li class="text-3" role="option" aria-disabled="true">Aucune ville ne correspond à « ${S.esc(input.value)} »</li>`;
      } else {
        list.innerHTML = items.map((c, i) => {
          const f = current(c.id);
          return `<li role="option" id="opt-${c.id}" data-index="${i}" aria-selected="${i === active}">
            <span class="fs-5">${f ? S.wxIcon(f.summary) : '<i class="bi bi-geo-alt text-3" aria-hidden="true"></i>'}</span>
            <span><span class="fw-semibold d-block">${S.esc(c.name)}</span><span class="small text-3">${S.esc(D.regionName(c.regionId))}</span></span>
            ${f ? `<span class="temp">${temp(f.weatherDetail.temperature)}</span>` : ""}
          </li>`;
        }).join("");
      }
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }
    function highlight(i) {
      active = i;
      S.$$("li[data-index]", list).forEach((li) => li.setAttribute("aria-selected", String(Number(li.dataset.index) === i)));
      if (i >= 0) input.setAttribute("aria-activedescendant", `opt-${items[i].id}`);
    }

    input.addEventListener("input", () => { active = -1; render(); });
    input.addEventListener("keydown", (e) => {
      if (list.hidden || !items.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); highlight((active + 1) % items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlight((active - 1 + items.length) % items.length); }
      else if (e.key === "Escape") { close(); }
    });
    list.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[data-index]");
      if (li) { e.preventDefault(); go(items[Number(li.dataset.index)]); }
    });
    input.addEventListener("blur", () => setTimeout(close, 120));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (active >= 0 && items[active]) return go(items[active]);
      const q = norm(input.value);
      const match = D.cities.find((c) => norm(c.name) === q) || D.cities.find((c) => norm(c.name).startsWith(q));
      if (q && match) return go(match);
      close();
      error.hidden = false;
      error.textContent = q ? `Aucune ville trouvée pour « ${input.value} ».` : "Saisissez le nom d’une ville.";
      input.focus();
    });
  }
  S.$$("form.fo-search").forEach(initSearch);

  renderNav();
  renderFooter();

  window.Front = {
    USER, TODAY, state, city, current, week, hourly, wxIcon, temp, toUnit, unitLabel,
    cityAlerts, activeAlerts, unreadCount, alertBanner,
    isFollowed, toggleFollow, setUnit, markRead, setAlertsEnabled,
  };
})();

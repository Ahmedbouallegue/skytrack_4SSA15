/* =====================================================================
   SkyTrack — app shell, theme, helpers, charts
   ---------------------------------------------------------------------
   Each page only contains its own <main> content. The sidebar and the
   topbar are rendered here from one definition so every page stays in
   sync (in Angular they become <app-sidebar> and <app-topbar>).
   ===================================================================== */
(function () {
  "use strict";

  const D = window.SkyData;
  const STORAGE_KEY = "skytrack-color-scheme";
  const page = document.body.dataset.page || "";

  /* ------------------------------------------------------------------
     Theme — 3 states: system (nothing stored) / light / dark.
     The inline <head> script already applied the stored value before
     first paint; this keeps everything in sync afterwards.
     ------------------------------------------------------------------ */
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const meta = document.querySelector('meta[name="color-scheme"]');

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStored(value) {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* storage blocked: theme still applies for this page */ }
  }
  let current = readStored();

  function resolved() {
    return current || (media.matches ? "dark" : "light");
  }
  function applyTheme() {
    if (meta) meta.content = current || "light dark";
    document.documentElement.setAttribute("data-bs-theme", resolved());
    document.querySelectorAll('input[name="theme"], input[name="theme-settings"]').forEach((input) => {
      input.checked = input.value === (current || "system");
    });
    document.querySelectorAll("[data-system-scheme]").forEach((el) => {
      el.textContent = media.matches ? "sombre" : "clair";
    });
    document.dispatchEvent(new CustomEvent("st:themechange", { detail: { theme: resolved() } }));
  }
  function setTheme(choice) {
    current = choice === "system" ? null : choice;
    writeStored(current);
    applyTheme();
  }
  media.addEventListener("change", () => { if (!current) applyTheme(); });
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) { current = e.newValue; applyTheme(); }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="theme"], input[name="theme-settings"]')) setTheme(e.target.value);
  });

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmt = {
    num: (v, d) => Number(v).toLocaleString("fr-FR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }),
    date: (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    dayMonth: (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
    time: (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    dateTime: (iso) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  };

  const SEVERITY = {
    CRITICAL: { cls: "critical", icon: "bi-exclamation-octagon-fill", label: "Critique" },
    SERIOUS: { cls: "serious", icon: "bi-exclamation-triangle-fill", label: "Sévère" },
    WARNING: { cls: "warning", icon: "bi-exclamation-circle-fill", label: "Vigilance" },
  };
  function severityChip(sev) {
    const s = SEVERITY[sev] || SEVERITY.WARNING;
    return `<span class="status status-${s.cls}"><i class="bi ${s.icon}" aria-hidden="true"></i>${s.label}</span>`;
  }

  const WX = {
    "Ensoleillé": "bi-sun wx-sun",
    "sun": "bi-sun wx-sun",
    "Partiellement nuageux": "bi-cloud-sun wx-cloud",
    "cloud-sun": "bi-cloud-sun wx-cloud",
    "Nuageux": "bi-clouds wx-cloud",
    "cloud": "bi-clouds wx-cloud",
    "Averses": "bi-cloud-rain-heavy wx-rain",
    "Pluie légère": "bi-cloud-drizzle wx-rain",
    "rain": "bi-cloud-rain-heavy wx-rain",
    "Orageux": "bi-cloud-lightning-rain wx-storm",
    "storm": "bi-cloud-lightning-rain wx-storm",
    "Vent de sable": "bi-wind wx-wind",
  };
  const wxIcon = (key) => `<i class="bi ${WX[key] || "bi-cloud wx-cloud"}" aria-hidden="true"></i>`;

  function toast(message, icon) {
    let host = $("#toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-container position-fixed bottom-0 end-0 p-3";
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast align-items-center";
    el.setAttribute("role", "status");
    el.innerHTML = `<div class="d-flex align-items-center gap-2 p-3">
        <i class="bi ${icon || "bi-check-circle-fill"} text-success" aria-hidden="true"></i>
        <div class="flex-grow-1 small fw-medium">${esc(message)}</div>
        <button type="button" class="btn-close btn-sm" data-bs-dismiss="toast" aria-label="Fermer"></button>
      </div>`;
    host.appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 3500 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    t.show();
  }

  /* ------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------ */
  const LOGO = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 19h9.25a4.25 4.25 0 0 0 .55-8.46A6.25 6.25 0 0 0 5.4 10.2 4.4 4.4 0 0 0 7.5 19Z"/><path d="M2.8 7.2A10.5 10.5 0 0 1 8.6 3.4" opacity=".65"/><circle cx="11.3" cy="2.9" r="1.1" fill="#fff" stroke="none"/></svg>`;

  const unread = D.notifications.filter((n) => !n.read).length;
  const activeAlerts = D.alerts.filter((a) => a.active).length;
  const up = D.services.filter((s) => s.status === "UP").length;

  const NAV = [
    { section: "Vue d’ensemble" },
    { id: "dashboard", href: "index.html", icon: "bi-grid-1x2", label: "Tableau de bord" },
    { section: "Météo" },
    { id: "forecasts", href: "forecasts.html", icon: "bi-cloud-sun", label: "Prévisions", port: 8082 },
    { id: "alerts", href: "alerts.html", icon: "bi-bell", label: "Alertes", badge: activeAlerts, port: 8083 },
    { id: "stations", href: "stations.html", icon: "bi-broadcast", label: "Stations IoT", port: 8084 },
    { id: "analytics", href: "analytics.html", icon: "bi-graph-up", label: "Analyses", port: 8085 },
    { section: "Référentiel" },
    { id: "locations", href: "locations.html", icon: "bi-geo-alt", label: "Villes et régions", port: 8081 },
    { id: "users", href: "users.html", icon: "bi-people", label: "Utilisateurs", port: 8080 },
    { section: "Compte" },
    { id: "settings", href: "settings.html", icon: "bi-sliders", label: "Paramètres" },
    { id: "styleguide", href: "styleguide.html", icon: "bi-palette", label: "Design system" },
  ];

  function renderSidebar(el) {
    const links = NAV.map((item) => {
      if (item.section) return `<div class="nav-section">${item.section}</div>`;
      const current = item.id === page ? ' aria-current="page"' : "";
      const tail = item.badge
        ? `<span class="side-badge" aria-label="${item.badge} actives">${item.badge}</span>`
        : item.port ? `<span class="side-port" aria-hidden="true">:${item.port}</span>` : "";
      return `<a class="side-link" href="${item.href}"${current}><i class="bi ${item.icon}" aria-hidden="true"></i><span>${item.label}</span>${tail}</a>`;
    }).join("");

    el.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <a class="brand" href="index.html"><span class="brand-mark">${LOGO}</span><span class="brand-name">Sky<span>Track</span></span></a>
        <button type="button" class="btn-close btn-close-white d-lg-none me-3" data-bs-dismiss="offcanvas" data-bs-target="#sidebar" aria-label="Fermer le menu"></button>
      </div>
      <nav class="offcanvas-body" aria-label="Navigation principale">
        ${links}
        <div class="sidebar-footer mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="eyebrow">Services</span>
            <span class="d-inline-flex align-items-center gap-2 small" style="color:var(--st-sidebar-text-strong)"><span class="pulse"></span>${up}/${D.services.length} en ligne</span>
          </div>
          <div class="health-meter" role="img" aria-label="${up} services sur ${D.services.length} en ligne"><span style="width:${(up / D.services.length) * 100}%"></span></div>
          <div class="health-row mt-2"><span>Dernière vérification</span><span>il y a 30 s</span></div>
        </div>
      </nav>`;
  }

  function renderTopbar(el) {
    const notifItems = D.notifications.map((n) => {
      const alert = D.alerts.find((a) => a.id === n.alertId);
      const s = SEVERITY[alert ? alert.severity : "WARNING"];
      return `<a class="notif${n.read ? "" : " unread"}" href="alerts.html">
          <span class="notif-icon ${s.cls}"><i class="bi ${s.icon}" aria-hidden="true"></i></span>
          <span class="min-w-0"><span class="notif-title d-block">${esc(n.message)}</span><span class="notif-meta d-block">${s.label} · ${fmt.dateTime(n.sentAt)}</span></span>
        </a>`;
    }).join("");

    el.innerHTML = `
      <button class="icon-btn d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar" aria-label="Ouvrir le menu"><i class="bi bi-list" aria-hidden="true"></i></button>
      <form class="topbar-search d-none d-md-block" role="search" onsubmit="return false">
        <i class="bi bi-search" aria-hidden="true"></i>
        <label class="visually-hidden" for="global-search">Rechercher</label>
        <input id="global-search" class="form-control" type="search" placeholder="Rechercher une ville, une station, une alerte…" autocomplete="off">
        <kbd aria-hidden="true">Ctrl K</kbd>
      </form>
      <div class="ms-auto d-flex align-items-center gap-1">
        <div class="dropdown">
          <button class="icon-btn" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-label="Notifications, ${unread} non lues">
            <i class="bi bi-bell" aria-hidden="true"></i>${unread ? '<span class="dot"></span>' : ""}
          </button>
          <div class="dropdown-menu dropdown-menu-end dropdown-wide">
            <div class="d-flex align-items-center justify-content-between px-2 pt-1 pb-2">
              <span class="fw-semibold">Notifications</span>
              <span class="badge-soft primary">${unread} non lues</span>
            </div>
            <div class="d-flex flex-column">${notifItems}</div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item justify-content-center fw-medium" href="alerts.html">Voir toutes les alertes</a>
          </div>
        </div>
        <a class="icon-btn d-none d-sm-inline-grid" href="styleguide.html" aria-label="Aide et design system"><i class="bi bi-question-circle" aria-hidden="true"></i></a>
        <div class="dropdown ms-1">
          <button class="user-chip" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            <span class="avatar avatar-sm">MD</span>
            <span class="d-none d-sm-inline">Med Dhia</span>
            <i class="bi bi-chevron-down small text-3" aria-hidden="true"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end" style="width:264px">
            <div class="d-flex align-items-center gap-2 px-2 py-2">
              <span class="avatar">MD</span>
              <div class="min-w-0"><div class="fw-semibold small">Med Dhia Allagui</div><div class="text-3 small text-truncate">dhia.allagui@skytrack.tn</div></div>
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
            <a class="dropdown-item" href="settings.html"><i class="bi bi-person" aria-hidden="true"></i>Mon profil</a>
            <a class="dropdown-item" href="settings.html"><i class="bi bi-sliders" aria-hidden="true"></i>Préférences</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="login.html"><i class="bi bi-box-arrow-right" aria-hidden="true"></i>Se déconnecter</a>
          </div>
        </div>
      </div>`;
  }

  const sidebarEl = $("#sidebar");
  const topbarEl = $("[data-st-topbar]");
  if (sidebarEl) renderSidebar(sidebarEl);
  if (topbarEl) renderTopbar(topbarEl);

  // Ctrl/⌘ + K focuses the search
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      const input = $("#global-search");
      if (input) { e.preventDefault(); input.focus(); }
    }
  });

  /* ------------------------------------------------------------------
     Charts (Chart.js) — theme-aware, thin marks, crosshair tooltips.
     One y-axis per chart: different measures go in different charts.
     ------------------------------------------------------------------ */
  const registry = [];
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const crosshair = {
    id: "stCrosshair",
    afterDatasetsDraw(chart) {
      const active = chart.tooltip && chart.tooltip.getActiveElements();
      if (!active || !active.length || chart.config.type !== "line") return;
      const { ctx, chartArea } = chart;
      const x = active[0].element.x;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = css("--st-border-strong");
      ctx.stroke();
      ctx.restore();
    },
  };

  function baseOptions(unit) {
    const text3 = css("--st-chart-axis");
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 500 },
      interaction: { mode: "index", intersect: false },
      layout: { padding: { top: 4, right: 4 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: css("--st-surface"),
          titleColor: css("--st-text"),
          bodyColor: css("--st-text-2"),
          borderColor: css("--st-border-strong"),
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 4,
          usePointStyle: true,
          titleFont: { family: "Inter", weight: "600", size: 12 },
          bodyFont: { family: "Inter", size: 12 },
          callbacks: {
            label: (c) => ` ${c.dataset.label} : ${fmt.num(c.parsed.y, unit === "mm" ? 1 : 1)} ${unit || ""}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: text3, font: { family: "Inter", size: 11 }, maxRotation: 0, autoSkipPadding: 16 },
        },
        y: {
          grid: { color: css("--st-chart-grid"), drawTicks: false },
          border: { display: false },
          ticks: { color: text3, font: { family: "Inter", size: 11 }, padding: 8, maxTicksLimit: 6, callback: (v) => `${v}${unit ? " " + unit : ""}` },
        },
      },
    };
  }

  function seriesColor(slot) { return css(`--st-series-${slot || 1}`); }

  function buildLine(canvas, cfg) {
    const surface = css("--st-surface");
    const datasets = cfg.datasets.map((d) => {
      const color = seriesColor(d.slot);
      const single = cfg.datasets.length === 1;
      return {
        label: d.label,
        data: d.data,
        borderColor: color,
        backgroundColor: single
          ? (ctx) => {
              const { chartArea, ctx: c } = ctx.chart;
              if (!chartArea) return "transparent";
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, color + "33");
              g.addColorStop(1, color + "00");
              return g;
            }
          : color,
        fill: single ? "origin" : false,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: surface,
        pointHoverBackgroundColor: color,
      };
    });
    const opts = baseOptions(cfg.unit);
    if (cfg.yMin !== undefined) opts.scales.y.suggestedMin = cfg.yMin;
    return new Chart(canvas, { type: "line", data: { labels: cfg.labels, datasets }, options: opts, plugins: [crosshair] });
  }

  function buildBar(canvas, cfg) {
    const datasets = cfg.datasets.map((d) => ({
      label: d.label,
      data: d.data,
      backgroundColor: seriesColor(d.slot),
      hoverBackgroundColor: seriesColor(d.slot),
      borderRadius: 4,
      borderSkipped: "start",
      categoryPercentage: 0.72,
      barPercentage: 0.88,
      maxBarThickness: 28,
    }));
    const opts = baseOptions(cfg.unit);
    opts.interaction = { mode: "index", intersect: false };
    opts.scales.y.beginAtZero = true;
    return new Chart(canvas, { type: "bar", data: { labels: cfg.labels, datasets }, options: opts });
  }

  /** Create a chart that re-renders itself when the theme changes. */
  function chart(canvas, type, getConfig) {
    if (!canvas || !window.Chart) return null;
    const entry = { canvas, type, getConfig, instance: null };
    entry.render = () => {
      if (entry.instance) entry.instance.destroy();
      const cfg = getConfig();
      entry.instance = type === "bar" ? buildBar(canvas, cfg) : buildLine(canvas, cfg);
    };
    entry.render();
    registry.push(entry);
    return entry;
  }
  document.addEventListener("st:themechange", () => registry.forEach((e) => e.render()));

  /** HTML legend — identity never relies on color alone (label + swatch). */
  function legend(el, items, kind) {
    if (!el) return;
    el.innerHTML = items.map((it) =>
      `<span class="key"><span class="swatch${kind === "bar" ? " bar" : ""}" style="background:var(--st-series-${it.slot})"></span>${esc(it.label)}</span>`
    ).join("");
  }

  /** Accessible table view for a chart (toggled with [data-chart-table]). */
  function chartTable(el, labels, datasets, unit) {
    if (!el) return;
    el.innerHTML = `<table class="table table-sm">
      <thead><tr><th scope="col">Période</th>${datasets.map((d) => `<th scope="col" class="num">${esc(d.label)}${unit ? ` (${unit})` : ""}</th>`).join("")}</tr></thead>
      <tbody>${labels.map((l, i) => `<tr><th scope="row" class="fw-medium">${esc(l)}</th>${datasets.map((d) => `<td class="num">${fmt.num(d.data[i], 1)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  }
  document.addEventListener("change", (e) => {
    const toggle = e.target.closest("[data-chart-table]");
    if (!toggle) return;
    const host = document.getElementById(toggle.dataset.chartTable);
    if (host) host.classList.toggle("show-table", toggle.checked);
  });

  // Initial sync of theme controls (rendered above)
  applyTheme();

  // Bootstrap tooltips
  $$('[data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));

  const refreshCharts = () => registry.forEach((e) => e.render());

  window.Sky = { $, $$, esc, fmt, severityChip, SEVERITY, wxIcon, toast, chart, refreshCharts, legend, chartTable, setTheme };
})();

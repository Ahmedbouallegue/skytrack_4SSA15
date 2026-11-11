// Generates diagramme-classes-etoile.html (star class diagram, User in the middle).
// Usage: node diagramme-classes-etoile.js  → then print the HTML to PDF (A4 landscape).
const fs = require("fs");
const path = require("path");

const NAVY = "#0f1e33", BLUE = "#2563a6", INK2 = "#4a5568", INK3 = "#5f6b79", LINE = "#c8d5e3";
const DB = {
  pg: { label: "PostgreSQL", fill: "#e8f0f9", stroke: "#2563a6", text: "#1d4f86" },
  mg: { label: "MongoDB", fill: "#e6f4ea", stroke: "#1f8a4c", text: "#17673a" },
  ix: { label: "InfluxDB", fill: "#f1eafb", stroke: "#7b4fc4", text: "#5b3a99" },
  mix: { label: "InfluxDB + MongoDB", fill: "#f3f0f8", stroke: "#7b4fc4", text: "#5b3a99" },
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CW = 214, ROW = 19, HEAD = 42;
const clsHeight = (attrs) => HEAD + attrs.length * ROW + 12;

// attribute: [name, type, tag]  tag: "pk" | "fk:<Target>" | "emb" | "tag"
function cls(x, y, name, stereo, attrs, opt = {}) {
  const w = opt.w || CW, h = clsHeight(attrs);
  const head = opt.center ? BLUE : NAVY;
  let s = `<g>`;
  if (opt.center) s += `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="14" fill="none" stroke="${BLUE}" stroke-opacity=".25" stroke-width="6"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" stroke="${head}" stroke-width="1.6"/>`;
  s += `<path d="M${x},${y + 8} a8,8 0 0 1 8,-8 h${w - 16} a8,8 0 0 1 8,8 v${HEAD - 8} h-${w} z" fill="${head}"/>`;
  s += `<text x="${x + w / 2}" y="${y + 15}" font-size="10.5" fill="#bcd6f2" text-anchor="middle">«${esc(stereo)}»</text>`;
  s += `<text x="${x + w / 2}" y="${y + 33}" font-size="${opt.center ? 17 : 15}" font-weight="700" fill="#fff" text-anchor="middle" class="t">${esc(name)}</text>`;
  attrs.forEach(([n, t, tag], i) => {
    const ty = y + HEAD + 18 + i * ROW;
    let suffix = "", color = "#1f2937";
    if (tag === "pk") suffix = ` <tspan fill="${INK3}" font-size="10.5">{PK}</tspan>`;
    else if (tag && tag.startsWith("fk:")) { color = BLUE; suffix = ` <tspan fill="${BLUE}" font-size="10.5">→ ${esc(tag.slice(3))}</tspan>`; }
    else if (tag === "tag") suffix = ` <tspan fill="${INK3}" font-size="10.5">«tag»</tspan>`;
    s += `<text x="${x + 10}" y="${ty}" font-size="11.5" class="m" fill="${color}">${tag === "pk" ? '<tspan text-decoration="underline">' + esc(n) + "</tspan>" : esc(n)}<tspan fill="${INK3}"> : ${esc(t)}</tspan>${suffix}</text>`;
  });
  s += `</g>`;
  return { svg: s, x, y, w, h, cx: x + w / 2, cy: y + h / 2, top: y, bottom: y + h, left: x, right: x + w };
}

// Package = frame + 2 classes + internal relation
function pkg(x, y, title, db, a, b, rel) {
  const W = 520, PAD = 12, GAP = W - 2 * PAD - 2 * CW;
  const A = cls(x + PAD, y + 40, a.name, a.stereo, a.attrs);
  const B = cls(x + PAD + CW + GAP, y + 40, b.name, b.stereo, b.attrs);
  const H = Math.max(A.h, B.h) + 54;
  const d = DB[db];
  let s = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="14" fill="${d.fill}" fill-opacity=".55" stroke="${d.stroke}" stroke-width="1.4" stroke-dasharray="7 5"/>`;
  s += `<text x="${x + 16}" y="${y + 25}" font-size="14.5" font-weight="700" fill="${NAVY}" class="t">${esc(title)}</text>`;
  s += `<rect x="${x + W - 16 - d.label.length * 7.2 - 16}" y="${y + 10}" width="${d.label.length * 7.2 + 16}" height="22" rx="11" fill="#fff" stroke="${d.stroke}"/>`;
  s += `<text x="${x + W - 16 - (d.label.length * 7.2 + 16) / 2}" y="${y + 25}" font-size="11.5" font-weight="600" fill="${d.text}" text-anchor="middle">${d.label}</text>`;
  // internal relation between A and B, at the vertical middle of the shorter class
  const ry = A.y + Math.min(A.h, B.h) / 2 + 6;
  const x1 = A.right, x2 = B.left;
  if (rel.kind === "none") return { svg: s + A.svg + B.svg, A, B, x, y, W, H }; // independent entities
  if (rel.kind === "composition") {
    s += `<path d="M${x1},${ry} l9,-6 l9,6 l-9,6 z" fill="${NAVY}"/>`;
    s += `<line x1="${x1 + 18}" y1="${ry}" x2="${x2}" y2="${ry}" stroke="${NAVY}" stroke-width="1.6"/>`;
  } else {
    s += `<line x1="${x1}" y1="${ry}" x2="${x2 - 1}" y2="${ry}" stroke="${NAVY}" stroke-width="1.6" ${rel.dashed ? 'stroke-dasharray="5 4"' : ""}/>`;
  }
  s += `<text x="${x1 + 4}" y="${ry - 8}" font-size="11" fill="${NAVY}" font-weight="600">${rel.m1}</text>`;
  s += `<text x="${x2 - 4}" y="${ry - 8}" font-size="11" fill="${NAVY}" font-weight="600" text-anchor="end">${rel.m2}</text>`;
  s += `<text x="${(x1 + x2) / 2}" y="${ry + 18}" font-size="10" fill="${INK2}" text-anchor="middle">${esc(rel.label)}</text>`;
  s += A.svg + B.svg;
  return { svg: s, A, B, x, y, W, H };
}

/* ---------------------------- model ---------------------------- */
const forecast = pkg(10, 30, "Forecast Service", "mg",
  { name: "Forecast", stereo: "document", attrs: [["id", "String", "pk"], ["cityId", "Long", "fk:City"], ["date", "LocalDate"], ["summary", "String"], ["weatherDetail", "WeatherDetail"]] },
  { name: "WeatherDetail", stereo: "embarqué", attrs: [["temperature", "Double"], ["humidity", "Double"], ["windSpeed", "Double"], ["pressure", "Double"]] },
  { kind: "composition", m1: "1", m2: "1", label: "contient" });

// The User Service package holds Role; User itself is the hub in the middle.
const role = cls(723, 82, "Role", "table", [["id", "Long", "pk"], ["name", "String"]]);
const userPkgSvg = (() => {
  const x = 680, y = 30, W = 300, H = role.h + 70, d = DB.pg;
  return `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="14" fill="${d.fill}" fill-opacity=".55" stroke="${d.stroke}" stroke-width="1.4" stroke-dasharray="7 5"/>
    <text x="${x + 16}" y="${y + 25}" font-size="14.5" font-weight="700" fill="${NAVY}" class="t">User Service · .NET</text>
    <rect x="${x + W - 112}" y="${y + 10}" width="96" height="22" rx="11" fill="#fff" stroke="${d.stroke}"/>
    <text x="${x + W - 64}" y="${y + 25}" font-size="11.5" font-weight="600" fill="${d.text}" text-anchor="middle">PostgreSQL</text>` + role.svg;
})();

const alert = pkg(1130, 30, "Alert & Notification Service", "mg",
  { name: "Alert", stereo: "document", attrs: [["id", "String", "pk"], ["cityId", "Long", "fk:City"], ["type", "String"], ["severity", "Severity"], ["createdAt", "Instant"]] },
  { name: "Notification", stereo: "document", attrs: [["id", "String", "pk"], ["alertId", "String", "fk:Alert"], ["userId", "Long", "fk:User"], ["message", "String"], ["read", "Boolean"]] },
  { kind: "assoc", m1: "1", m2: "0..*", label: "déclenche" });

const location = pkg(10, 735, "Location Service", "pg",
  { name: "City", stereo: "table", attrs: [["id", "Long", "pk"], ["name", "String"], ["latitude", "Double"], ["longitude", "Double"], ["regionId", "Long", "fk:Region"]] },
  { name: "Region", stereo: "table", attrs: [["id", "Long", "pk"], ["name", "String"], ["country", "String"]] },
  { kind: "assoc", m1: "*", m2: "1", label: "appartient à" });

const iot = pkg(570, 735, "IoT Sensor Service", "ix",
  { name: "Station", stereo: "entité", attrs: [["stationId", "String", "pk"], ["name", "String"], ["cityId", "Long", "fk:City"]] },
  { name: "SensorMeasurement", stereo: "measurement", attrs: [["timestamp", "Instant"], ["stationId", "String", "tag"], ["temperature", "Double"], ["humidity", "Double"], ["rain", "Double"]] },
  { kind: "assoc", m1: "1", m2: "0..*", label: "envoie" });

const analytics = pkg(1130, 735, "Analytics & Preferences Service", "mix",
  { name: "UserPreference", stereo: "document · MongoDB", attrs: [["id", "String", "pk"], ["userId", "Long", "fk:User"], ["unit", "Unit"], ["alertsEnabled", "Boolean"]] },
  { name: "HistoricalLog", stereo: "measurement · InfluxDB", attrs: [["cityId", "Long", "fk:City"], ["period", "String"], ["avgTemperature", "Double"], ["avgHumidity", "Double"]] },
  { kind: "none" });

// Hub
const user = cls(710, 420, "User", "table · User Service", [["id", "Long", "pk"], ["username", "String"], ["email", "String"], ["passwordHash", "String"], ["roleId", "Long", "fk:Role"]], { w: 240, center: true });

/* ---------------------------- spokes ---------------------------- */
// style: "fk" (physical, solid navy) | "logic" (logical userId, dashed blue) | "use" (consultation, dotted grey)
function spoke(x1, y1, x2, y2, style, label, m1, m2, lx, ly) {
  const st = { fk: `stroke="${NAVY}" stroke-width="2.2"`, logic: `stroke="${BLUE}" stroke-width="2.2" stroke-dasharray="9 6"`, use: `stroke="#8a96a6" stroke-width="1.8" stroke-dasharray="2 6" stroke-linecap="round"` }[style];
  const col = style === "use" ? "#5f6b79" : style === "logic" ? BLUE : NAVY;
  let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${st}/>`;
  const tw = label.length * 6.6 + 18;
  s += `<rect x="${lx - tw / 2}" y="${ly - 13}" width="${tw}" height="22" rx="11" fill="#fff" stroke="${col}" stroke-width="1"/>`;
  s += `<text x="${lx}" y="${ly + 2}" font-size="11.5" font-weight="600" fill="${col}" text-anchor="middle">${esc(label)}</text>`;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  if (m1) s += `<text x="${x1 + ux * 22 + nx * 12}" y="${y1 + uy * 22 + ny * 12 + 4}" font-size="12" font-weight="700" fill="${col}" text-anchor="middle">${m1}</text>`;
  if (m2) s += `<text x="${x2 - ux * 22 + nx * 12}" y="${y2 - uy * 22 + ny * 12 + 4}" font-size="12" font-weight="700" fill="${col}" text-anchor="middle">${m2}</text>`;
  return s;
}
const N = alert.B, UP = analytics.A, F = forecast.A, C = location.A, S = iot.A;
const spokes = [
  spoke(user.cx, user.top, role.cx, role.bottom, "fk", "possède (roleId)", "*", "1", user.cx, (user.top + role.bottom) / 2),
  spoke(user.right, user.top + 30, N.left + 40, N.bottom, "logic", "reçoit (userId)", "1", "0..*", 1150, 330),
  spoke(user.right, user.bottom - 30, UP.left, UP.top + 50, "logic", "configure (userId)", "1", "0..1", 1060, 660),
  spoke(user.left, user.top + 30, F.right - 40, F.bottom, "use", "consulte", "", "", 480, 330),
  spoke(user.left, user.bottom - 30, C.right - 30, C.top, "use", "suit / consulte", "", "", 500, 660),
  spoke(user.cx - 40, user.bottom, S.right - 30, S.top, "use", "consulte les mesures", "", "", 735, 690),
];

/* ---------------------------- page ---------------------------- */
const svg = `<svg viewBox="0 0 1660 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagramme de classes en étoile, User au centre">
${spokes.join("\n")}
${forecast.svg}
${userPkgSvg}
${alert.svg}
${location.svg}
${iot.svg}
${analytics.svg}
${user.svg}
</svg>`;

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>SkyTrack — Diagramme de classes en étoile</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>
@page{size:A4 landscape;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;background:#fff;font-family:Inter,Arial,sans-serif;color:${NAVY}}
.page{width:297mm;height:210mm;padding:8mm 10mm 6mm;display:flex;flex-direction:column;background:#f7f9fb}
.head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:2mm}
.eyebrow{font-size:8pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${BLUE}}
h1{font-family:"Space Grotesk",Inter,sans-serif;font-size:17pt;margin:.5mm 0 0}
.legend{display:flex;gap:6mm;font-size:8pt;color:${INK2};align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:180mm}
.legend span{display:inline-flex;align-items:center;gap:2mm}
svg{width:100%;height:auto;display:block;flex:1;min-height:0}
svg text{font-family:Inter,Arial,sans-serif} svg .t{font-family:"Space Grotesk",Inter,sans-serif} svg .m{font-family:"JetBrains Mono",Consolas,monospace}
.foot{display:flex;justify-content:space-between;font-size:7.5pt;color:${INK3};margin-top:1mm}
</style></head><body><section class="page">
<div class="head"><div><div class="eyebrow">SkyTrack · Conception</div><h1>Diagramme de classes en étoile — User au centre</h1></div>
<div class="legend">
<span><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="${NAVY}" stroke-width="2.2"/></svg>relation physique (même service)</span>
<span><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="${BLUE}" stroke-width="2.2" stroke-dasharray="7 5"/></svg>référence logique par userId (entre services)</span>
<span><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="#8a96a6" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round"/></svg>consultation, sans clé</span>
<span><svg width="12" height="12"><path d="M0,6 l6,-5 l6,5 l-6,5 z" fill="${NAVY}"/></svg>composition</span>
<span><b style="color:${BLUE};font-family:'JetBrains Mono',monospace">→ X</b>&nbsp;référence vers X</span>
</div></div>
${svg}
<div class="foot"><span>Chaque cadre = un microservice et sa base. Entre services, aucune clé étrangère physique : seulement des identifiants (cityId, userId).</span><span>SkyTrack · Validation 1</span></div>
</section></body></html>`;

fs.writeFileSync(path.join(__dirname, "diagramme-classes-etoile.html"), html);
console.log("ok");

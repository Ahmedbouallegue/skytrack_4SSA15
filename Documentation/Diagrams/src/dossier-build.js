// Generates SkyTrack — Dossier technique (.docx)
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, PageBreak, Header, Footer, PageNumber,
  TableOfContents, LevelFormat, TabStopType, VerticalAlign, PageOrientation,
} = require("docx");

const OUT = process.argv[2];
const DIR = __dirname;
const REPO = "C:/Users/Dhia/OneDrive/Bureau/skytrack_microservice_project-";

const NAVY = "0F1E33", BLUE = "2563A6", GREY = "4A5568", LIGHT = "E6EDF3", ALT = "F5F7F9", LINE = "C8D5E3";
const FONT = "Calibri", HFONT = "Calibri", MONO = "Consolas";
const W = 9638; // A4 width 11906 − 2 × 1134 margins

/* ------------------------------ helpers ------------------------------ */
// Inline markup: **bold**, `code`
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), font: MONO, size: (base.size || 22) - 2, color: "1D4F86", ...base, bold: false }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}
const P = (text, o = {}) => new Paragraph({ children: runs(text, o.run), spacing: { after: 120, line: 288 }, alignment: o.align || AlignmentType.JUSTIFIED, ...o.para });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)], pageBreakBefore: true });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const B = (text, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, children: runs(text), spacing: { after: 60, line: 276 } });
const N = (text) => new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs(text), spacing: { after: 60, line: 276 } });

let tableNo = 0, figNo = 0;
function caption(kind, text) {
  const n = kind === "Tableau" ? ++tableNo : ++figNo;
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240 },
    children: [new TextRun({ text: `${kind} ${n} – `, bold: true, size: 18, color: GREY }), new TextRun({ text, italics: true, size: 18, color: GREY })],
  });
}

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
function table(headers, rows, widths, cap) {
  const total = widths.reduce((a, b) => a + b, 0);
  const scale = W / total;
  const ws = widths.map((w) => Math.round(w * scale));
  ws[ws.length - 1] += W - ws.reduce((a, b) => a + b, 0);
  const cell = (text, i, header, shade) => new TableCell({
    width: { size: ws[i], type: WidthType.DXA },
    borders,
    verticalAlign: VerticalAlign.CENTER,
    shading: header ? { fill: NAVY, type: ShadingType.CLEAR, color: "auto" } : shade ? { fill: ALT, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: String(text).split("\n").map((line) => new Paragraph({
      spacing: { after: 0, line: 252 },
      keepNext: true, // keep the whole table (and its caption) on one page
      children: header ? [new TextRun({ text: line, bold: true, color: "FFFFFF", size: 19 })] : runs(line, { size: 19 }),
    })),
  });
  const t = new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: ws,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri % 2 === 1)) })),
    ],
  });
  return cap ? [t, caption("Tableau", cap)] : [t];
}

function figure(file, pxW, pxH, cap, maxW = 642 /* ≈ portrait text width in px at 96 dpi */) {
  const w = Math.min(maxW, pxW), h = Math.round((pxH / pxW) * w);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: w, height: h } })] }),
    caption("Figure", cap),
  ];
}

function code(lines) {
  return lines.map((l, i) => new Paragraph({
    shading: { fill: "F3F6FA", type: ShadingType.CLEAR, color: "auto" },
    spacing: { after: 0, before: i === 0 ? 60 : 0, line: 240 },
    indent: { left: 200, right: 200 },
    keepNext: i < lines.length - 1,
    children: [new TextRun({ text: l || " ", font: MONO, size: 17, color: "1F2937" })],
  })).concat([new Paragraph({ spacing: { after: 120 }, children: [] })]);
}

function note(text) {
  return new Paragraph({
    shading: { fill: "EEF4FB", type: ShadingType.CLEAR, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: BLUE, space: 8 } },
    indent: { left: 160 }, spacing: { before: 80, after: 160, line: 276 },
    children: runs(text, { size: 20 }),
  });
}

/* ------------------------------ cover ------------------------------ */
const cover = [
  new Paragraph({ spacing: { before: 1800, after: 0 }, children: [new TextRun({ text: "DOSSIER TECHNIQUE", bold: true, color: BLUE, size: 24, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun({ text: "SkyTrack", bold: true, color: NAVY, size: 96, font: HFONT })] }),
  new Paragraph({ spacing: { before: 60, after: 400 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 12 } },
    children: [new TextRun({ text: "Plateforme de surveillance et d’analyse météorologique en architecture microservices", color: GREY, size: 30 })] }),
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Projet microservices – Validation 1 : conception", bold: true, size: 24, color: NAVY })] }),
  new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "Version 1.0 · novembre 2026", size: 22, color: GREY })] }),
  ...table(["Membre", "Microservice", "Technologie"], [
    ["Ahmed Bouallegue", "1 · User Service", ".NET · PostgreSQL"],
    ["Salim Khaldi", "2 · Location Service", "Spring Boot · PostgreSQL"],
    ["Med Dhia Allagui", "3 · Forecast Service", "Spring Boot · MongoDB"],
    ["Yasmine Fehri", "4 · Alert & Notification Service", "Spring Boot · MongoDB"],
    ["Yassine Wesslati", "5 · IoT Sensor Service", "Spring Boot · InfluxDB"],
    ["Abdallah Grissa", "6 · Analytics & Preferences Service", "Spring Boot · InfluxDB + MongoDB"],
  ], [30, 40, 30]),
  new Paragraph({ spacing: { before: 600, after: 60 }, children: [new TextRun({ text: "Encadrant : ……………………………………", size: 22, color: GREY })] }),
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Établissement : ……………………………………", size: 22, color: GREY })] }),
  new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "Dépôt : github.com/Ahmedbouallegue/skytrack_microservice_project-", size: 20, color: GREY })] }),
];

const toc = [
  new Paragraph({ pageBreakBefore: true, spacing: { after: 240 }, children: [new TextRun({ text: "Sommaire", bold: true, size: 36, color: NAVY, font: HFONT })] }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }),
];

/* ------------------------------ body ------------------------------ */
// 4.3 (landscape page). Figure numbers follow reading order, so the figures of
// chapter 3 are created first, then this one, then the rest of the body.
const [STARW, STARH] = (() => { const b = fs.readFileSync(path.join(DIR, "star-portrait.png")); return [b.readUInt32BE(16), b.readUInt32BE(20)]; })();
const body = [
  /* 1 */
  H1("1. Introduction"),
  H2("1.1 Contexte et problématique"),
  P("Les informations météorologiques utiles à une collectivité ou à un particulier sont aujourd’hui **dispersées** : les prévisions, les mesures relevées par les stations et les alertes officielles proviennent d’outils différents, qui ne communiquent pas entre eux."),
  B("**Sources séparées** : prévisions, mesures des stations et alertes viennent de systèmes distincts."),
  B("**Alertes génériques** : il n’existe pas de notification ciblée par ville ni par utilisateur."),
  B("**Pas d’historique** : les mesures passées ne sont pas agrégées pour être analysées."),
  P("**SkyTrack** réunit ces informations dans une seule plateforme : prévisions par ville, mesures IoT en temps réel, alertes et notifications ciblées, historiques climatiques et préférences d’affichage."),
  H2("1.2 Objectifs du projet"),
  B("Concevoir une application découpée en **6 microservices indépendants**, un par membre de l’équipe."),
  B("Mettre en pratique trois familles de bases de données, chacune choisie selon la nature des données : **PostgreSQL** (relationnel), **MongoDB** (documents) et **InfluxDB** (séries temporelles)."),
  B("Faire communiquer les services uniquement par **API REST**, en échangeant des identifiants logiques."),
  B("Fournir une interface **Angular** avec un espace public (front-office) et un espace d’administration (back-office)."),
  B("Rendre l’ensemble déployable avec **Docker** et tolérant aux pannes d’un service."),
  H2("1.3 Périmètre de ce dossier"),
  P("Ce dossier correspond à la **première validation**, consacrée à la conception. Il présente l’analyse fonctionnelle, le découpage en microservices, le modèle de données, les communications entre services, l’architecture technique, l’interface utilisateur et l’organisation de l’équipe. La logique métier de chaque service sera développée après validation de cette conception."),

  /* 2 */
  H1("2. Analyse fonctionnelle"),
  H2("2.1 Acteurs"),
  ...table(["Acteur", "Description", "Espace"], [
    ["Utilisateur", "Personne qui consulte la météo des villes qui l’intéressent et reçoit les alertes.", "Front-office"],
    ["Administrateur", "Gère les comptes et les rôles, ainsi que le référentiel des villes et des régions.", "Back-office"],
    ["Prévisionniste", "Publie les prévisions et déclenche les alertes climatiques.", "Back-office"],
    ["Station météo IoT", "Acteur système, sans intervention humaine : envoie des mesures en continu.", "API (IoT)"],
  ], [20, 60, 20], "Acteurs du système"),
  H2("2.2 Fonctionnalités par acteur"),
  ...table(["Acteur", "Fonctionnalité", "Microservice"], [
    ["Utilisateur", "Rechercher une ville et consulter ses prévisions (jour, heure par heure, 7 jours)", "Forecast, Location"],
    ["Utilisateur", "Suivre des villes, choisir l’unité °C ou °F", "Analytics & Preferences"],
    ["Utilisateur", "Recevoir les alertes et marquer une notification comme lue", "Alert & Notification"],
    ["Utilisateur", "Consulter l’historique climatique d’une ville", "Analytics & Preferences"],
    ["Administrateur", "Gérer les utilisateurs et leurs rôles", "User"],
    ["Administrateur", "Gérer les villes et les régions", "Location"],
    ["Prévisionniste", "Créer, modifier et supprimer des prévisions", "Forecast"],
    ["Prévisionniste", "Déclencher et clôturer une alerte", "Alert & Notification"],
    ["Station IoT", "Envoyer des mesures (température, humidité, pluie)", "IoT Sensor"],
  ], [20, 55, 25], "Fonctionnalités et microservices concernés"),

  /* 3 */
  H1("3. Architecture"),
  H2("3.1 Principes de conception"),
  B("**Un service = une capacité métier** : le découpage suit le métier, pas les tables ni les écrans. Aucune responsabilité n’est partagée entre deux services."),
  B("**Une base de données par service** : aucun service ne lit la base d’un autre ; il passe par son API."),
  B("**Relations logiques entre services** : pas de clé étrangère physique entre services, seulement des identifiants (`cityId`, `userId`)."),
  B("**Point d’entrée unique** : tout le trafic externe passe par l’API Gateway."),
  B("**Tolérance aux pannes** : la panne d’un service ne doit pas provoquer d’erreurs en cascade."),
  H2("3.2 Découpage en microservices"),
  ...table(["#", "Microservice", "Capacité métier", "Technologie", "Port"], [
    ["1", "User Service", "Comptes, rôles et authentification", "ASP.NET Core (.NET)", "8080"],
    ["2", "Location Service", "Référentiel des villes et des régions", "Spring Boot", "8081"],
    ["3", "Forecast Service", "Prévisions météo par ville", "Spring Boot", "8082"],
    ["4", "Alert & Notification", "Alertes climatiques et notifications", "Spring Boot", "8083"],
    ["5", "IoT Sensor", "Mesures en temps réel des stations", "Spring Boot", "8084"],
    ["6", "Analytics & Preferences", "Historiques agrégés et préférences", "Spring Boot", "8085"],
  ], [6, 24, 36, 22, 12], "Découpage en microservices"),
  P("Le User Service est le seul développé en .NET. Comme tous les services communiquent en REST/JSON, les services Spring Boot l’appellent exactement comme les autres : le langage d’implémentation reste transparent."),
  H2("3.3 Architecture globale"),
  ...figure(path.join(DIR, "arch-overview.png"), 1500, 930, "Architecture globale de SkyTrack"),
  B("**Frontend Angular 21** (port 4200) : une seule application avec un front-office pour les utilisateurs et un back-office pour l’administration."),
  B("**API Gateway** (Spring Cloud Gateway) : point d’entrée unique, routage vers les services et vérification du jeton JWT."),
  B("**Keycloak** : authentification (OpenID Connect) et délivrance des jetons JWT, avec les rôles `ADMIN`, `FORECASTER` et `USER`."),
  B("**Eureka** : chaque service s’y enregistre ; les autres le trouvent par son nom (ex. `location-service`), sans adresse codée en dur."),
  B("**Config Server** : configuration centralisée de tous les services."),
  B("**Docker** : chaque microservice, sa base et l’infrastructure tournent dans leur propre conteneur, lancés ensemble par docker-compose."),
  H2("3.4 Choix technologiques"),
  ...table(["Couche", "Technologie", "Justification"], [
    ["Frontend", "Angular 21, Bootstrap 5.3, Chart.js", "Framework imposé ; Bootstrap pour un design cohérent et responsive ; Chart.js pour les graphiques."],
    ["Backend", "Spring Boot 3.3 (Java 17)", "Écosystème Spring Cloud complet : OpenFeign, Eureka, Gateway, Config, Resilience4j."],
    ["Backend", "ASP.NET Core (.NET)", "Montre l’interopérabilité : un service en C# intégré via REST/JSON."],
    ["Communication", "REST/JSON, OpenFeign", "Appels synchrones typés ; le client Feign résout le service via Eureka."],
    ["Résilience", "Resilience4j", "Timeout et circuit breaker sur chaque client Feign."],
    ["Sécurité", "Keycloak (OIDC, JWT)", "Authentification centralisée ; rôles transmis dans le jeton."],
    ["Bases", "PostgreSQL, MongoDB, InfluxDB", "Choisies selon la nature des données (voir chapitre 4)."],
    ["Déploiement", "Docker, docker-compose", "Environnement identique pour toute l’équipe ; un conteneur par composant."],
  ], [16, 28, 56], "Choix technologiques"),

  /* 4 */
  H1("4. Données"),
  H2("4.1 Une base de données par microservice"),
  ...table(["Microservice", "Base", "Port", "Pourquoi ce choix"], [
    ["User", "PostgreSQL", "5432", "Données structurées et transactionnelles, relation User → Role."],
    ["Location", "PostgreSQL", "5433", "Référentiel stable avec relation City → Region."],
    ["Forecast", "MongoDB", "27017", "Une prévision et son détail forment un seul document, souvent corrigé."],
    ["Alert & Notification", "MongoDB", "27018", "Le statut lu / non lu d’une notification est mis à jour."],
    ["IoT Sensor", "InfluxDB", "8086", "Mesures horodatées écrites en continu, jamais modifiées."],
    ["Analytics & Preferences", "InfluxDB + MongoDB", "8087 / 27019", "Moyennes horodatées (InfluxDB) et préférences modifiables (MongoDB)."],
  ], [22, 18, 14, 46], "Bases de données par microservice"),
  note("**Pourquoi pas InfluxDB pour les alertes ou les préférences ?** InfluxDB est optimisé pour l’ajout massif de points horodatés, mais gère mal la modification et ne connaît pas les relations. Une notification dont le statut change, ou une préférence que l’on lit et modifie, n’est pas une série temporelle : MongoDB est le bon choix."),
  H2("4.2 Modèle de données par microservice"),
  ...table(["Microservice", "Entités et attributs", "Relation"], [
    ["User", "**User** : id, username, email, password (haché), roleId\n**Role** : id, name", "User N..1 Role (physique)"],
    ["Location", "**City** : id, name, latitude, longitude, regionId\n**Region** : id, name, country", "City N..1 Region (physique)"],
    ["Forecast", "**Forecast** : id, cityId, date, summary, weatherDetail\n**WeatherDetail** : temperature, humidity, windSpeed, pressure", "Composition 1..1 : WeatherDetail est embarqué dans Forecast"],
    ["Alert & Notification", "**Alert** : id, cityId, type, severity, createdAt\n**Notification** : id, alertId, userId, message, read", "Alert 1..* Notification (alertId)"],
    ["IoT Sensor", "**Station** : stationId, name, cityId\n**SensorMeasurement** : timestamp, tag stationId, temperature, humidity, rain", "Station 1..* SensorMeasurement (flux temporel)"],
    ["Analytics & Preferences", "**HistoricalLog** (InfluxDB) : cityId, period, avgTemperature, avgHumidity\n**UserPreference** (MongoDB) : id, userId, unit, alertsEnabled", "Aucune relation entre les deux"],
  ], [20, 52, 28], "Entités, attributs et relations internes"),
  P("Les champs `cityId` et `userId` présents dans Forecast, Alert, Notification, Station, HistoricalLog et UserPreference sont des **références logiques** vers le Location Service et le User Service. Un `Long` côté Java correspond à un `long` côté C#."),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Diagramme de classes en étoile")], pageBreakBefore: true }),
  P("Le diagramme place **User** au centre et montre, pour chaque microservice, ses classes et leur lien avec l’utilisateur : relation physique (Role), référence logique par `userId` (Notification, UserPreference) ou simple consultation sans clé (Forecast, City, Station).", { para: { keepNext: true, spacing: { after: 60, line: 276 } } }),
  ...figure(path.join(DIR, "star-portrait.png"), STARW, STARH, "Diagramme de classes en étoile, User au centre", 610),
  H2("4.4 Exemple : document MongoDB du Forecast Service"),
  P("Le détail météo est un sous-document : il est lu et écrit en même temps que la prévision, sans jointure."),
  ...code([
    "{",
    "  \"_id\": \"6730f1c2a4b5c6d7e8f90123\",",
    "  \"cityId\": 5,",
    "  \"date\": \"2026-11-10\",",
    "  \"summary\": \"Ensoleillé\",",
    "  \"weatherDetail\": { \"temperature\": 21.5, \"humidity\": 60.0, \"windSpeed\": 12.0, \"pressure\": 1015.0 }",
    "}",
  ]),

  /* 5 */
  H1("5. Communication entre microservices"),
  H2("5.1 Appels entre services"),
  ...figure(path.join(DIR, "arch-comm.png"), 1500, 652, "Appels entre microservices"),
  ...table(["Service appelant", "Service appelé", "Identifiant", "Objectif"], [
    ["Forecast", "Location", "cityId", "Afficher le nom de la ville d’une prévision"],
    ["Alert & Notification", "Location", "cityId", "Connaître la ville touchée par une alerte"],
    ["Alert & Notification", "User", "userId", "Retrouver le destinataire d’une notification"],
    ["Analytics & Preferences", "Location", "cityId", "Ville d’un historique climatique"],
    ["Analytics & Preferences", "User", "userId", "Propriétaire des préférences"],
  ], [26, 18, 14, 42], "Appels inter-services"),
  P("Location et User sont des **services de référence** : ils sont appelés mais n’appellent aucun autre service. L’IoT Sensor Service est **autonome** : il reçoit les mesures des stations et n’appelle personne."),
  H2("5.2 Pourquoi des appels synchrones"),
  P("Dans chaque cas, la réponse est nécessaire immédiatement pour répondre au client : à la création d’une prévision, il faut savoir tout de suite si le `cityId` existe ; à l’affichage, l’utilisateur attend le nom de la ville dans la même réponse. Un échange asynchrone par message broker ne conviendrait pas. Les appels utilisent **OpenFeign**, qui résout le service appelé par son nom Eureka."),
  H2("5.3 Tolérance aux pannes"),
  P("Chaque client Feign est protégé par un **timeout** (2 s) et un **circuit breaker** (Resilience4j). Si un service appelé ne répond pas, l’appelant passe en mode dégradé au lieu de propager l’erreur. Exemple du Forecast Service lorsque le Location Service est indisponible :", { para: { keepNext: true } }),
  ...table(["Opération", "Comportement prévu"], [
    ["Lecture simple (GET /api/forecasts, /{id})", "Aucun impact : n’appelle pas le Location Service."],
    ["Lecture enrichie (GET /{id}/details)", "Mode dégradé : la prévision est renvoyée avec `cityName: null` (200)."],
    ["Création (POST)", "Refus avec 503 Service Unavailable : une ville non vérifiée n’est pas enregistrée."],
    ["Modification, suppression", "Pas d’appel externe (le cityId n’est pas modifiable) : aucun impact."],
  ], [40, 60], "Mode dégradé du Forecast Service"),

  /* 6 */
  H1("6. API REST"),
  H2("6.1 Conventions communes"),
  B("Chemin de base : `/api/<ressource au pluriel>` (ex. `/api/forecasts`, `/api/cities`)."),
  B("Format JSON ; les noms de champs sont ceux des entités."),
  B("Codes HTTP : `200` lecture/modification, `201` création (avec en-tête `Location`), `204` suppression, `400` validation, `404` introuvable, `409` conflit, `503` dépendance indisponible."),
  B("Toutes les routes sont exposées au frontend via l’API Gateway, qui vérifie le jeton JWT."),
  H2("6.2 Exemple : API du Forecast Service"),
  ...table(["Méthode", "URI", "Description", "Codes"], [
    ["GET", "/api/forecasts", "Liste ; filtres ?cityId= et ?date=", "200"],
    ["GET", "/api/forecasts/{id}", "Une prévision", "200, 404"],
    ["GET", "/api/forecasts/{id}/details", "Prévision + nom de la ville (appel Location)", "200, 404"],
    ["POST", "/api/forecasts", "Créer une prévision", "201, 400, 404, 409, 503"],
    ["PUT", "/api/forecasts/{id}", "Modifier une prévision", "200, 400, 404"],
    ["DELETE", "/api/forecasts/{id}", "Supprimer une prévision", "204, 404"],
  ], [12, 30, 38, 20], "API REST du Forecast Service"),
  P("Règles de validation : `cityId`, `date` et `weatherDetail` sont obligatoires ; `humidity` est comprise entre 0 et 100 ; `windSpeed` est positive ou nulle. Le `409` signale qu’une prévision existe déjà pour cette ville et cette date."),
  note("Chaque responsable documente l’API de son service avec le même format dans le README de son dossier `Backend/<service>`."),

  /* 7 */
  H1("7. Interface utilisateur"),
  H2("7.1 Deux espaces"),
  P("Une maquette Bootstrap complète a été réalisée avant l’intégration Angular (`Template/skytrack-bootstrap`). Elle sépare deux espaces qui partagent le même design system ; la page de connexion redirige chaque utilisateur selon son rôle."),
  ...table(["Espace", "Acteurs", "Pages"], [
    ["Front-office", "Utilisateur", "Accueil (recherche de ville, ville principale, vigilances, mes villes), page Ville (jour, station, heure par heure, 7 jours, historique), Mes alertes, Mon compte"],
    ["Back-office", "Administrateur, Prévisionniste", "Tableau de bord (dont santé des services), Prévisions, Alertes, Stations IoT, Analyses, Villes et régions, Utilisateurs, Paramètres"],
  ], [18, 22, 60], "Pages de l’interface"),
  H2("7.2 Design system"),
  B("**Jetons de design** : couleurs, rayons et ombres définis une seule fois en variables CSS ; aucune couleur codée en dur dans les pages."),
  B("**Thème clair et sombre** : suit le réglage du système, l’utilisateur peut forcer l’un ou l’autre."),
  B("**Statuts** : toujours une icône et un libellé (Critique, Sévère, Vigilance), jamais la couleur seule."),
  B("**Graphiques** : une seule unité par graphique, trois séries au maximum avec une palette lisible par les daltoniens, une légende et une vue tableau."),
  B("**Accessibilité et responsive** : navigation au clavier, libellés sur tous les champs ; sur téléphone, la navigation du front-office devient une barre d’onglets."),
  H2("7.3 Intégration dans Angular"),
  P("Le README de la maquette fixe des règles communes pour toute l’équipe : arborescence `core / shared / layouts / features/<service>`, correspondance page → route → composant → responsable, un seul service d’accès API par microservice, modèles TypeScript reprenant exactement les champs des entités, URL des API centralisées dans `environment.ts`, et liste de vérifications avant chaque livraison."),

  /* 8 */
  H1("8. Déploiement"),
  H2("8.1 Conteneurs Docker"),
  P("Chaque composant tourne dans son propre conteneur. Dans les conteneurs, chaque base écoute sur son port par défaut ; seul le port côté machine hôte change (notation hôte:conteneur)."),
  ...table(["Conteneur", "Technologie", "Ports"], [
    ["frontend", "Angular 21", "4200"],
    ["api-gateway", "Spring Cloud Gateway", "à définir"],
    ["eureka-server", "Netflix Eureka", "8761*"],
    ["config-server", "Spring Cloud Config", "8888*"],
    ["keycloak", "Keycloak", "8180:8080*"],
    ["user-service + postgres-user", ".NET + PostgreSQL", "8080 · 5432:5432"],
    ["location-service + postgres-location", "Spring Boot + PostgreSQL", "8081 · 5433:5432"],
    ["forecast-service + mongo-forecast", "Spring Boot + MongoDB", "8082 · 27017:27017"],
    ["alert-service + mongo-alert", "Spring Boot + MongoDB", "8083 · 27018:27017"],
    ["iot-service + influx-iot", "Spring Boot + InfluxDB", "8084 · 8086:8086"],
    ["analytics-service + influx-analytics + mongo-analytics", "Spring Boot + InfluxDB + MongoDB", "8085 · 8087:8086 · 27019:27017"],
  ], [44, 30, 26], "Conteneurs et ports"),
  P("* Ports par défaut proposés pour l’infrastructure, à confirmer par l’équipe. Keycloak est décalé sur 8180 pour ne pas entrer en conflit avec le User Service."),
  H2("8.2 Réseau"),
  P("Tous les conteneurs partagent le réseau Docker `skytrack-net` et se joignent par leur nom (ex. `mongo-forecast:27017`). Seuls le frontend et l’API Gateway doivent être exposés à l’extérieur ; les ports des bases ne sont publiés que pour le développement. Chaque service expose `/actuator/health`, utilisé pour superviser son état."),

  /* 9 */
  H1("9. Organisation du projet"),
  H2("9.1 Dépôt Git"),
  ...code([
    "skytrack_microservice_project-/",
    "├── Backend/              un projet par microservice (ex. forecast-service/)",
    "├── Frontend/             application Angular",
    "├── Template/             maquette Bootstrap (référence visuelle)",
    "├── Documentation/",
    "│   ├── Presentation/     présentation de la validation",
    "│   └── Diagrams/         diagramme de classes, architecture globale",
    "└── README.md",
  ]),
  H2("9.2 Méthode de travail"),
  B("**Une branche par membre** (ex. `dhia`) ; personne ne pousse directement sur `main`."),
  B("**Pull request** vers `main` pour toute intégration, relue par un autre membre."),
  B("**Commits réguliers** de chaque membre, avec des messages en français préfixés par le service concerné."),
  B("**Suivi des tâches** dans GitHub Projects."),
  B("Chaque service documente sa conception (responsabilités, modèle, API, interactions, pannes) dans son propre README."),
  H2("9.3 Outils"),
  ...table(["Usage", "Outils"], [
    ["Code source et revue", "Git, GitHub, pull requests"],
    ["Suivi des tâches", "GitHub Projects"],
    ["Build et exécution", "Maven, .NET CLI, Angular CLI, Docker, docker-compose"],
    ["Bases de données", "PostgreSQL, MongoDB, InfluxDB"],
    ["Conception", "Diagramme de classes, maquette Bootstrap, diagrammes d’architecture"],
  ], [30, 70], "Outils utilisés"),

  /* 10 */
  H1("10. État d’avancement et prochaines étapes"),
  H2("10.1 Réalisé (validation 1)"),
  B("Sujet, acteurs et fonctionnalités définis."),
  B("Découpage en six microservices, modèle de données et diagramme de classes."),
  B("Communications inter-services et stratégie de tolérance aux pannes."),
  B("Dépôt Git structuré, projets des microservices créés."),
  B("Maquette de l’interface (front-office et back-office) et design system."),
  B("Diagrammes d’architecture globale."),
  H2("10.2 Après validation"),
  N("Développer la logique métier et l’API REST de chaque service."),
  N("Mettre en place l’infrastructure : API Gateway, Eureka, Config Server et Keycloak."),
  N("Brancher les appels OpenFeign avec Resilience4j."),
  N("Intégrer l’interface dans Angular en suivant les règles communes de la maquette."),
  N("Écrire le docker-compose de l’ensemble et tester la plateforme complète."),
  H2("10.3 Conclusion"),
  P("La conception de SkyTrack répartit clairement les responsabilités entre six services autonomes, chacun avec la base de données adaptée à ses données. Les échanges se limitent à des identifiants, les pannes sont contenues, et des conventions communes (API, interface, Git) garantissent qu’un code écrit par six personnes reste cohérent une fois intégré."),
];

/* ------------------------------ sections ------------------------------ */
function headerFooter(width) {
  return {
    headers: { default: new Header({ children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: width }],
      children: [new TextRun({ text: "SkyTrack — Dossier technique", size: 17, color: GREY }), new TextRun({ text: "\tValidation 1 · Conception", size: 17, color: GREY })],
    })] }), first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Page ", size: 17, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 17, color: GREY }),
        new TextRun({ text: " / ", size: 17, color: GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: GREY })] })] }),
      first: new Footer({ children: [new Paragraph({ children: [] })] }) },
  };
}
function sections() {
  const portrait = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } };
  return [{ properties: { page: portrait, titlePage: true }, ...headerFooter(W), children: [...cover, ...toc, ...body] }];
}

/* ------------------------------ document ------------------------------ */
const doc = new Document({
  creator: "Équipe SkyTrack",
  title: "SkyTrack — Dossier technique",
  description: "Dossier technique de la validation 1",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: HFONT, size: 34, bold: true, color: NAVY },
        paragraph: { spacing: { before: 0, after: 240 }, keepNext: true, keepLines: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: HFONT, size: 27, bold: true, color: BLUE },
        paragraph: { spacing: { before: 300, after: 120 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal",
        run: { font: FONT, size: 21, bold: true, color: NAVY }, paragraph: { spacing: { before: 100, after: 20 } } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal",
        run: { font: FONT, size: 19, color: GREY }, paragraph: { spacing: { before: 0, after: 10 }, indent: { left: 300 } } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: HFONT, size: 23, bold: true, color: NAVY },
        paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, keepLines: true, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 260 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 260 } } } },
      ] },
      { reference: "steps", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 300 } } } },
      ] },
    ],
  },
  features: { updateFields: true },
  sections: sections(),
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("written", OUT); });

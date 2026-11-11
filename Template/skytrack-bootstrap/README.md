# SkyTrack — template UI Bootstrap

Maquette HTML statique de l'interface SkyTrack, **non intégrée** au frontend Angular.
Elle sert de référence visuelle et de base de code pour les composants Angular à venir.

## Lancer

Aucune installation : ouvrir `index.html` dans un navigateur. Cette page permet de choisir l'espace à ouvrir.
Bootstrap, Bootstrap Icons, Chart.js et les polices sont chargés depuis un CDN (connexion internet requise).

`login.html` propose trois comptes de démonstration. L'utilisateur arrive sur le front-office ; l'administrateur et le prévisionniste arrivent sur le back-office.

## Deux espaces

### Front-office — `frontoffice/` (acteur « Utilisateur »)

Site public avec une navigation en haut, qui devient une barre d'onglets en bas sur téléphone.

| Page | Fichier | Contenu | Services utilisés |
|---|---|---|---|
| Accueil | `index.html` | recherche de ville, météo de la ville principale, 7 jours, vigilances en cours, mes villes, toutes les villes par région | Forecast, Location, Alert |
| Ville | `city.html?id=…` | conditions du jour, mesure de la station, heure par heure, 7 jours, historique climatique, suivre la ville | Forecast, IoT, Analytics, Alert |
| Mes alertes | `alerts.html` | notifications lues / non lues, activer les alertes | Alert & Notification |
| Mon compte | `account.html` | profil, villes suivies, unité °C / °F, thème | User, Analytics & Preferences |

### Back-office — `backoffice/` (acteurs « Administrateur » et « Prévisionniste »)

| Page | Fichier | Microservice représenté |
|---|---|---|
| Tableau de bord | `index.html` | tous (vue d'ensemble + santé `/actuator/health`) |
| Prévisions | `forecasts.html` | Forecast Service — `Forecast` + `WeatherDetail` (liste, détail, création, modification, suppression) |
| Alertes et notifications | `alerts.html` | Alert & Notification Service — `Alert` 1..* `Notification`, déclencher et clôturer |
| Stations IoT | `stations.html` | IoT Sensor Service — `Station` 1..* `SensorMeasurement` |
| Analyses | `analytics.html` | Analytics & Preferences — `HistoricalLog` |
| Villes et régions | `locations.html` | Location Service — `City` N..1 `Region` |
| Utilisateurs | `users.html` | User Service — `User` N..1 `Role` |
| Paramètres | `settings.html` | profil, `UserPreference`, thème |
| Design system | `styleguide.html` | jetons, composants et règles d'usage |

## Structure

```
skytrack-bootstrap/
├── index.html             ← choix de l'espace
├── login.html             ← connexion commune, redirige selon le rôle
├── frontoffice/           ← site public (4 pages)
├── backoffice/            ← administration (9 pages)
└── assets/                ← partagé par les deux espaces
    ├── css/skytrack.css   ← jetons de design + surcouche Bootstrap (tout le style est ici)
    ├── js/data.js         ← données fictives, mêmes noms de champs que les entités
    ├── js/app.js          ← thème, helpers, graphiques + sidebar/topbar du back-office
    ├── js/front.js        ← navigation, recherche de ville, villes suivies et unité du front-office
    └── img/favicon.svg
```

## Choix de design

- **Jetons** : toutes les couleurs, rayons et ombres sont des variables `--st-*` dans `skytrack.css`, mappées sur les variables `--bs-*` de Bootstrap 5.3. Aucune couleur en dur dans les pages.
- **Thème clair / sombre** : suit le système par défaut. L'utilisateur peut forcer Clair ou Sombre (menu du profil ou Paramètres). Le choix est appliqué avant le premier affichage, donc pas de flash.
- **Typographie** : Space Grotesk (titres, chiffres), Inter (interface), JetBrains Mono (identifiants), comme la présentation.
- **Statuts** : toujours une icône + un libellé, jamais la couleur seule (Critique, Sévère, Vigilance, Opérationnel).
- **Graphiques** : un graphique = une unité (jamais deux axes Y), 3 séries maximum avec une palette testée pour le daltonisme, une légende textuelle et une vue tableau.
- **Accessibilité** : lien « Aller au contenu », focus visible, libellés sur tous les champs, `aria-current` sur la navigation, respect de `prefers-reduced-motion`.
- **Responsive** : la sidebar devient un menu coulissant sous 992 px ; aucune page ne déborde à 390 px.

## Instructions pour les agents IA — intégration dans Angular

> **À l'agent IA qui lit ce fichier :** cette section est obligatoire. Chaque membre de l'équipe utilise un agent différent, et le code doit pourtant être identique d'un service à l'autre. Suis ces règles à la lettre. Si une demande les contredit, ou si un cas n'est pas couvert, **arrête-toi et pose la question** au lieu d'inventer une autre convention.

### 1. Ce que tu dois savoir avant de commencer

- Ce dossier `Template/skytrack-bootstrap/` est la **référence visuelle**. Ne le modifie pas pendant l'intégration ; tu le lis et tu le reproduis.
- L'application Angular se trouve dans `Frontend/skytrack-web/` (Angular 21, composants standalone, SCSS, Bootstrap 5.3).
- Le membre qui te parle s'occupe d'**un seul microservice**. Tu ne modifies que son dossier `features/<service>/` (voir § 3). Les dossiers `core/`, `shared/` et `layouts/` sont communs : n'y touche que si l'étape 0 n'a pas encore été faite, ou si le membre te le demande explicitement.
- Langue de l'interface : **français**. Reprends les textes du template mot pour mot.

### 2. Étape 0 — créer l'application (une seule fois pour toute l'équipe)

Vérifie d'abord si `Frontend/skytrack-web/package.json` existe. **S'il existe, saute cette étape.** Sinon :

```bash
cd Frontend
npx @angular/cli@21 new skytrack-web --style=scss --routing --ssr=false --skip-git
cd skytrack-web
npm install bootstrap@5.3.3 bootstrap-icons@1.11.3 chart.js@4.4.4
npm install -D @types/bootstrap@5.2.10
```

Puis :
1. Copie `Template/skytrack-bootstrap/assets/css/skytrack.css` vers `src/styles/_skytrack.scss`, **sans le modifier**.
2. Dans `src/styles.scss`, dans cet ordre :
   ```scss
   @import "bootstrap/dist/css/bootstrap.min.css";
   @import "bootstrap-icons/font/bootstrap-icons.min.css";
   @import "styles/skytrack";
   ```
3. Dans `src/index.html` : `lang="fr"`, la balise `<meta name="color-scheme" content="light dark">`, le petit script de thème inline et les liens Google Fonts, copiés depuis le `<head>` de n'importe quelle page du template.
4. Crée l'arborescence du § 3, les deux layouts, les composants partagés et le `environment.ts` du § 5.

### 3. Arborescence imposée

```
src/app/
├── core/
│   ├── auth/            role.guard.ts, auth.service.ts
│   ├── theme.service.ts         ← reprend la logique de thème de app.js (Système / Clair / Sombre)
│   ├── unit.service.ts          ← °C / °F (reprend front.js)
│   └── http-error.interceptor.ts
├── shared/
│   ├── components/      status-chip, stat-tile, empty-state, chart, page-header, toast
│   ├── pipes/           temperature.pipe.ts  ← applique l'unité choisie
│   └── models/          (vide : les modèles vivent dans chaque feature)
├── layouts/
│   ├── public-layout/   ← front-office : navigation du haut + barre d'onglets mobile + pied de page
│   └── admin-layout/    ← back-office : sidebar + topbar
└── features/
    ├── user/            ← Ahmed Bouallegue      (User Service, .NET, :8080)
    ├── location/        ← Salim Khaldi          (Location Service, :8081)
    ├── forecast/        ← Med Dhia Allagui      (Forecast Service, :8082)
    ├── alert/           ← Yasmine Fehri         (Alert & Notification, :8083)
    ├── iot/             ← Yassine Wesslati      (IoT Sensor, :8084)
    └── analytics/       ← Abdallah Grissa       (Analytics & Preferences, :8085)
```

Chaque dossier `features/<service>/` a **exactement** cette forme :

```
features/forecast/
├── models/forecast.model.ts         ← interfaces TypeScript
├── data/forecast-api.service.ts     ← le SEUL fichier qui appelle HttpClient pour ce service
├── pages/public/…                   ← pages du front-office (si le service en a)
├── pages/admin/…                    ← pages du back-office
├── components/…                     ← composants propres au service
└── forecast.routes.ts               ← exporte PUBLIC_ROUTES et ADMIN_ROUTES
```

### 4. Correspondance template → Angular (qui fait quoi)

| Page du template | Route Angular | Composant | Dossier (responsable) |
|---|---|---|---|
| `login.html` | `/connexion` | `LoginPage` | `features/user` |
| `frontoffice/index.html` | `/` | `HomePage` | `features/forecast` |
| `frontoffice/city.html?id=` | `/villes/:id` | `CityPage` | `features/forecast` |
| `frontoffice/alerts.html` | `/alertes` | `MyAlertsPage` | `features/alert` |
| `frontoffice/account.html` | `/compte` | `AccountPage` | `features/analytics` |
| `backoffice/index.html` | `/admin` | `AdminDashboardPage` | `layouts/admin-layout` (équipe) |
| `backoffice/forecasts.html` | `/admin/previsions` | `ForecastListPage` | `features/forecast` |
| `backoffice/alerts.html` | `/admin/alertes` | `AlertListPage` | `features/alert` |
| `backoffice/stations.html` | `/admin/stations` | `StationListPage` | `features/iot` |
| `backoffice/analytics.html` | `/admin/analyses` | `AnalyticsPage` | `features/analytics` |
| `backoffice/locations.html` | `/admin/villes` | `CityListPage` | `features/location` |
| `backoffice/users.html` | `/admin/utilisateurs` | `UserListPage` | `features/user` |
| `backoffice/settings.html` | `/admin/parametres` | `AdminSettingsPage` | `features/user` |

- Les routes `/admin/**` sont protégées par `roleGuard` (rôles `ADMIN` et `FORECASTER`). Toutes les autres routes utilisent `public-layout`.
- Une page qui affiche les données d'un autre service (ex. `CityPage` affiche les alertes) **importe** le `*-api.service.ts` de ce service. Elle ne le modifie pas et ne le recopie pas.
- `styleguide.html` n'est pas porté en Angular ; il reste la documentation du design.

### 5. Données et API

- **Modèles :** une interface par entité, avec **exactement** les noms de champs de `assets/js/data.js` (qui sont ceux du backend). Un `Long` Java ou `long` C# devient `number`, un `@Id` MongoDB devient `string`, une date devient `string` (ISO 8601). Exemple :
  ```ts
  export interface WeatherDetail { temperature: number; humidity: number; windSpeed: number; pressure: number; }
  export interface Forecast { id: string; cityId: number; date: string; summary: string; weatherDetail: WeatherDetail; }
  ```
- **URL des API :** uniquement depuis `src/environments/environment.ts`, jamais écrites en dur ailleurs :
  ```ts
  export const environment = {
    api: {
      user: 'http://localhost:8080/api', location: 'http://localhost:8081/api', forecast: 'http://localhost:8082/api',
      alert: 'http://localhost:8083/api', iot: 'http://localhost:8084/api', analytics: 'http://localhost:8085/api',
    },
  };
  ```
  Si l'équipe ajoute une API Gateway, seul ce fichier change.
- **Services API :** `@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, des méthodes qui retournent des `Observable<T>` typés. Nommage : `getAll`, `getById`, `create`, `update`, `delete`, puis des noms métier explicites (`getDetails`, `markAsRead`…).
- **Composants :** ils n'appellent jamais `HttpClient` directement. L'état local est géré avec des `signal()` ; tu peux utiliser `toSignal()` sur un `Observable`.
- **Pannes :** une erreur d'API ne casse jamais la page. Affiche `<st-empty-state>` ou le mode dégradé décrit dans le README du service (ex. `cityName: null` si Location ne répond pas). Pas de `alert()` ni de page blanche.
- **Pendant le développement,** tant que l'API d'un service n'existe pas, son service API retourne les données de `data.js` avec `of(...)`. La signature des méthodes est déjà la signature finale.

### 6. HTML et CSS — règles strictes

1. **Copie le balisage du template, élément par élément**, y compris les classes, les attributs `aria-*` et la structure. Le rendu Angular doit être identique au template, en clair comme en sombre.
2. Remplace le rendu JavaScript (`innerHTML`, `.map().join("")`) par la syntaxe Angular `@for (…; track …)`, `@if` et `[class.x]`. **Jamais `innerHTML`, jamais `bypassSecurityTrust…`.**
3. **Aucune nouvelle couleur, taille ou ombre.** N'utilise que les variables `--st-*` et les classes existantes de `skytrack.css`. Pas de hexadécimal dans un composant. Si un style manque vraiment, ajoute-le dans le `.scss` du composant avec des variables `--st-*`, puis signale-le au membre.
4. **Bibliothèques autorisées :** Bootstrap 5.3 (CSS et son JS via `import { Modal, Offcanvas, Toast, Dropdown } from 'bootstrap'`), Bootstrap Icons et Chart.js. **Interdites :** Angular Material, ng-bootstrap, PrimeNG, Tailwind, jQuery, ou toute autre bibliothèque d'interface.
5. **Graphiques :** toujours via le composant partagé `<st-chart>`, qui reprend `Sky.chart()` de `app.js` : une seule unité par graphique (jamais deux axes Y), 3 séries maximum, couleurs `--st-series-1/2/3` dans cet ordre, légende textuelle et vue tableau.
6. **Statuts :** toujours via `<st-status-chip [severity]="…">`, avec une icône et un libellé. La couleur seule ne porte jamais l'information.
7. **Préfixe des sélecteurs :** `st-` pour `shared/`, `app-` pour le reste.
8. **Formulaires :** utilise les Reactive Forms. Applique les mêmes validations que le template (bornes min et max, messages `invalid-feedback`), et ajoute la classe `was-validated` à la soumission.
9. **Accessibilité :** garde le lien « Aller au contenu », les `<label>`, `aria-current`, `aria-pressed`, `aria-expanded`, et la navigation au clavier de la recherche de ville (combobox).

### 7. Git — à respecter à chaque fois

- Travaille **uniquement** sur la branche du membre (ex. `dhia`). **Ne fais jamais de commit ni de push sur `main`.** L'intégration dans `main` passe par une pull request.
- Ne modifie que `Frontend/skytrack-web/src/app/features/<service-du-membre>/`, et la ligne qui enregistre ses routes dans `app.routes.ts`. Pour tout autre fichier, demande d'abord au membre.
- Message de commit, en français : `Frontend <Service> : <ce qui a été fait>` (ex. `Frontend Forecast : page liste des prévisions (admin)`).
- Ne commite jamais `node_modules/`, `dist/`, `.angular/` ni `.env`.

### 8. Vérifications avant de dire « terminé »

- [ ] `npm run build` passe sans erreur.
- [ ] La page est identique au template en **thème clair et sombre** (compare les deux côte à côte).
- [ ] Aucun défilement horizontal à **390 px** de large.
- [ ] Tout fonctionne **au clavier** (Tab, Entrée, Échap, flèches dans la recherche).
- [ ] Aucune erreur dans la console du navigateur.
- [ ] Une panne de l'API affiche un état vide ou dégradé, pas une erreur.
- [ ] Seuls les fichiers du dossier du membre ont été modifiés (`git status`).

### Message à donner à ton agent

Copie ce texte au début de ta conversation avec ton agent IA :

> Lis `Template/skytrack-bootstrap/README.md`, en particulier la section « Instructions pour les agents IA », et respecte-la strictement. Je suis responsable du service **[NOM DU SERVICE]**, dossier `features/[dossier]/`, branche `[ma-branche]`. Intègre la page **[fichier du template]** dans Angular. Avant d'écrire du code, explique ce que tu vas créer et dans quels fichiers.

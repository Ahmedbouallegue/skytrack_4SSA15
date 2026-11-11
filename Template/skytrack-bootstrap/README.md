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

## Vers Angular (plus tard)

| Template | Angular |
|---|---|
| `frontoffice/` et `backoffice/` | deux layouts Angular (routes `/` et `/admin`), l'accès à `/admin` est protégé selon le rôle |
| `renderSidebar` / `renderTopbar` (`app.js`), `renderNav` (`front.js`) | composants `<app-sidebar>`, `<app-topbar>`, `<app-public-nav>` |
| chaque fichier `.html` | un composant de page + une route |
| villes suivies, unité, notifications lues (`localStorage` dans `front.js`) | `UserPreference` et `Notification.read` via les API |
| `data.js` | services Angular appelant les API REST (`/api/forecasts`, `/api/alerts`, …) |
| `skytrack.css` | `styles.scss` global (copier tel quel) |
| `Sky.chart(...)` | un composant `<app-chart>` autour de Chart.js |

Les noms de champs de `data.js` (`cityId`, `weatherDetail.temperature`, `alertId`, `read`, `stationId`, …) sont ceux des entités, donc le remplacement par les vraies API ne change pas les templates.

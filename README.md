# SkyTrack

## 🎯 Objectif du projet

**SkyTrack** est une plateforme moderne de gestion, de surveillance et d'analyse météorologique. Elle repose sur une **architecture microservices** : le système est découpé en **6 services indépendants** (un par membre de l'équipe). Chaque service possède sa propre base de données (PostgreSQL, MongoDB ou InfluxDB) et communique avec les autres via des appels réseau (REST / OpenFeign) ou des identifiants logiques.

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | Angular 21 |
| **Backend – User Service** | .NET (ASP.NET Core Web API) |
| **Backend – 5 autres microservices** | Spring Boot (Java) + Spring Cloud OpenFeign |
| **Bases de données** | PostgreSQL, MongoDB, InfluxDB |
| **Communication** | REST (JSON) ; OpenFeign côté Spring Boot, `HttpClient` côté .NET |

> Le User Service est le seul microservice développé en **.NET**. Comme tous les services communiquent en **REST/JSON**, les services Spring Boot l'appellent via OpenFeign exactement comme n'importe quel autre service : le langage d'implémentation reste transparent pour les autres.

## 🔌 Ports des microservices et des bases de données

| # | Microservice | Technologie | Port du service (API) | Base de données | Port de la BD |
|---|---|---|---|---|---|
| 1 | User Service | .NET | `8080` | PostgreSQL | `3306` |
| 2 | Location Service | Spring Boot | `8081` | PostgreSQL | `3307` |
| 3 | Forecast Service | Spring Boot | `8082` | MongoDB | `3308` |
| 4 | Alert & Notification Service | Spring Boot | `8083` | InfluxDB | `3309` |
| 5 | IoT Sensor Service | Spring Boot | `8084` | MongoDB | `3310` |
| 6 | Analytics & Preferences Service | Spring Boot | `8085` | InfluxDB | `3311` |
| – | Frontend (Angular 21) | Angular | `4200` | – | – |

> ℹ️ Les ports de BD `3306` → `3311` sont les ports exposés sur la machine hôte. Si les bases tournent dans Docker, ils sont mappés vers les ports par défaut des conteneurs (PostgreSQL `5432`, MongoDB `27017`, InfluxDB `8086`), par exemple `3306:5432`.

### 🧩 Pourquoi cette répartition ?

- **Autonomie** : chaque membre développe sa propre brique sans perturber le code des autres.
- **Diversité des technologies** : le projet met en pratique plusieurs paradigmes de bases de données très recherchés en entreprise :
  - **PostgreSQL** (SQL relationnel) pour les données transactionnelles et structurées (Utilisateurs, Villes).
  - **MongoDB** (NoSQL orienté documents) pour les données flexibles ou semi-structurées (Prévisions, Stations et mesures des capteurs IoT).
  - **InfluxDB** (Time-Series) pour les données horodatées : alertes et notifications (Alert & Notification), historiques climatiques et préférences (Analytics & Preferences).

## 🔗 Analyse détaillée des relations entre les entités

Dans une architecture microservices pure, il n'y a **pas de clés étrangères physiques** (`@ManyToOne`, `@OneToMany` avec contrainte SQL) entre des entités qui appartiennent à des microservices différents. Les relations se font de deux manières :

- **Relations intra-services (physiques)** : à l'intérieur d'un même microservice, les entités sont directement reliées par des objets ou des identifiants.
- **Relations inter-services (logiques)** : les microservices se parlent en échangeant uniquement des IDs (ex. `cityId`, `userId`) via des appels API.

### 🔹 Microservice 1 : User Service (.NET · PostgreSQL · port 8080)

**Entités :** `User` ↔ `Role`

- **Relation physique (intra-service)** : un `User` possède un rôle principal (`Role`). C'est une relation **Many-to-One (N..1)**.
- **Exemple** : l'utilisateur Ahmed a le rôle `ADMIN`. Techniquement, la table `user` contient une colonne `role_id` qui pointe vers la table `role`.

### 🔹 Microservice 2 : Location Service (Spring Boot · PostgreSQL · port 8081)

**Entités :** `City` ↔ `Region`

- **Relation physique (intra-service)** : une `City` (ville) est rattachée à une `Region` (région ou gouvernorat). C'est une relation **Many-to-One (N..1)**.
- **Exemple** : la ville de Tunis appartient à la région de Tunis / Grand Tunis. La table `city` possède une colonne `region_id`.

### 🔹 Microservice 3 : Forecast Service (Spring Boot · MongoDB · port 8082)

**Entités :** `Forecast` ↔ `WeatherDetail`

- **Relation physique / composition (intra-service)** : un bulletin de prévision (`Forecast`) est étroitement lié à ses détails techniques atmosphériques (`WeatherDetail`). C'est une relation **One-to-One / composition (1..1)**.
- **Lien logique avec les autres services** : le `Forecast` possède un champ `cityId`. Il ne contient pas l'objet `City` en entier, mais seulement son ID numérique (provenant du Location Service). Quand l'application veut afficher la météo de Paris, elle récupère le `Forecast` grâce au `cityId = 5` et va chercher le nom de la ville via une requête HTTP vers le Location Service.

### 🔹 Microservice 4 : Alert & Notification Service (Spring Boot · InfluxDB · port 8083)

**Entités :** `Alert` ↔ `Notification`

- **Relation physique (intra-service)** : une alerte climatique (`Alert`) déclenche l'envoi de plusieurs notifications aux utilisateurs concernés (`Notification`). C'est une relation **One-to-Many (1..\*)**.
- **Liens logiques inter-services** :
  - L'`Alert` contient un `cityId` (pour savoir quelle ville est touchée, en lien avec le Location Service).
  - La `Notification` contient un `userId` (pour savoir à quel utilisateur l'envoyer, en lien logique avec le User Service).

### 🔹 Microservice 5 : IoT Sensor Service (Spring Boot · MongoDB · port 8084)

**Entités :** `Station` ↔ `SensorMeasurement`

- **Relation temporelle (intra-service)** : une station météo physique (`Station`) envoie en continu des mesures de capteurs (`SensorMeasurement`). C'est une relation **One-to-Many (1..\*)** orientée flux temporel.
- **Fonctionnement** : chaque mesure enregistre un `timestamp`, un `stationId` et des métriques (température, humidité, pluie).

### 🔹 Microservice 6 : Analytics & Preferences Service (Spring Boot · InfluxDB · port 8085)

**Entités :** `HistoricalLog` (analyses) et `UserPreference` (préférences)

- **Relations logiques (inter-services)** :
  - `HistoricalLog` utilise un `cityId` pour stocker les moyennes climatiques d'une ville (lien avec le Location Service).
  - `UserPreference` utilise un `userId` pour retenir les préférences d'affichage d'un utilisateur (ex. Celsius ou Fahrenheit, alertes activées), en lien logique avec le User Service.

## 🗺️ Schéma récapitulatif des flux

```
[ Location Service ] <--- (cityId) ---> [ Forecast Service ]
        ^                                      ^
        | (cityId)                             | (cityId)
        v                                      v
[ Alert Service ]                        [ Analytics Service ]
[ User Service ] <--- (userId) --------> [ Notification / Preferences ]
```

## 💡 En résumé pour la soutenance / présentation

> **Question :** « Comment le service de prévision sait-il à quelle ville il appartient s'il n'y a pas de clé étrangère SQL ? »
>
> **Réponse type :** « Nos microservices sont totalement découplés pour garantir l'indépendance des bases de données. Le document MongoDB `Forecast` stocke uniquement l'attribut `cityId`. Pour afficher le nom complet de la ville, notre microservice effectue un appel REST synchrone (via Spring Cloud OpenFeign) vers le Location Service en utilisant cet ID. »

## Structure du projet

```
skytrack/
├── Backend/              # Microservices (User Service en .NET, les 5 autres en Spring Boot)
├── Frontend/             # Interface utilisateur (Angular 21)
├── Documentation/
│   ├── Presentation/     # Supports de présentation
│   └── Diagrams/         # Diagrammes (UML, architecture, etc.)
└── README.md
```

## Installation

_À compléter._

## Utilisation

_À compléter._

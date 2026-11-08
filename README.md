# SkyTrack

## 🎯 Objectif du projet

**SkyTrack** est une plateforme moderne de gestion, de surveillance et d'analyse météorologique. Elle repose sur une **architecture microservices** : le système est découpé en **6 services indépendants** (un par membre de l'équipe). Chaque service possède sa propre base de données (PostgreSQL, MongoDB ou InfluxDB) et communique avec les autres via des appels REST (OpenFeign) en échangeant uniquement des identifiants logiques.

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
| 1 | User Service | .NET | `8080` | PostgreSQL | `5432` |
| 2 | Location Service | Spring Boot | `8081` | PostgreSQL | `5433` |
| 3 | Forecast Service | Spring Boot | `8082` | MongoDB | `27017` |
| 4 | Alert & Notification Service | Spring Boot | `8083` | MongoDB | `27018` |
| 5 | IoT Sensor Service | Spring Boot | `8084` | InfluxDB | `8086` |
| 6 | Analytics & Preferences Service | Spring Boot | `8085` | InfluxDB (`HistoricalLog`) + MongoDB (`UserPreference`) | `8087` / `27019` |
| – | Frontend (Angular 21) | Angular | `4200` | – | – |

> ℹ️ Chaque service a **sa propre instance** de base. On garde les ports par défaut de chaque SGBD (PostgreSQL `5432`, MongoDB `27017`, InfluxDB `8086`) et on les incrémente quand deux services utilisent le même type de base. En Docker, les conteneurs écoutent tous sur le port par défaut et seul le port hôte change (ex. `5433:5432`).

### 🧩 Pourquoi cette répartition ?

- **Autonomie** : chaque membre développe sa propre brique sans perturber le code des autres.
- **Diversité des technologies** : le projet met en pratique trois paradigmes de bases de données très recherchés en entreprise, chacun choisi selon la nature des données :
  - **PostgreSQL** (SQL relationnel) pour les données transactionnelles et structurées, avec relations : utilisateurs et rôles, villes et régions.
  - **MongoDB** (NoSQL orienté documents) pour les données flexibles, semi-structurées et **modifiables** : prévisions, alertes et notifications (le statut lu / non lu d'une notification change dans le temps), préférences utilisateur.
  - **InfluxDB** (Time-Series) pour les données **horodatées écrites en continu et rarement modifiées** : mesures des capteurs IoT, historiques climatiques agrégés.

> **Pourquoi pas InfluxDB pour les alertes ou les préférences ?** InfluxDB est optimisé pour l'ajout massif de points horodatés, mais gère mal la modification des données et ne connaît pas les relations. Une notification dont le statut change, ou une préférence (°C / °F) qu'on lit et modifie, n'est pas une série temporelle : MongoDB est le bon choix.

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

- **Relation physique / composition (intra-service)** : un bulletin de prévision (`Forecast`) est étroitement lié à ses détails techniques atmosphériques (`WeatherDetail`). C'est une relation **One-to-One / composition (1..1)** : le `WeatherDetail` est un sous-document embarqué dans le document `Forecast`.
- **Lien logique avec les autres services** : le `Forecast` possède un champ `cityId`. Il ne contient pas l'objet `City` en entier, mais seulement son ID (provenant du Location Service). Pour afficher la météo de Paris, le service récupère le `Forecast` grâce au `cityId = 5` puis va chercher le nom de la ville via une requête HTTP vers le Location Service.

### 🔹 Microservice 4 : Alert & Notification Service (Spring Boot · MongoDB · port 8083)

**Entités :** `Alert` ↔ `Notification`

- **Relation physique (intra-service)** : une alerte climatique (`Alert`) déclenche l'envoi de plusieurs notifications aux utilisateurs concernés (`Notification`). C'est une relation **One-to-Many (1..\*)** : chaque document `Notification` contient l'`alertId` de son alerte.
- **Statut modifiable** : une `Notification` possède un champ `read` (lu / non lu) mis à jour quand l'utilisateur la consulte, d'où le choix de MongoDB.
- **Liens logiques inter-services** :
  - L'`Alert` contient un `cityId` (pour savoir quelle ville est touchée, en lien avec le Location Service).
  - La `Notification` contient un `userId` (pour savoir à quel utilisateur l'envoyer, en lien logique avec le User Service).

### 🔹 Microservice 5 : IoT Sensor Service (Spring Boot · InfluxDB · port 8084)

**Entités :** `Station` ↔ `SensorMeasurement`

- **Relation temporelle (intra-service)** : une station météo physique (`Station`) envoie en continu des mesures de capteurs (`SensorMeasurement`). C'est une relation **One-to-Many (1..\*)** orientée flux temporel.
- **Fonctionnement** : chaque mesure est un point InfluxDB composé d'un `timestamp`, d'un tag `stationId` et de champs (température, humidité, pluie). C'est le cas d'usage typique d'une base Time-Series : écriture massive, lecture par intervalle de temps, pas de modification.

### 🔹 Microservice 6 : Analytics & Preferences Service (Spring Boot · InfluxDB + MongoDB · port 8085)

**Entités :** `HistoricalLog` (analyses) et `UserPreference` (préférences)

- **`HistoricalLog` → InfluxDB** : moyennes climatiques d'une ville calculées par période (jour, mois). Ce sont des données horodatées, ajoutées au fil du temps et jamais modifiées : c'est ce qui justifie InfluxDB pour ce service.
- **`UserPreference` → MongoDB** : préférences d'affichage d'un utilisateur (ex. Celsius ou Fahrenheit, alertes activées). Elles ne sont pas horodatées et doivent pouvoir être lues et modifiées, elles sont donc stockées dans une collection MongoDB propre au service.
- **Relations logiques (inter-services)** :
  - `HistoricalLog` utilise un `cityId` (lien avec le Location Service).
  - `UserPreference` utilise un `userId` (lien avec le User Service).

## 🗺️ Schéma récapitulatif des flux

Les flèches indiquent le **sens des appels REST** : le service à l'origine de la flèche appelle celui qui est pointé, jamais l'inverse.

```
[ Frontend Angular 21 :4200 ] ──REST──▶ chacun des 6 services (pas d'API Gateway)


[ Forecast :8082 ]                 ──cityId──┐
[ Alert & Notification :8083 ]     ──cityId──┼──▶ [ Location Service :8081 ]
[ Analytics & Preferences :8085 ]  ──cityId──┘

[ Alert & Notification :8083 ]     ──userId──┐
[ Analytics & Preferences :8085 ]  ──userId──┴──▶ [ User Service :8080 (.NET) ]

[ Stations météo ]  ──mesures──▶  [ IoT Sensor :8084 ]   (aucun appel vers les autres services)
```

| Service appelant | Service appelé | Identifiant échangé | Objectif |
|---|---|---|---|
| Forecast | Location | `cityId` | Afficher le nom de la ville d'une prévision |
| Alert & Notification | Location | `cityId` | Connaître la ville touchée par une alerte |
| Alert & Notification | User | `userId` | Retrouver l'utilisateur destinataire d'une notification |
| Analytics & Preferences | Location | `cityId` | Associer un historique climatique à une ville |
| Analytics & Preferences | User | `userId` | Vérifier l'utilisateur propriétaire des préférences |
| IoT Sensor | – | – | Service autonome : reçoit et stocke les mesures des stations |

> Forecast et Analytics ne s'appellent pas entre eux : ils utilisent simplement tous les deux un `cityId` qui renvoie au Location Service.

## ⚙️ Points techniques à respecter

- **Type de `userId` commun** : le User Service est en .NET et les autres services en Java. L'identifiant `User.Id` est déclaré en `long` côté C#, ce qui correspond au `Long` utilisé côté Java (`userId`). Ne pas utiliser `int` ni `Guid` côté .NET, sinon les types ne correspondent plus.
- **CORS** : il n'y a pas d'API Gateway, le frontend Angular (`http://localhost:4200`) appelle directement les 6 services. Chaque service doit donc autoriser l'origine `http://localhost:4200` :
  - Spring Boot : `@CrossOrigin(origins = "http://localhost:4200")` ou une configuration `WebMvcConfigurer` globale.
  - .NET : `builder.Services.AddCors(...)` puis `app.UseCors(...)` avec la même origine.

## 💡 En résumé pour la soutenance / présentation

> **Question :** « Comment le service de prévision sait-il à quelle ville il appartient s'il n'y a pas de clé étrangère SQL ? »
>
> **Réponse type :** « Nos microservices sont totalement découplés pour garantir l'indépendance des bases de données. Le document MongoDB `Forecast` stocke uniquement l'attribut `cityId`. Pour afficher le nom complet de la ville, notre microservice effectue un appel REST synchrone (via Spring Cloud OpenFeign) vers le Location Service en utilisant cet ID. »

> **Question :** « Pourquoi avoir choisi InfluxDB pour certains services seulement ? »
>
> **Réponse type :** « Nous avons choisi chaque base selon la nature des données. InfluxDB sert aux données horodatées écrites en continu et jamais modifiées : les mesures des capteurs IoT et les historiques climatiques. Les notifications, dont le statut change, et les préférences, qu'on lit et modifie, sont dans MongoDB. Les données structurées avec relations (utilisateurs, villes) sont dans PostgreSQL. »

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

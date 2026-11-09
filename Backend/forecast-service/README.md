# Forecast Service

Microservice **3** de SkyTrack : gestion des **prévisions météorologiques** par ville.

| | |
|---|---|
| Responsable | Med Dhia Allagui |
| Technologie | Spring Boot 3.3 (Java 17) |
| Base de données | MongoDB (`forecast_db`, port `27017`) |
| Port de l'API | `8082` |

## 1. Responsabilités (contexte borné)

Le Forecast Service est le **seul propriétaire des prévisions météo**. Il :

- crée, modifie, supprime et consulte les bulletins de prévision d'une ville pour une date donnée ;
- stocke, pour chaque prévision, les détails atmosphériques (température, humidité, vent, pression) ;
- enrichit une prévision avec le nom de la ville en interrogeant le Location Service.

Il **ne gère pas** : les villes et régions (Location Service), les alertes (Alert & Notification Service), les mesures réelles des capteurs (IoT Sensor Service), ni les moyennes historiques (Analytics Service). Une prévision est une **estimation du futur**, alors qu'une mesure IoT ou un historique décrivent le **passé** : ce sont deux capacités métier distinctes.

## 2. Modèle de données

### Entités

```
Forecast  (document de la collection "forecasts")
├── id            : String     (ObjectId MongoDB)
├── cityId        : Long       (indexé, lien logique → Location Service)
├── date          : LocalDate
├── summary       : String     (ex. "Ensoleillé", "Pluie modérée")
└── weatherDetail : WeatherDetail   ← sous-document embarqué (composition 1..1)
        ├── temperature : Double  (°C)
        ├── humidity    : Double  (%)
        ├── windSpeed   : Double  (km/h)
        └── pressure    : Double  (hPa)
```

Code : [`Forecast.java`](src/main/java/com/skytrack/forecast/entity/Forecast.java), [`WeatherDetail.java`](src/main/java/com/skytrack/forecast/entity/WeatherDetail.java).

### Exemple de document MongoDB

```json
{
  "_id": "6730f1c2a4b5c6d7e8f90123",
  "cityId": 5,
  "date": "2026-11-10",
  "summary": "Ensoleillé",
  "weatherDetail": {
    "temperature": 21.5,
    "humidity": 60.0,
    "windSpeed": 12.0,
    "pressure": 1015.0
  }
}
```

### Choix de MongoDB

- **Composition naturelle** : un `WeatherDetail` n'existe jamais sans son `Forecast`. En document, il est embarqué : une prévision se lit et s'écrit en **une seule opération**, sans jointure.
- **Données modifiables** : une prévision est corrigée quand de nouveaux modèles météo arrivent, ce que MongoDB gère simplement (contrairement à InfluxDB, fait pour l'ajout de points jamais modifiés).
- **Schéma flexible** : on pourra ajouter des champs (indice UV, probabilité de pluie…) sans migration de schéma.
- **Pas de relations entre services** : la ville n'est référencée que par `cityId`, donc une base relationnelle n'apporterait rien ici.

## 3. API REST

Base : `http://localhost:8082/api/forecasts` · format JSON.

| Méthode | URI | Description | Codes de statut |
|---|---|---|---|
| `GET` | `/api/forecasts` | Liste des prévisions. Filtres optionnels : `?cityId=5`, `?date=2026-11-10` | `200` |
| `GET` | `/api/forecasts/{id}` | Une prévision | `200`, `404` |
| `GET` | `/api/forecasts/{id}/details` | Prévision enrichie du nom de la ville (appel au Location Service) | `200`, `404` |
| `POST` | `/api/forecasts` | Créer une prévision | `201` (+ en-tête `Location`), `400`, `404` (ville inconnue), `409` (déjà une prévision pour cette ville et cette date), `503` (Location Service indisponible) |
| `PUT` | `/api/forecasts/{id}` | Modifier une prévision | `200`, `400`, `404` |
| `DELETE` | `/api/forecasts/{id}` | Supprimer une prévision | `204`, `404` |

Règles de validation (`400 Bad Request`) : `cityId`, `date` et `weatherDetail` obligatoires ; `humidity` entre 0 et 100 ; `windSpeed` ≥ 0.

Exemple de réponse de `GET /api/forecasts/{id}/details` :

```json
{
  "id": "6730f1c2a4b5c6d7e8f90123",
  "cityId": 5,
  "cityName": "Paris",
  "date": "2026-11-10",
  "summary": "Ensoleillé",
  "weatherDetail": { "temperature": 21.5, "humidity": 60.0, "windSpeed": 12.0, "pressure": 1015.0 }
}
```

## 4. Interactions avec les autres microservices

| Sens | Service | Données échangées | Mode |
|---|---|---|---|
| **Appelé par** | Frontend Angular (via l'API Gateway) | Prévisions (JSON) | Synchrone, REST |
| **Appelle** | Location Service (`GET /api/cities/{id}`) | Envoie `cityId`, reçoit `{ id, name, … }` | Synchrone, OpenFeign |

Le Forecast Service n'est appelé par aucun autre microservice et n'appelle ni le User Service, ni l'Alert, ni l'IoT, ni l'Analytics Service.

### Pourquoi synchrone (OpenFeign) ?

- À la **création** d'une prévision, il faut savoir **immédiatement** si le `cityId` existe pour accepter ou refuser la requête.
- À l'**affichage**, l'utilisateur attend le nom de la ville dans la même réponse.

Dans les deux cas, la réponse est nécessaire pour répondre au client : un échange asynchrone (message broker) ne conviendrait pas. Le client Feign appelle le service par son nom Eureka (`location-service`), sans adresse codée en dur.

### Comportement si le Location Service est indisponible

Protection par **timeout** (2 s) et **circuit breaker** (Resilience4j) sur le client Feign :

| Opération | Comportement prévu |
|---|---|
| Lecture simple (`GET /api/forecasts`, `/{id}`) | **Aucun impact** : n'appelle pas le Location Service. |
| Lecture enrichie (`GET /{id}/details`) | **Mode dégradé** : la prévision est renvoyée avec `cityName: null` (`200`). La météo reste consultable. |
| Création (`POST`) | **Refus** avec `503 Service Unavailable` : on n'enregistre pas une prévision dont la ville n'a pas pu être vérifiée. |
| Modification / suppression | Pas d'appel externe (le `cityId` n'est pas modifiable), donc aucun impact. |

## 5. Lancement

Prérequis : Java 17, Maven 3.9+, MongoDB sur `localhost:27017`.

```bash
cd Backend/forecast-service
mvn spring-boot:run
```

Le service démarre sur `http://localhost:8082`.

> État actuel (validation 1) : projet créé, entités et configuration en place, le service compile et démarre. La logique métier (repository, service, contrôleur, client Feign) sera développée après la validation de la conception.

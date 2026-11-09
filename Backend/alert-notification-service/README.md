# Alert & Notification Service

Microservice 4 of SkyTrack. Spring Boot 3.5 (Java 17), MongoDB, Spring Cloud OpenFeign. Port **8083**.

- `Alert` (collection `alerts`): `id`, `cityId`, `type`, `severity` (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), `createdAt`
- `Notification` (collection `notifications`): `id`, `alertId`, `userId`, `message`, `read`
- 1 `Alert` → * `Notification` (each notification stores its `alertId`; deleting an alert deletes its notifications)
- `cityId` is checked against the **Location Service** (`GET {LOCATION_SERVICE_URL}/api/cities/{id}`)
- `userId` is checked against the **User Service** (.NET) (`GET {USER_SERVICE_URL}/api/users/{id}`)

## Run

Start MongoDB (host port 27018):

```bash
docker compose up -d alert-mongodb
```

Start the service:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell use `.\mvnw.cmd spring-boot:run`.

If the Location / User services are not running yet, turn the remote checks off (ids are then accepted as-is):

```bash
REMOTE_CHECKS_ENABLED=false ./mvnw spring-boot:run
```

Swagger UI: http://localhost:8083/swagger-ui.html · Health: http://localhost:8083/actuator/health

### Configuration (environment variables)

| Variable | Default |
|---|---|
| `MONGODB_URI` | `mongodb://localhost:27018/skytrack_alerts` |
| `LOCATION_SERVICE_URL` | `http://localhost:8081` |
| `USER_SERVICE_URL` | `http://localhost:8080` |
| `REMOTE_CHECKS_ENABLED` | `true` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` (comma-separated) |

## API

### Alerts — `/api/alerts`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/alerts` | Create an alert; notifies `userIds` if given → `201` |
| `GET` | `/api/alerts?cityId=&severity=` | List alerts (newest first), optional filters |
| `GET` | `/api/alerts/{id}` | One alert |
| `GET` | `/api/alerts/{id}/details` | Alert + city from Location Service + notification counters |
| `PUT` | `/api/alerts/{id}` | Update `cityId`, `type`, `severity` |
| `DELETE` | `/api/alerts/{id}` | Delete the alert and its notifications → `204` |
| `GET` | `/api/alerts/{id}/notifications` | Notifications sent for this alert |
| `POST` | `/api/alerts/{id}/notifications` | Notify more users (`{ "userIds": [..], "message": ".." }`) → `201` |

```json
POST /api/alerts
{
  "cityId": 5,
  "type": "CANICULE",
  "severity": "HIGH",
  "userIds": [1, 2],
  "message": "Températures supérieures à 45°C attendues demain"
}
```

`message` is optional: by default it is `Alerte <type> (<severity>) pour <city name>`. A user already notified for an alert is skipped.

### Notifications — `/api/notifications`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications?userId=&read=` | All notifications, or one user's, optionally only read/unread |
| `GET` | `/api/notifications/unread-count?userId=` | `{ "userId": 1, "unread": 3 }` |
| `GET` | `/api/notifications/{id}` | One notification |
| `PATCH` | `/api/notifications/{id}/read` | Mark as read |
| `PATCH` | `/api/notifications/read-all?userId=` | Mark all of a user's notifications as read |
| `DELETE` | `/api/notifications/{id}` | Delete → `204` |

### Errors

Errors are returned as RFC 7807 `application/problem+json`:

- `400`: invalid body (the `errors` field lists the invalid fields)
- `404`: alert / notification not found, or `cityId` / `userId` unknown to the Location / User service
- `503`: the Location or User service cannot be reached

## Tests

```bash
./mvnw test
```

The tests mock MongoDB and the Feign clients, so they need neither a database nor the other services.

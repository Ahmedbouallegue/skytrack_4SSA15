# Eureka Server

Serveur de découverte (service registry) de SkyTrack.

| | |
|---|---|
| Technologie | Spring Boot 3.3 + Spring Cloud Netflix Eureka (2023.0.3), Java 17 |
| Port | `8761` |
| Tableau de bord | http://localhost:8761 |

## Rôle

Chaque microservice s'enregistre auprès d'Eureka sous son `spring.application.name` (par exemple `forecast-service`). Les autres services le retrouvent ensuite par ce nom (OpenFeign, API Gateway), sans adresse codée en dur. Le serveur ne s'enregistre pas lui-même (`register-with-eureka=false`, `fetch-registry=false`).

## Lancement

Prérequis : Java 17, Maven 3.9+. À démarrer **avant** les autres microservices.

```bash
cd Backend/eureka-server
mvn spring-boot:run
```

Tableau de bord : http://localhost:8761 · santé : http://localhost:8761/actuator/health

package com.skytrack.forecast.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.skytrack.forecast.entity.Forecast;

/**
 * Indicateur de santé personnalisé, publié dans /actuator/health sous le nom « forecastStore ».
 *
 * Vérifie que la collection MongoDB des prévisions est lisible et indique combien de prévisions
 * elle contient. Si la lecture échoue, le composant passe DOWN, donc le service passe DOWN
 * dans /actuator/health et, grâce à eureka.client.healthcheck.enabled, dans Eureka.
 *
 * Volontairement, cet indicateur ne dépend PAS du Location Service : si Location tombe,
 * le Forecast Service reste disponible en mode dégradé (cityName = null). Le faire passer DOWN
 * propagerait la panne d'un service à un autre, ce que l'architecture cherche justement à éviter.
 */
@Component("forecastStore")
public class ForecastStoreHealthIndicator implements HealthIndicator {

    private final MongoTemplate mongoTemplate;

    public ForecastStoreHealthIndicator(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Health health() {
        String collection = mongoTemplate.getCollectionName(Forecast.class);
        try {
            long count = mongoTemplate.count(new Query(), Forecast.class);
            return Health.up()
                    .withDetail("collection", collection)
                    .withDetail("forecasts", count)
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("collection", collection)
                    .withDetail("error", e.getClass().getSimpleName() + ": " + e.getMessage())
                    .build();
        }
    }
}

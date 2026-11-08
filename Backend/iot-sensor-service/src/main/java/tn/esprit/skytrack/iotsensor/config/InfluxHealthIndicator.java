package tn.esprit.skytrack.iotsensor.config;

import com.influxdb.client.InfluxDBClient;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class InfluxHealthIndicator implements HealthIndicator {
    private final InfluxDBClient client;

    public InfluxHealthIndicator(InfluxDBClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        try {
            return client.ping() ? Health.up().build() : Health.down().withDetail("influxdb", "unreachable").build();
        } catch (RuntimeException exception) {
            return Health.down(exception).build();
        }
    }
}

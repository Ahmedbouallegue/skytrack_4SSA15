package tn.esprit.skytrack.iotsensor.model;

import java.time.Instant;

public record SensorMeasurement(
        String stationId,
        Double temperature,
        Instant timestamp
) {
}

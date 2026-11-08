package tn.esprit.skytrack.iotsensor.dto;

import java.time.Instant;

public record MeasurementStatsResponse(
        Instant windowStart,
        Instant windowEnd,
        Double temperatureMin,
        Double temperatureMax,
        Double temperatureMean
) {
}

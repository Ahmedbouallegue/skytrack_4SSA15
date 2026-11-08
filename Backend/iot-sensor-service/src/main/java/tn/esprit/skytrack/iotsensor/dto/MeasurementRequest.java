package tn.esprit.skytrack.iotsensor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.time.Instant;

public record MeasurementRequest(
        @NotBlank String stationId,
        @NotNull @DecimalMin("-90") @DecimalMax("60") Double temperature,
        Instant timestamp
) {
}

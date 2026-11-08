package tn.esprit.skytrack.iotsensor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record MeasurementBatchRequest(
        @NotEmpty @Size(max = 500) List<@Valid MeasurementRequest> measurements
) {
}

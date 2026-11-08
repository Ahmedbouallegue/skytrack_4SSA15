package tn.esprit.skytrack.iotsensor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StationUpdateRequest(
        @NotNull Long cityId,
        @NotBlank @Size(max = 120) String name
) {
}

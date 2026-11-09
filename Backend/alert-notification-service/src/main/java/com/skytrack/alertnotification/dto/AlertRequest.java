package com.skytrack.alertnotification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Body for creating / updating an alert.
 * On creation, {@code userIds} (optional) are the users to notify right away and
 * {@code message} (optional) is the notification text; a default text is generated otherwise.
 * Both are ignored on update.
 */
public record AlertRequest(
        @NotNull @Positive Long cityId,
        @NotBlank @Size(max = 50) String type,
        @NotBlank @Pattern(regexp = "LOW|MEDIUM|HIGH|CRITICAL",
                message = "must be one of LOW, MEDIUM, HIGH, CRITICAL") String severity,
        List<@NotNull @Positive Long> userIds,
        @Size(max = 500) String message
) {
}

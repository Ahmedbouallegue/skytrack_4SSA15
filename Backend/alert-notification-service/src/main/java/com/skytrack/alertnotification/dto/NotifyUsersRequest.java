package com.skytrack.alertnotification.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Body for sending an existing alert to (more) users. */
public record NotifyUsersRequest(
        @NotEmpty List<@NotNull @Positive Long> userIds,
        @Size(max = 500) String message
) {
}

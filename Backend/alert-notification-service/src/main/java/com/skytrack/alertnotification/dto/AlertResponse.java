package com.skytrack.alertnotification.dto;

import com.skytrack.alertnotification.model.Alert;

import java.time.LocalDateTime;

public record AlertResponse(
        String id,
        Long cityId,
        String type,
        String severity,
        LocalDateTime createdAt
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(alert.getId(), alert.getCityId(), alert.getType(),
                alert.getSeverity(), alert.getCreatedAt());
    }
}

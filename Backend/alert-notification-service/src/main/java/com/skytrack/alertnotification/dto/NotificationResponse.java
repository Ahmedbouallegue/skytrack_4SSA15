package com.skytrack.alertnotification.dto;

import com.skytrack.alertnotification.model.Notification;

public record NotificationResponse(
        String id,
        String alertId,
        Long userId,
        String message,
        boolean read
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getAlertId(), n.getUserId(), n.getMessage(),
                Boolean.TRUE.equals(n.getRead()));
    }
}

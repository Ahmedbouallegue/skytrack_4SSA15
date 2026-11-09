package com.skytrack.alertnotification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * A notification sent to a user because of an {@link Alert} (1 alert -> * notifications).
 * {@code alertId} is an intra-service reference; {@code userId} is a logical reference to the User Service.
 * {@code read} changes over time, which is why this lives in MongoDB rather than InfluxDB.
 */
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String alertId;

    @Indexed
    private Long userId;

    private String message;

    private Boolean read = false;

    public Notification() {
    }

    public Notification(String alertId, Long userId, String message) {
        this.alertId = alertId;
        this.userId = userId;
        this.message = message;
        this.read = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAlertId() { return alertId; }
    public void setAlertId(String alertId) { this.alertId = alertId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
}

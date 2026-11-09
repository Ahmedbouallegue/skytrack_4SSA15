package com.skytrack.alertnotification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A climate alert for a city. {@code cityId} is a logical reference to the Location Service
 * (no physical foreign key across microservices).
 */
@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    @Indexed
    private Long cityId;

    private String type;

    private String severity;

    private LocalDateTime createdAt;

    public Alert() {
    }

    public Alert(Long cityId, String type, String severity, LocalDateTime createdAt) {
        this.cityId = cityId;
        this.type = type;
        this.severity = severity;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

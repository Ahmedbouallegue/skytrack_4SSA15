package com.skytrack.analytics.preference.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_preferences")
public class UserPreference {

    @Id
    private String id;

    @NotBlank(message = "userId is required")
    @Indexed(unique = true)
    private String userId;

    @NotBlank(message = "temperatureUnit is required")
    private String temperatureUnit;

    @NotBlank(message = "language is required")
    private String language;

    @NotNull(message = "alertsEnabled is required")
    private Boolean alertsEnabled;
}

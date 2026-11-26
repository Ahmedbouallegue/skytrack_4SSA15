package com.skytrack.alertnotification.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** City as returned by the Location Service (GET /api/cities/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CityDto(Long id, String name, Double latitude, Double longitude, Long regionId) {
}

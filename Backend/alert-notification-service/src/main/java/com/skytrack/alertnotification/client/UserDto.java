package com.skytrack.alertnotification.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** User as returned by the User Service (GET /api/users/{id}). Only public fields are read. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UserDto(Long id, String username, String email) {
}

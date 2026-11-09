package com.skytrack.alertnotification.dto;

import com.skytrack.alertnotification.client.CityDto;

/**
 * An alert enriched with its city (fetched from the Location Service through OpenFeign)
 * and notification counters. {@code city} is null when the Location Service is unreachable.
 */
public record AlertDetailsResponse(
        AlertResponse alert,
        CityDto city,
        long notificationCount,
        long readCount
) {
}

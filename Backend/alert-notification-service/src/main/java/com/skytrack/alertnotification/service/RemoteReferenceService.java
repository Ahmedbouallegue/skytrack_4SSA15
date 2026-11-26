package com.skytrack.alertnotification.service;

import com.skytrack.alertnotification.client.CityDto;
import com.skytrack.alertnotification.client.LocationClient;
import com.skytrack.alertnotification.client.UserClient;
import com.skytrack.alertnotification.exception.RemoteServiceUnavailableException;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Checks the logical references ({@code cityId}, {@code userId}) against the services that own them.
 * There is no foreign key across microservices, so this REST call (OpenFeign) is how integrity is kept.
 */
@Service
public class RemoteReferenceService {

    private static final Logger log = LoggerFactory.getLogger(RemoteReferenceService.class);

    private final LocationClient locationClient;
    private final UserClient userClient;
    private final boolean checksEnabled;

    public RemoteReferenceService(LocationClient locationClient,
                                  UserClient userClient,
                                  @Value("${skytrack.remote-checks.enabled:true}") boolean checksEnabled) {
        this.locationClient = locationClient;
        this.userClient = userClient;
        this.checksEnabled = checksEnabled;
    }

    /**
     * Fails with 404 if the city does not exist, 503 if the Location Service cannot be reached.
     * Returns the city, or empty when remote checks are disabled.
     */
    public Optional<CityDto> requireCity(Long cityId) {
        if (!checksEnabled) {
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(locationClient.getCityById(cityId));
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("City", cityId);
        } catch (FeignException e) {
            throw new RemoteServiceUnavailableException("Location Service", e);
        }
    }

    /** Fails with 404 if the user does not exist, 503 if the User Service cannot be reached. */
    public void requireUser(Long userId) {
        if (!checksEnabled) {
            return;
        }
        try {
            userClient.getUserById(userId);
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User", userId);
        } catch (FeignException e) {
            throw new RemoteServiceUnavailableException("User Service", e);
        }
    }

    /** Best-effort lookup used for display: never fails, returns empty if the city cannot be fetched. */
    public Optional<CityDto> findCity(Long cityId) {
        try {
            return Optional.ofNullable(locationClient.getCityById(cityId));
        } catch (FeignException e) {
            log.warn("Could not fetch city {} from Location Service: {}", cityId, e.getMessage());
            return Optional.empty();
        }
    }
}

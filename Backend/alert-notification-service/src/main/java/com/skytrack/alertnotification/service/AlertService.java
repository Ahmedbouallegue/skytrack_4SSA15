package com.skytrack.alertnotification.service;

import com.skytrack.alertnotification.client.CityDto;
import com.skytrack.alertnotification.dto.AlertDetailsResponse;
import com.skytrack.alertnotification.dto.AlertRequest;
import com.skytrack.alertnotification.dto.AlertResponse;
import com.skytrack.alertnotification.dto.NotificationResponse;
import com.skytrack.alertnotification.dto.NotifyUsersRequest;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import com.skytrack.alertnotification.model.Alert;
import com.skytrack.alertnotification.repository.AlertRepository;
import com.skytrack.alertnotification.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt");

    private final AlertRepository alertRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final RemoteReferenceService remoteReferences;
    private final Clock clock;

    public AlertService(AlertRepository alertRepository,
                        NotificationRepository notificationRepository,
                        NotificationService notificationService,
                        RemoteReferenceService remoteReferences,
                        Optional<Clock> clock) {
        this.alertRepository = alertRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.remoteReferences = remoteReferences;
        this.clock = clock.orElseGet(Clock::systemDefaultZone);
    }

    /** Creates the alert (after checking the city exists) and notifies {@code userIds} if given. */
    public AlertResponse create(AlertRequest request) {
        Optional<CityDto> city = remoteReferences.requireCity(request.cityId());

        Alert alert = alertRepository.save(new Alert(
                request.cityId(), request.type().trim(), request.severity(), LocalDateTime.now(clock)));

        if (request.userIds() != null && !request.userIds().isEmpty()) {
            String message = messageOrDefault(request.message(), alert, city.orElse(null));
            notificationService.notifyUsers(alert, request.userIds(), message);
        }
        return AlertResponse.from(alert);
    }

    public List<AlertResponse> findAll(Long cityId, String severity) {
        if (severity != null) {
            severity = severity.trim().toUpperCase(java.util.Locale.ROOT);
        }
        List<Alert> alerts;
        if (cityId != null && severity != null) {
            alerts = alertRepository.findByCityIdAndSeverity(cityId, severity, NEWEST_FIRST);
        } else if (cityId != null) {
            alerts = alertRepository.findByCityId(cityId, NEWEST_FIRST);
        } else if (severity != null) {
            alerts = alertRepository.findBySeverity(severity, NEWEST_FIRST);
        } else {
            alerts = alertRepository.findAll(NEWEST_FIRST);
        }
        return alerts.stream().map(AlertResponse::from).toList();
    }

    public AlertResponse findById(String id) {
        return AlertResponse.from(getOrThrow(id));
    }

    /** The alert plus its city name from the Location Service (cityId -> REST call -> City). */
    public AlertDetailsResponse getDetails(String id) {
        Alert alert = getOrThrow(id);
        CityDto city = remoteReferences.findCity(alert.getCityId()).orElse(null);
        long total = notificationRepository.countByAlertId(id);
        long read = notificationRepository.countByAlertIdAndRead(id, true);
        return new AlertDetailsResponse(AlertResponse.from(alert), city, total, read);
    }

    public AlertResponse update(String id, AlertRequest request) {
        Alert alert = getOrThrow(id);
        if (!alert.getCityId().equals(request.cityId())) {
            remoteReferences.requireCity(request.cityId());
        }
        alert.setCityId(request.cityId());
        alert.setType(request.type().trim());
        alert.setSeverity(request.severity());
        return AlertResponse.from(alertRepository.save(alert));
    }

    /** Deletes the alert and its notifications (composition inside this service). */
    public void delete(String id) {
        Alert alert = getOrThrow(id);
        notificationRepository.deleteByAlertId(alert.getId());
        alertRepository.delete(alert);
    }

    public List<NotificationResponse> findNotifications(String alertId) {
        getOrThrow(alertId);
        return notificationService.findByAlert(alertId);
    }

    public List<NotificationResponse> notifyUsers(String alertId, NotifyUsersRequest request) {
        Alert alert = getOrThrow(alertId);
        String message = messageOrDefault(request.message(), alert,
                remoteReferences.findCity(alert.getCityId()).orElse(null));
        return notificationService.notifyUsers(alert, request.userIds(), message);
    }

    private Alert getOrThrow(String id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", id));
    }

    private static String messageOrDefault(String message, Alert alert, CityDto city) {
        if (message != null && !message.isBlank()) {
            return message.trim();
        }
        String place = (city != null && city.name() != null) ? city.name() : "la ville #" + alert.getCityId();
        return "Alerte " + alert.getType() + " (" + alert.getSeverity() + ") pour " + place;
    }
}

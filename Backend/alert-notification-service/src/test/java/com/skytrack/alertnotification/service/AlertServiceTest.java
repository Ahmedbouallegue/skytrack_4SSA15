package com.skytrack.alertnotification.service;

import com.skytrack.alertnotification.client.CityDto;
import com.skytrack.alertnotification.dto.AlertDetailsResponse;
import com.skytrack.alertnotification.dto.AlertRequest;
import com.skytrack.alertnotification.dto.AlertResponse;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import com.skytrack.alertnotification.model.Alert;
import com.skytrack.alertnotification.repository.AlertRepository;
import com.skytrack.alertnotification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-07-01T10:00:00Z"), ZoneOffset.UTC);

    @Mock AlertRepository alertRepository;
    @Mock NotificationRepository notificationRepository;
    @Mock NotificationService notificationService;
    @Mock RemoteReferenceService remoteReferences;

    AlertService service;

    @BeforeEach
    void setUp() {
        service = new AlertService(alertRepository, notificationRepository, notificationService,
                remoteReferences, Optional.of(CLOCK));
    }

    private static Alert savedAlert(String id, Long cityId) {
        Alert alert = new Alert(cityId, "CANICULE", "HIGH", LocalDateTime.now(CLOCK));
        alert.setId(id);
        return alert;
    }

    @Test
    void create_checksCity_savesAlert_andNotifiesUsersWithDefaultMessage() {
        when(remoteReferences.requireCity(5L))
                .thenReturn(Optional.of(new CityDto(5L, "Tunis", 36.8, 10.18, 1L)));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> {
            Alert a = inv.getArgument(0);
            a.setId("a1");
            return a;
        });

        AlertResponse response = service.create(
                new AlertRequest(5L, " CANICULE ", "HIGH", List.of(1L, 2L), null));

        assertThat(response.id()).isEqualTo("a1");
        assertThat(response.type()).isEqualTo("CANICULE");
        assertThat(response.createdAt()).isEqualTo(LocalDateTime.of(2026, 7, 1, 10, 0));

        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(notificationService).notifyUsers(any(Alert.class), eq(List.of(1L, 2L)), message.capture());
        assertThat(message.getValue()).isEqualTo("Alerte CANICULE (HIGH) pour Tunis");
    }

    @Test
    void create_withoutUsers_doesNotNotify() {
        when(remoteReferences.requireCity(5L)).thenReturn(Optional.empty());
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(new AlertRequest(5L, "TEMPETE", "LOW", null, null));

        verify(notificationService, never()).notifyUsers(any(), anyCollection(), anyString());
    }

    @Test
    void create_unknownCity_savesNothing() {
        when(remoteReferences.requireCity(99L)).thenThrow(new ResourceNotFoundException("City", 99L));

        assertThatThrownBy(() -> service.create(new AlertRequest(99L, "TEMPETE", "LOW", List.of(1L), null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("City");
        verify(alertRepository, never()).save(any());
    }

    @Test
    void update_sameCity_doesNotCallLocationService() {
        when(alertRepository.findById("a1")).thenReturn(Optional.of(savedAlert("a1", 5L)));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        AlertResponse response = service.update("a1", new AlertRequest(5L, "INONDATION", "CRITICAL", null, null));

        assertThat(response.severity()).isEqualTo("CRITICAL");
        verify(remoteReferences, never()).requireCity(any());
    }

    @Test
    void delete_removesNotificationsThenAlert() {
        Alert alert = savedAlert("a1", 5L);
        when(alertRepository.findById("a1")).thenReturn(Optional.of(alert));

        service.delete("a1");

        var order = inOrder(notificationRepository, alertRepository);
        order.verify(notificationRepository).deleteByAlertId("a1");
        order.verify(alertRepository).delete(alert);
    }

    @Test
    void findById_missing_throws404() {
        when(alertRepository.findById("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("nope")).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getDetails_returnsNullCityWhenLocationServiceDown() {
        when(alertRepository.findById("a1")).thenReturn(Optional.of(savedAlert("a1", 5L)));
        when(remoteReferences.findCity(5L)).thenReturn(Optional.empty());
        when(notificationRepository.countByAlertId("a1")).thenReturn(3L);
        when(notificationRepository.countByAlertIdAndRead("a1", true)).thenReturn(1L);

        AlertDetailsResponse details = service.getDetails("a1");

        assertThat(details.city()).isNull();
        assertThat(details.notificationCount()).isEqualTo(3);
        assertThat(details.readCount()).isEqualTo(1);
    }
}

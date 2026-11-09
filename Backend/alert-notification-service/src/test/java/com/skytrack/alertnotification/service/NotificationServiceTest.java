package com.skytrack.alertnotification.service;

import com.skytrack.alertnotification.dto.NotificationResponse;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import com.skytrack.alertnotification.model.Alert;
import com.skytrack.alertnotification.model.Notification;
import com.skytrack.alertnotification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;
    @Mock RemoteReferenceService remoteReferences;
    @InjectMocks NotificationService service;

    private static Alert alert() {
        Alert alert = new Alert(5L, "CANICULE", "HIGH", null);
        alert.setId("a1");
        return alert;
    }

    @Test
    void notifyUsers_skipsDuplicatesAndAlreadyNotifiedUsers() {
        when(notificationRepository.existsByAlertIdAndUserId("a1", 1L)).thenReturn(true);
        when(notificationRepository.existsByAlertIdAndUserId("a1", 2L)).thenReturn(false);
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> new ArrayList<>(inv.<List<Notification>>getArgument(0)));

        List<NotificationResponse> created = service.notifyUsers(alert(), List.of(1L, 2L, 2L), "msg");

        assertThat(created).singleElement().satisfies(n -> {
            assertThat(n.userId()).isEqualTo(2L);
            assertThat(n.alertId()).isEqualTo("a1");
            assertThat(n.read()).isFalse();
            assertThat(n.message()).isEqualTo("msg");
        });
        verify(remoteReferences).requireUser(2L);
        verify(remoteReferences, never()).requireUser(1L);
    }

    @Test
    void notifyUsers_unknownUser_savesNothing() {
        doThrow(new ResourceNotFoundException("User", 42L)).when(remoteReferences).requireUser(eq(42L));
        org.mockito.Mockito.lenient().doNothing().when(remoteReferences).requireUser(eq(1L));

        assertThatThrownBy(() -> service.notifyUsers(alert(), List.of(1L, 42L), "msg"))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(notificationRepository, never()).saveAll(anyList());
    }

    @Test
    void markAsRead_setsReadFlag() {
        Notification n = new Notification("a1", 1L, "msg");
        n.setId("n1");
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.markAsRead("n1").read()).isTrue();
    }

    @Test
    void markAllAsRead_updatesOnlyUnread() {
        List<Notification> unread = List.of(new Notification("a1", 1L, "x"), new Notification("a2", 1L, "y"));
        when(notificationRepository.findByUserIdAndRead(eq(1L), eq(false), any())).thenReturn(unread);

        int updated = service.markAllAsRead(1L);

        assertThat(updated).isEqualTo(2);
        assertThat(unread).allMatch(Notification::getRead);
        verify(notificationRepository).saveAll(unread);
    }
}

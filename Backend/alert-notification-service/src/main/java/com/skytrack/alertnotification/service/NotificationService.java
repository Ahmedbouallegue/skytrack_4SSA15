package com.skytrack.alertnotification.service;

import com.skytrack.alertnotification.dto.NotificationResponse;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import com.skytrack.alertnotification.model.Alert;
import com.skytrack.alertnotification.model.Notification;
import com.skytrack.alertnotification.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class NotificationService {

    /** ObjectIds grow with insertion time, so sorting on _id gives newest first. */
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "_id");

    private final NotificationRepository notificationRepository;
    private final RemoteReferenceService remoteReferences;

    public NotificationService(NotificationRepository notificationRepository,
                               RemoteReferenceService remoteReferences) {
        this.notificationRepository = notificationRepository;
        this.remoteReferences = remoteReferences;
    }

    /**
     * Creates one notification per user for the given alert. Duplicate ids and users already
     * notified for this alert are skipped. Every user is checked against the User Service first,
     * so nothing is saved if one id is unknown.
     */
    public List<NotificationResponse> notifyUsers(Alert alert, Collection<Long> userIds, String message) {
        List<Long> targets = new LinkedHashSet<>(userIds).stream()
                .filter(userId -> !notificationRepository.existsByAlertIdAndUserId(alert.getId(), userId))
                .toList();

        targets.forEach(remoteReferences::requireUser);

        List<Notification> notifications = targets.stream()
                .map(userId -> new Notification(alert.getId(), userId, message))
                .toList();

        return notificationRepository.saveAll(notifications).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public List<NotificationResponse> findAll(Long userId, Boolean read) {
        List<Notification> result;
        if (userId == null) {
            result = notificationRepository.findAll(NEWEST_FIRST);
        } else if (read == null) {
            result = notificationRepository.findByUserId(userId, NEWEST_FIRST);
        } else {
            result = notificationRepository.findByUserIdAndRead(userId, read, NEWEST_FIRST);
        }
        return result.stream().map(NotificationResponse::from).toList();
    }

    public List<NotificationResponse> findByAlert(String alertId) {
        return notificationRepository.findByAlertId(alertId, NEWEST_FIRST).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public NotificationResponse findById(String id) {
        return NotificationResponse.from(getOrThrow(id));
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public NotificationResponse markAsRead(String id) {
        Notification notification = getOrThrow(id);
        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }
        return NotificationResponse.from(notification);
    }

    /** Marks all unread notifications of a user as read and returns how many were updated. */
    public int markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false, NEWEST_FIRST);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    public void delete(String id) {
        notificationRepository.delete(getOrThrow(id));
    }

    private Notification getOrThrow(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
    }
}

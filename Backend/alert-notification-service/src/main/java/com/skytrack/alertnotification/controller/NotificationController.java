package com.skytrack.alertnotification.controller;

import com.skytrack.alertnotification.dto.NotificationResponse;
import com.skytrack.alertnotification.dto.UnreadCountResponse;
import com.skytrack.alertnotification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** All notifications, or those of one user ({@code userId}), optionally filtered by {@code read}. */
    @GetMapping
    public List<NotificationResponse> findAll(@RequestParam(required = false) Long userId,
                                              @RequestParam(required = false) Boolean read) {
        return notificationService.findAll(userId, read);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@RequestParam Long userId) {
        return new UnreadCountResponse(userId, notificationService.countUnread(userId));
    }

    @GetMapping("/{id}")
    public NotificationResponse findById(@PathVariable String id) {
        return notificationService.findById(id);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable String id) {
        return notificationService.markAsRead(id);
    }

    @PatchMapping("/read-all")
    public Map<String, Object> markAllAsRead(@RequestParam Long userId) {
        return Map.of("userId", userId, "updated", notificationService.markAllAsRead(userId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        notificationService.delete(id);
    }
}

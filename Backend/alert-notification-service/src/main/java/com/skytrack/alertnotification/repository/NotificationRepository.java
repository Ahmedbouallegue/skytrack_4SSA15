package com.skytrack.alertnotification.repository;

import com.skytrack.alertnotification.model.Notification;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByAlertId(String alertId, Sort sort);

    List<Notification> findByUserId(Long userId, Sort sort);

    List<Notification> findByUserIdAndRead(Long userId, Boolean read, Sort sort);

    long countByAlertId(String alertId);

    long countByAlertIdAndRead(String alertId, Boolean read);

    long countByUserIdAndRead(Long userId, Boolean read);

    boolean existsByAlertIdAndUserId(String alertId, Long userId);

    void deleteByAlertId(String alertId);
}

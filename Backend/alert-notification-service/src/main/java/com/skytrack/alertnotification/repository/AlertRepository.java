package com.skytrack.alertnotification.repository;

import com.skytrack.alertnotification.model.Alert;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlertRepository extends MongoRepository<Alert, String> {

    List<Alert> findByCityId(Long cityId, Sort sort);

    List<Alert> findBySeverity(String severity, Sort sort);

    List<Alert> findByCityIdAndSeverity(Long cityId, String severity, Sort sort);
}

package com.skytrack.alertnotification.controller;

import com.skytrack.alertnotification.dto.AlertDetailsResponse;
import com.skytrack.alertnotification.dto.AlertRequest;
import com.skytrack.alertnotification.dto.AlertResponse;
import com.skytrack.alertnotification.dto.NotificationResponse;
import com.skytrack.alertnotification.dto.NotifyUsersRequest;
import com.skytrack.alertnotification.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping
    public ResponseEntity<AlertResponse> create(@Valid @RequestBody AlertRequest request) {
        AlertResponse created = alertService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public List<AlertResponse> findAll(@RequestParam(required = false) Long cityId,
                                       @RequestParam(required = false) String severity) {
        return alertService.findAll(cityId, severity);
    }

    @GetMapping("/{id}")
    public AlertResponse findById(@PathVariable String id) {
        return alertService.findById(id);
    }

    @GetMapping("/{id}/details")
    public AlertDetailsResponse getDetails(@PathVariable String id) {
        return alertService.getDetails(id);
    }

    @PutMapping("/{id}")
    public AlertResponse update(@PathVariable String id, @Valid @RequestBody AlertRequest request) {
        return alertService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        alertService.delete(id);
    }

    @GetMapping("/{id}/notifications")
    public List<NotificationResponse> findNotifications(@PathVariable String id) {
        return alertService.findNotifications(id);
    }

    @PostMapping("/{id}/notifications")
    @ResponseStatus(HttpStatus.CREATED)
    public List<NotificationResponse> notifyUsers(@PathVariable String id,
                                                  @Valid @RequestBody NotifyUsersRequest request) {
        return alertService.notifyUsers(id, request);
    }
}

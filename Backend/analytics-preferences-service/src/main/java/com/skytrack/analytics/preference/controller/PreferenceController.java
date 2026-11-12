package com.skytrack.analytics.preference.controller;

import com.skytrack.analytics.preference.model.UserPreference;
import com.skytrack.analytics.preference.service.PreferenceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preferences")
public class PreferenceController {

    private final PreferenceService preferenceService;

    public PreferenceController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserPreference> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(preferenceService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserPreference> create(@Valid @RequestBody UserPreference preference) {
        return ResponseEntity.status(HttpStatus.CREATED).body(preferenceService.create(preference));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserPreference> update(
            @PathVariable String userId,
            @RequestBody UserPreference preference) {
        return ResponseEntity.ok(preferenceService.update(userId, preference));
    }
}

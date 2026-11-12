package com.skytrack.analytics.preference.service;

import com.skytrack.analytics.preference.exception.InvalidPreferenceException;
import com.skytrack.analytics.preference.exception.PreferenceAlreadyExistsException;
import com.skytrack.analytics.preference.exception.PreferenceNotFoundException;
import com.skytrack.analytics.preference.model.UserPreference;
import com.skytrack.analytics.preference.repository.UserPreferenceRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class PreferenceService {

    private static final Set<String> SUPPORTED_TEMPERATURE_UNITS = Set.of("CELSIUS", "FAHRENHEIT");

    private final UserPreferenceRepository repository;

    public PreferenceService(UserPreferenceRepository repository) {
        this.repository = repository;
    }

    public UserPreference getByUserId(String userId) {
        String normalizedUserId = requireText(userId, "userId");
        return repository.findByUserId(normalizedUserId)
                .orElseThrow(() -> new PreferenceNotFoundException(normalizedUserId));
    }

    public UserPreference create(UserPreference preference) {
        validateAndNormalize(preference);
        preference.setId(null);

        if (repository.findByUserId(preference.getUserId()).isPresent()) {
            throw new PreferenceAlreadyExistsException(preference.getUserId());
        }

        try {
            return repository.save(preference);
        } catch (DuplicateKeyException exception) {
            throw new PreferenceAlreadyExistsException(preference.getUserId());
        }
    }

    public UserPreference update(String userId, UserPreference requestedPreference) {
        String normalizedUserId = requireText(userId, "userId");
        if (requestedPreference == null) {
            throw new InvalidPreferenceException("Preference request body is required");
        }

        if (requestedPreference.getUserId() != null
                && !normalizedUserId.equals(requestedPreference.getUserId().trim())) {
            throw new InvalidPreferenceException("userId in the request body must match the path userId");
        }

        UserPreference existing = repository.findByUserId(normalizedUserId)
                .orElseThrow(() -> new PreferenceNotFoundException(normalizedUserId));

        existing.setTemperatureUnit(requestedPreference.getTemperatureUnit());
        existing.setLanguage(requestedPreference.getLanguage());
        existing.setAlertsEnabled(requestedPreference.getAlertsEnabled());
        validateAndNormalize(existing);

        return repository.save(existing);
    }

    private void validateAndNormalize(UserPreference preference) {
        if (preference == null) {
            throw new InvalidPreferenceException("Preference request body is required");
        }

        preference.setUserId(requireText(preference.getUserId(), "userId"));
        preference.setLanguage(requireText(preference.getLanguage(), "language").toLowerCase(Locale.ROOT));

        String temperatureUnit = requireText(preference.getTemperatureUnit(), "temperatureUnit")
                .toUpperCase(Locale.ROOT);
        if (!SUPPORTED_TEMPERATURE_UNITS.contains(temperatureUnit)) {
            throw new InvalidPreferenceException(
                    "temperatureUnit must be one of: " + String.join(", ", SUPPORTED_TEMPERATURE_UNITS));
        }
        preference.setTemperatureUnit(temperatureUnit);

        if (preference.getAlertsEnabled() == null) {
            throw new InvalidPreferenceException("alertsEnabled is required");
        }
    }

    private String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidPreferenceException(fieldName + " is required");
        }
        return value.trim();
    }
}

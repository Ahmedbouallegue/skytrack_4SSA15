package com.skytrack.analytics.preference.service;

import com.skytrack.analytics.preference.exception.InvalidPreferenceException;
import com.skytrack.analytics.preference.exception.PreferenceAlreadyExistsException;
import com.skytrack.analytics.preference.exception.PreferenceNotFoundException;
import com.skytrack.analytics.preference.model.UserPreference;
import com.skytrack.analytics.preference.repository.UserPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PreferenceServiceTest {

    @Mock
    private UserPreferenceRepository repository;

    private PreferenceService service;

    @BeforeEach
    void setUp() {
        service = new PreferenceService(repository);
    }

    @Test
    void createsAndNormalizesAValidPreference() {
        UserPreference preference = preference(" user-1 ", "celsius", " EN ", true);
        when(repository.findByUserId("user-1")).thenReturn(Optional.empty());
        when(repository.save(preference)).thenAnswer(invocation -> invocation.getArgument(0));

        UserPreference result = service.create(preference);

        assertThat(result.getUserId()).isEqualTo("user-1");
        assertThat(result.getTemperatureUnit()).isEqualTo("CELSIUS");
        assertThat(result.getLanguage()).isEqualTo("en");
        verify(repository).save(preference);
    }

    @Test
    void rejectsUnsupportedTemperatureUnit() {
        UserPreference preference = preference("user-1", "kelvin", "en", true);

        assertThatThrownBy(() -> service.create(preference))
                .isInstanceOf(InvalidPreferenceException.class)
                .hasMessageContaining("temperatureUnit");
        verify(repository, never()).save(preference);
    }

    @Test
    void rejectsDuplicatePreferencesForAUser() {
        UserPreference preference = preference("user-1", "CELSIUS", "en", true);
        when(repository.findByUserId("user-1")).thenReturn(Optional.of(preference));

        assertThatThrownBy(() -> service.create(preference))
                .isInstanceOf(PreferenceAlreadyExistsException.class);
        verify(repository, never()).save(preference);
    }

    @Test
    void returnsExistingPreferenceByUserId() {
        UserPreference preference = preference("user-1", "CELSIUS", "en", true);
        when(repository.findByUserId("user-1")).thenReturn(Optional.of(preference));

        assertThat(service.getByUserId(" user-1 ")).isSameAs(preference);
    }

    @Test
    void throwsWhenPreferencesDoNotExist() {
        when(repository.findByUserId("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByUserId("missing-user"))
                .isInstanceOf(PreferenceNotFoundException.class);
    }

    @Test
    void updatesMutablePreferenceFieldsAndKeepsIdentity() {
        UserPreference existing = preference("user-1", "CELSIUS", "en", true);
        existing.setId("mongo-id");
        UserPreference request = preference(null, "fahrenheit", "FR", false);
        when(repository.findByUserId("user-1")).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        UserPreference result = service.update("user-1", request);

        assertThat(result.getId()).isEqualTo("mongo-id");
        assertThat(result.getTemperatureUnit()).isEqualTo("FAHRENHEIT");
        assertThat(result.getLanguage()).isEqualTo("fr");
        assertThat(result.getAlertsEnabled()).isFalse();
    }

    @Test
    void rejectsBodyUserIdThatDoesNotMatchPath() {
        UserPreference request = preference("other-user", "CELSIUS", "en", true);

        assertThatThrownBy(() -> service.update("user-1", request))
                .isInstanceOf(InvalidPreferenceException.class)
                .hasMessageContaining("must match");
        verify(repository, never()).save(request);
    }

    private UserPreference preference(
            String userId,
            String temperatureUnit,
            String language,
            Boolean alertsEnabled) {
        return UserPreference.builder()
                .userId(userId)
                .temperatureUnit(temperatureUnit)
                .language(language)
                .alertsEnabled(alertsEnabled)
                .build();
    }
}

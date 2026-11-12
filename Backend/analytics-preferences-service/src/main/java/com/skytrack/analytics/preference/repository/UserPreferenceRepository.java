package com.skytrack.analytics.preference.repository;

import com.skytrack.analytics.preference.model.UserPreference;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserPreferenceRepository extends MongoRepository<UserPreference, String> {

    Optional<UserPreference> findByUserId(String userId);
}

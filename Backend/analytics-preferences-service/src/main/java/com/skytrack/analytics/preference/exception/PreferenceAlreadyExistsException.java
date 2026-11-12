package com.skytrack.analytics.preference.exception;

public class PreferenceAlreadyExistsException extends RuntimeException {

    public PreferenceAlreadyExistsException(String userId) {
        super("Preferences already exist for userId: " + userId);
    }
}

package com.skytrack.analytics.preference.exception;

public class PreferenceNotFoundException extends RuntimeException {

    public PreferenceNotFoundException(String userId) {
        super("No preferences found for userId: " + userId);
    }
}

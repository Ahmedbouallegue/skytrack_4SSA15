package com.skytrack.alertnotification.exception;

/** A service called through OpenFeign is down or answered with an error. Mapped to HTTP 503. */
public class RemoteServiceUnavailableException extends RuntimeException {

    public RemoteServiceUnavailableException(String serviceName, Throwable cause) {
        super(serviceName + " is unavailable: " + cause.getMessage(), cause);
    }
}

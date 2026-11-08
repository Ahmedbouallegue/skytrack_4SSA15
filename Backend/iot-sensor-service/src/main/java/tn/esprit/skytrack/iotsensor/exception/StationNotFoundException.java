package tn.esprit.skytrack.iotsensor.exception;

public class StationNotFoundException extends RuntimeException {
    public StationNotFoundException(String stationId) {
        super("Station not found: " + stationId);
    }
}

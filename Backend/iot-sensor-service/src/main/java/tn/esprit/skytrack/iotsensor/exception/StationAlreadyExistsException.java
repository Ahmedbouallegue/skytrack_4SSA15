package tn.esprit.skytrack.iotsensor.exception;

public class StationAlreadyExistsException extends RuntimeException {
    public StationAlreadyExistsException(String stationId) {
        super("Station already exists: " + stationId);
    }
}

package tn.esprit.skytrack.iotsensor.exception;

public class InvalidTimeRangeException extends RuntimeException {
    public InvalidTimeRangeException() {
        super("The from instant must be before the to instant");
    }
}

package tn.esprit.skytrack.iotsensor.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(StationNotFoundException.class)
    ResponseEntity<ErrorResponse> notFound(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception, request);
    }

    @ExceptionHandler(StationAlreadyExistsException.class)
    ResponseEntity<ErrorResponse> conflict(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, exception, request);
    }

    @ExceptionHandler({InvalidTimeRangeException.class, IllegalArgumentException.class,
            MethodArgumentNotValidException.class, ConstraintViolationException.class})
    ResponseEntity<ErrorResponse> badRequest(Exception exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, exception, request);
    }

    private ResponseEntity<ErrorResponse> error(HttpStatus status, Exception exception, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), exception.getMessage(), request.getRequestURI()));
    }

    public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {
    }
}

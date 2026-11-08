package tn.esprit.skytrack.iotsensor.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.skytrack.iotsensor.dto.*;
import tn.esprit.skytrack.iotsensor.model.SensorMeasurement;
import tn.esprit.skytrack.iotsensor.service.MeasurementService;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MeasurementController {
    private final MeasurementService service;

    public MeasurementController(MeasurementService service) {
        this.service = service;
    }

    @PostMapping("/measurements")
    public ResponseEntity<SensorMeasurement> create(@Valid @RequestBody MeasurementRequest request) {
        SensorMeasurement measurement = service.create(request);
        return ResponseEntity.created(URI.create("/api/stations/" + measurement.stationId() + "/measurements"))
                .body(measurement);
    }

    @PostMapping("/measurements/batch")
    public ResponseEntity<List<SensorMeasurement>> createBatch(@Valid @RequestBody MeasurementBatchRequest request) {
        return ResponseEntity.status(201).body(service.createBatch(request));
    }

    @GetMapping("/stations/{stationId}/measurements")
    public List<SensorMeasurement> find(@PathVariable String stationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "100") int limit) {
        Instant end = to == null ? Instant.now() : to;
        Instant start = from == null ? end.minus(Duration.ofHours(24)) : from;
        return service.find(stationId, start, end, Math.min(Math.max(limit, 1), 500));
    }

    @GetMapping("/stations/{stationId}/measurements/latest")
    public SensorMeasurement latest(@PathVariable String stationId) {
        return service.latest(stationId);
    }

    @GetMapping("/stations/{stationId}/measurements/stats")
    public List<MeasurementStatsResponse> stats(@PathVariable String stationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "1h") String window) {
        Instant end = to == null ? Instant.now() : to;
        Instant start = from == null ? end.minus(Duration.ofHours(24)) : from;
        return service.stats(stationId, start, end, parseWindow(window));
    }

    @GetMapping("/measurements/latest")
    public List<SensorMeasurement> latestByCity(@RequestParam Long cityId) {
        return service.latestByCity(cityId);
    }

    private static Duration parseWindow(String value) {
        if (value.endsWith("m")) return Duration.ofMinutes(Long.parseLong(value.substring(0, value.length() - 1)));
        if (value.endsWith("h")) return Duration.ofHours(Long.parseLong(value.substring(0, value.length() - 1)));
        if (value.endsWith("d")) return Duration.ofDays(Long.parseLong(value.substring(0, value.length() - 1)));
        throw new IllegalArgumentException("window must use m, h, or d (for example 1h)");
    }
}

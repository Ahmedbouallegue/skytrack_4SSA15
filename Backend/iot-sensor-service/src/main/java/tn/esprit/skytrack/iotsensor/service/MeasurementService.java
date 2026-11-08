package tn.esprit.skytrack.iotsensor.service;

import org.springframework.stereotype.Service;
import tn.esprit.skytrack.iotsensor.dto.*;
import tn.esprit.skytrack.iotsensor.exception.InvalidTimeRangeException;
import tn.esprit.skytrack.iotsensor.exception.StationNotFoundException;
import tn.esprit.skytrack.iotsensor.model.SensorMeasurement;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.repository.MeasurementRepository;
import tn.esprit.skytrack.iotsensor.repository.StationRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class MeasurementService {
    private final MeasurementRepository measurements;
    private final StationRepository stations;

    public MeasurementService(MeasurementRepository measurements, StationRepository stations) {
        this.measurements = measurements;
        this.stations = stations;
    }

    public SensorMeasurement create(MeasurementRequest request) {
        ensureExists(request.stationId());
        return measurements.save(toModel(request));
    }

    public List<SensorMeasurement> createBatch(MeasurementBatchRequest request) {
        request.measurements().forEach(item -> ensureExists(item.stationId()));
        return measurements.saveAll(request.measurements().stream().map(this::toModel).toList());
    }

    public List<SensorMeasurement> find(String stationId, Instant from, Instant to, int limit) {
        ensureExists(stationId);
        validateRange(from, to);
        return measurements.findByStationIdAndTimeRange(stationId, from, to, limit);
    }

    public SensorMeasurement latest(String stationId) {
        ensureExists(stationId);
        return measurements.findLatestByStationId(stationId)
                .orElseThrow(() -> new StationNotFoundException("No measurement for " + stationId));
    }

    public List<MeasurementStatsResponse> stats(String stationId, Instant from, Instant to, Duration window) {
        ensureExists(stationId);
        validateRange(from, to);
        if (window.isZero() || window.isNegative()) throw new IllegalArgumentException("window must be positive");
        return measurements.stats(stationId, from, to, window);
    }

    public List<SensorMeasurement> latestByCity(Long cityId) {
        List<String> stationIds = stations.findAll(cityId).stream().map(Station::id).toList();
        return measurements.findLatestByCityId(cityId, stationIds);
    }

    private void ensureExists(String stationId) {
        if (stations.findById(stationId).isEmpty()) throw new StationNotFoundException(stationId);
    }

    private static void validateRange(Instant from, Instant to) {
        if (!from.isBefore(to)) throw new InvalidTimeRangeException();
    }

    private static SensorMeasurement toModel(MeasurementRequest request) {
        return new SensorMeasurement(request.stationId(), request.temperature(),
                request.timestamp() == null ? Instant.now() : request.timestamp());
    }
}

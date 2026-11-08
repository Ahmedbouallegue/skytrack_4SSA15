package tn.esprit.skytrack.iotsensor.repository;

import tn.esprit.skytrack.iotsensor.dto.MeasurementStatsResponse;
import tn.esprit.skytrack.iotsensor.model.SensorMeasurement;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MeasurementRepository {
    SensorMeasurement save(SensorMeasurement measurement);
    List<SensorMeasurement> saveAll(List<SensorMeasurement> measurements);
    List<SensorMeasurement> findByStationIdAndTimeRange(String stationId, Instant from, Instant to, int limit);
    Optional<SensorMeasurement> findLatestByStationId(String stationId);
    List<MeasurementStatsResponse> stats(String stationId, Instant from, Instant to, Duration window);
    List<SensorMeasurement> findLatestByCityId(Long cityId, List<String> stationIds);
    void deleteByStationIdAndTimeRange(String stationId, Instant from, Instant to);
}

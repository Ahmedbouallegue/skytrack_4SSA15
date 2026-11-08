package tn.esprit.skytrack.iotsensor.repository;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import org.springframework.stereotype.Repository;
import tn.esprit.skytrack.iotsensor.config.InfluxProperties;
import tn.esprit.skytrack.iotsensor.dto.MeasurementStatsResponse;
import tn.esprit.skytrack.iotsensor.model.SensorMeasurement;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class InfluxMeasurementRepository implements MeasurementRepository {
    private static final String MEASUREMENT = "sensor_measurement";
    private final InfluxDBClient client;
    private final InfluxProperties properties;

    public InfluxMeasurementRepository(InfluxDBClient client, InfluxProperties properties) {
        this.client = client;
        this.properties = properties;
    }

    @Override
    public SensorMeasurement save(SensorMeasurement measurement) {
        client.getWriteApiBlocking().writePoint(properties.bucket(), properties.org(), toPoint(measurement));
        return measurement;
    }

    @Override
    public List<SensorMeasurement> saveAll(List<SensorMeasurement> measurements) {
        client.getWriteApiBlocking().writePoints(properties.bucket(), properties.org(),
                measurements.stream().map(this::toPoint).toList());
        return measurements;
    }

    private Point toPoint(SensorMeasurement measurement) {
        return Point.measurement(MEASUREMENT)
                .addTag("stationId", measurement.stationId())
                .addField("temperature", measurement.temperature())
                .time(measurement.timestamp(), WritePrecision.NS);
    }

    @Override
    public List<SensorMeasurement> findByStationIdAndTimeRange(String stationId, Instant from, Instant to, int limit) {
        String flux = baseFlux(stationId, from, to)
                + " |> sort(columns:[\"_time\"], desc:true) |> limit(n:" + limit + ") "
                + "|> pivot(rowKey:[\"_time\"], columnKey:[\"_field\"], valueColumn:\"_value\")";
        return queryMeasurements(flux);
    }

    @Override
    public Optional<SensorMeasurement> findLatestByStationId(String stationId) {
        return findByStationIdAndTimeRange(stationId, Instant.EPOCH, Instant.now().plusSeconds(1), 1)
                .stream().findFirst();
    }

    @Override
    public List<MeasurementStatsResponse> stats(String stationId, Instant from, Instant to, Duration window) {
        String source = baseFlux(stationId, from, to);
        String flux = "minima = " + source + " |> aggregateWindow(every:" + window.toSeconds() +
                "s, fn: min, createEmpty:false) |> map(fn: (r) => ({r with _field: r._field + \"_min\"})) " +
                "maxima = " + source + " |> aggregateWindow(every:" + window.toSeconds() +
                "s, fn: max, createEmpty:false) |> map(fn: (r) => ({r with _field: r._field + \"_max\"})) " +
                "means = " + source + " |> aggregateWindow(every:" + window.toSeconds() +
                "s, fn: mean, createEmpty:false) |> map(fn: (r) => ({r with _field: r._field + \"_mean\"})) " +
                "union(tables:[minima, maxima, means]) " +
                "|> pivot(rowKey:[\"_time\"], columnKey:[\"_field\"], valueColumn:\"_value\")";
        return client.getQueryApi().query(flux, properties.org()).stream()
                .flatMap(table -> table.getRecords().stream())
                .map(record -> new MeasurementStatsResponse(
                        record.getTime(), record.getTime().plus(window),
                        decimal(record.getValueByKey("temperature_min")), decimal(record.getValueByKey("temperature_max")),
                        decimal(record.getValueByKey("temperature_mean"))))
                .toList();
    }

    @Override
    public List<SensorMeasurement> findLatestByCityId(Long cityId, List<String> stationIds) {
        return stationIds.stream().map(this::findLatestByStationId).flatMap(Optional::stream).toList();
    }

    @Override
    public void deleteByStationIdAndTimeRange(String stationId, Instant from, Instant to) {
        client.getDeleteApi().delete(from, to, "_measurement = \"sensor_measurement\" AND stationId = \"" +
                stationId.replace("\"", "\\\"") + "\"", properties.bucket(), properties.org());
    }

    private String baseFlux(String stationId, Instant from, Instant to) {
        return "from(bucket: \"" + properties.bucket() + "\") |> range(start: " + from + ", stop: " + to +
                ") |> filter(fn: (r) => r._measurement == \"sensor_measurement\" and r.stationId == \"" +
                stationId.replace("\"", "\\\"") + "\")";
    }

    private List<SensorMeasurement> queryMeasurements(String flux) {
        return client.getQueryApi().query(flux, properties.org()).stream()
                .flatMap(table -> table.getRecords().stream())
                .map(record -> new SensorMeasurement(
                        String.valueOf(record.getValueByKey("stationId")),
                        decimal(record.getValueByKey("temperature")),
                        record.getTime()))
                .toList();
    }

    private static Double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }
}

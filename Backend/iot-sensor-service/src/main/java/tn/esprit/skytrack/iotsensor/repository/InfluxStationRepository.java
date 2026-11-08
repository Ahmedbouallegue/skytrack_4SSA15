package tn.esprit.skytrack.iotsensor.repository;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import org.springframework.stereotype.Repository;
import tn.esprit.skytrack.iotsensor.config.InfluxProperties;
import tn.esprit.skytrack.iotsensor.model.Station;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class InfluxStationRepository implements StationRepository {
    private static final String MEASUREMENT = "station";
    private final InfluxDBClient client;
    private final InfluxProperties properties;

    public InfluxStationRepository(InfluxDBClient client, InfluxProperties properties) {
        this.client = client;
        this.properties = properties;
    }

    @Override
    public boolean existsById(String stationId) {
        return findById(stationId).isPresent();
    }

    @Override
    public Station save(Station station) {
        Point point = Point.measurement(MEASUREMENT)
                .addTag("stationId", station.id())
                .addField("name", station.name())
                .addField("cityId", station.cityId())
                .time(Instant.EPOCH, WritePrecision.NS);
        client.getWriteApiBlocking().writePoint(properties.bucket(), properties.org(), point);
        return station;
    }

    @Override
    public Optional<Station> findById(String stationId) {
        return findFlux(stationId, null).stream().findFirst();
    }

    @Override
    public List<Station> findAll(Long cityId) {
        return findFlux(null, cityId);
    }

    private List<Station> findFlux(String stationId, Long cityId) {
        StringBuilder filter = new StringBuilder("r._measurement == \"station\"");
        if (stationId != null) filter.append(" and r.stationId == \"").append(escape(stationId)).append("\"");
        String flux = "from(bucket: \"" + properties.bucket() + "\") |> range(start: 0) "
                + "|> filter(fn: (r) => " + filter + ") |> pivot(rowKey:[\"_time\"], columnKey:[\"_field\"], valueColumn:\"_value\")";
        return client.getQueryApi().query(flux, properties.org()).stream()
                .flatMap(table -> table.getRecords().stream())
                .filter(record -> cityId == null || cityId.equals(number(record.getValueByKey("cityId")).longValue()))
                .map(record -> new Station(
                        String.valueOf(record.getValueByKey("stationId")),
                        number(record.getValueByKey("cityId")).longValue(),
                        String.valueOf(record.getValueByKey("name"))))
                .toList();
    }

    @Override
    public void deleteById(String stationId) {
        client.getDeleteApi().delete(
                "1970-01-01T00:00:00Z",
                Instant.now().plusSeconds(1),
                "_measurement = \"station\" AND stationId = \"" + escape(stationId) + "\"",
                properties.bucket(), properties.org());
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static Number number(Object value) {
        return value instanceof Number number ? number : 0;
    }

}

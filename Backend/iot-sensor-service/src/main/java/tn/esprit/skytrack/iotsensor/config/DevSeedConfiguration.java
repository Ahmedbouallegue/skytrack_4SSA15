package tn.esprit.skytrack.iotsensor.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import tn.esprit.skytrack.iotsensor.dto.MeasurementRequest;
import tn.esprit.skytrack.iotsensor.dto.StationRequest;
import tn.esprit.skytrack.iotsensor.service.MeasurementService;
import tn.esprit.skytrack.iotsensor.service.StationService;
import java.util.List;

@Configuration
@Profile("dev")
public class DevSeedConfiguration {
    @Bean
    CommandLineRunner seed(StationService stations, MeasurementService measurements) {
        return args -> {
            List<StationRequest> stationRequests = List.of(
                    new StationRequest("ST-001", 1L, "Tunis Centre"),
                    new StationRequest("ST-002", 1L, "Tunis North"),
                    new StationRequest("ST-003", 2L, "Sousse Coast"));
            stationRequests.forEach(request -> {
                if (stations.findAll(null).stream().noneMatch(station -> station.id().equals(request.id()))) {
                    stations.create(request);
                }
            });
            measurements.createBatch(new tn.esprit.skytrack.iotsensor.dto.MeasurementBatchRequest(List.of(
                    new MeasurementRequest("ST-001", 24.2, null),
                    new MeasurementRequest("ST-002", 23.8, null),
                    new MeasurementRequest("ST-003", 25.1, null))));
        };
    }
}

package tn.esprit.skytrack.iotsensor.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.skytrack.iotsensor.dto.MeasurementRequest;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.repository.StationRepository;
import tn.esprit.skytrack.iotsensor.service.MeasurementService;
import java.util.concurrent.ThreadLocalRandom;

@Component
@org.springframework.context.annotation.Profile("simulator")
public class MeasurementSimulator {
    private final StationRepository stations;
    private final MeasurementService measurements;

    public MeasurementSimulator(StationRepository stations, MeasurementService measurements) {
        this.stations = stations;
        this.measurements = measurements;
    }

    @Scheduled(fixedRate = 30_000)
    public void sendMeasurements() {
        for (Station station : stations.findAll(null)) {
            measurements.create(new MeasurementRequest(
                    station.id(),
                    ThreadLocalRandom.current().nextDouble(-5, 36),
                    null));
        }
    }
}

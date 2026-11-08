package tn.esprit.skytrack.iotsensor.repository;

import tn.esprit.skytrack.iotsensor.model.Station;
import java.util.List;
import java.util.Optional;

public interface StationRepository {
    boolean existsById(String stationId);
    Station save(Station station);
    Optional<Station> findById(String stationId);
    List<Station> findAll(Long cityId);
    void deleteById(String stationId);
}

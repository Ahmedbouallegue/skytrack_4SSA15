package tn.esprit.skytrack.iotsensor.service;

import org.springframework.stereotype.Service;
import tn.esprit.skytrack.iotsensor.dto.*;
import tn.esprit.skytrack.iotsensor.exception.StationAlreadyExistsException;
import tn.esprit.skytrack.iotsensor.exception.StationNotFoundException;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.repository.StationRepository;
import java.util.List;

@Service
public class StationService {
    private final StationRepository repository;

    public StationService(StationRepository repository) {
        this.repository = repository;
    }

    public Station create(StationRequest request) {
        if (repository.existsById(request.id())) {
            throw new StationAlreadyExistsException(request.id());
        }
        return repository.save(new Station(request.id(), request.cityId(), request.name()));
    }

    public List<Station> findAll(Long cityId) {
        return repository.findAll(cityId);
    }

    public Station findById(String stationId) {
        return repository.findById(stationId).orElseThrow(() -> new StationNotFoundException(stationId));
    }

    public Station update(String stationId, StationUpdateRequest request) {
        Station current = findById(stationId);
        return repository.save(new Station(current.id(), request.cityId(), request.name()));
    }

    public void delete(String stationId) {
        findById(stationId);
        repository.deleteById(stationId);
    }
}

package tn.esprit.skytrack.iotsensor.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.skytrack.iotsensor.dto.*;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.service.StationService;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {
    private final StationService service;

    public StationController(StationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Station> create(@Valid @RequestBody StationRequest request) {
        Station station = service.create(request);
        return ResponseEntity.created(URI.create("/api/stations/" + station.id())).body(station);
    }

    @GetMapping
    public List<Station> findAll(@RequestParam(required = false) Long cityId) {
        return service.findAll(cityId);
    }

    @GetMapping("/{stationId}")
    public Station findById(@PathVariable String stationId) {
        return service.findById(stationId);
    }

    @PutMapping("/{stationId}")
    public Station update(@PathVariable String stationId, @Valid @RequestBody StationUpdateRequest request) {
        return service.update(stationId, request);
    }

    @DeleteMapping("/{stationId}")
    public ResponseEntity<Void> delete(@PathVariable String stationId) {
        service.delete(stationId);
        return ResponseEntity.noContent().build();
    }
}

package tn.esprit.skytrack.iotsensor.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.skytrack.iotsensor.dto.StationRequest;
import tn.esprit.skytrack.iotsensor.exception.StationAlreadyExistsException;
import tn.esprit.skytrack.iotsensor.repository.StationRepository;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StationServiceTest {
    @Mock StationRepository repository;
    @InjectMocks StationService service;

    @Test
    void createsStation() {
        when(repository.existsById("ST-001")).thenReturn(false);
        service.create(new StationRequest("ST-001", 1L, "Tunis"));
        verify(repository).save(argThat(station -> station.id().equals("ST-001")));
    }

    @Test
    void rejectsDuplicateStation() {
        when(repository.existsById("ST-001")).thenReturn(true);
        assertThrows(StationAlreadyExistsException.class,
                () -> service.create(new StationRequest("ST-001", 1L, "Tunis")));
        verify(repository, never()).save(any());
    }

    @Test
    void updatesStation() {
        tn.esprit.skytrack.iotsensor.model.Station current =
                new tn.esprit.skytrack.iotsensor.model.Station("ST-001", 1L, "Old");
        when(repository.findById("ST-001")).thenReturn(Optional.of(current));
        service.update("ST-001", new tn.esprit.skytrack.iotsensor.dto.StationUpdateRequest(2L, "New"));
        verify(repository).save(argThat(station -> station.name().equals("New") && station.cityId().equals(2L)));
    }
}

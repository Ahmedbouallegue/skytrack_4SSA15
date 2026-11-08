package tn.esprit.skytrack.iotsensor.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.skytrack.iotsensor.dto.MeasurementRequest;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.repository.MeasurementRepository;
import tn.esprit.skytrack.iotsensor.repository.StationRepository;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeasurementServiceTest {
    @Mock MeasurementRepository measurements;
    @Mock StationRepository stations;
    @InjectMocks MeasurementService service;

    @Test
    void rejectsMeasurementForUnknownStation() {
        when(stations.findById("ST-001")).thenReturn(Optional.empty());
        MeasurementRequest request = new MeasurementRequest("ST-001", 20d, null);
        assertThrows(tn.esprit.skytrack.iotsensor.exception.StationNotFoundException.class, () -> service.create(request));
        verifyNoInteractions(measurements);
    }

    @Test
    void acceptsMeasurementForExistingStation() {
        when(stations.findById("ST-001")).thenReturn(Optional.of(
                new Station("ST-001", 1L, "Tunis")));
        when(measurements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        service.create(new MeasurementRequest("ST-001", 20d, null));
        verify(measurements).save(any());
    }

    @Test
    void defaultsMeasurementTimestamp() {
        when(stations.findById("ST-001")).thenReturn(Optional.of(
                new Station("ST-001", 1L, "Tunis")));
        when(measurements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        service.create(new MeasurementRequest("ST-001", 20d, null));
        verify(measurements).save(argThat(measurement -> measurement.timestamp() != null));
    }
}

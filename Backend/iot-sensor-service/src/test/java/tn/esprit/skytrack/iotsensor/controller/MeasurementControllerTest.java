package tn.esprit.skytrack.iotsensor.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import tn.esprit.skytrack.iotsensor.config.WebConfig;
import tn.esprit.skytrack.iotsensor.model.SensorMeasurement;
import tn.esprit.skytrack.iotsensor.service.MeasurementService;
import java.time.Instant;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.List;

@WebMvcTest(MeasurementController.class)
@Import({WebConfig.class, tn.esprit.skytrack.iotsensor.exception.ApiExceptionHandler.class})
class MeasurementControllerTest {
    @Autowired MockMvc mvc;
    @MockBean MeasurementService service;

    @Test
    void getsLatestMeasurement() throws Exception {
        when(service.latest("ST-001")).thenReturn(new SensorMeasurement("ST-001", 20d, Instant.EPOCH));
        mvc.perform(get("/api/stations/ST-001/measurements/latest"))
                .andExpect(status().isOk());
    }

    @Test
    void getsLatestMeasurementsByCity() throws Exception {
        when(service.latestByCity(1L)).thenReturn(List.of());
        mvc.perform(get("/api/measurements/latest").param("cityId", "1"))
                .andExpect(status().isOk());
    }
}

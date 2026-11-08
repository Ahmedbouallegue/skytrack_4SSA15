package tn.esprit.skytrack.iotsensor.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import tn.esprit.skytrack.iotsensor.config.WebConfig;
import tn.esprit.skytrack.iotsensor.model.Station;
import tn.esprit.skytrack.iotsensor.service.StationService;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StationController.class)
@Import({WebConfig.class, tn.esprit.skytrack.iotsensor.exception.ApiExceptionHandler.class})
class StationControllerTest {
    @Autowired MockMvc mvc;
    @MockBean StationService service;

    @Test
    void getsStation() throws Exception {
        when(service.findById("ST-001")).thenReturn(new Station("ST-001", 1L, "Tunis"));
        mvc.perform(get("/api/stations/ST-001"))
                .andExpect(status().isOk());
    }
}

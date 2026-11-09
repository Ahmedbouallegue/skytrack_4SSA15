package com.skytrack.alertnotification.controller;

import com.skytrack.alertnotification.dto.AlertRequest;
import com.skytrack.alertnotification.dto.AlertResponse;
import com.skytrack.alertnotification.exception.RemoteServiceUnavailableException;
import com.skytrack.alertnotification.exception.ResourceNotFoundException;
import com.skytrack.alertnotification.service.AlertService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean AlertService alertService;

    @Test
    void create_returns201WithLocation() throws Exception {
        when(alertService.create(any(AlertRequest.class))).thenReturn(
                new AlertResponse("a1", 5L, "CANICULE", "HIGH", LocalDateTime.of(2026, 7, 1, 10, 0)));

        mvc.perform(post("/api/alerts").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cityId": 5, "type": "CANICULE", "severity": "HIGH", "userIds": [1, 2]}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/alerts/a1"))
                .andExpect(jsonPath("$.id").value("a1"))
                .andExpect(jsonPath("$.severity").value("HIGH"));
    }

    @Test
    void create_invalidBody_returns400WithFieldErrors() throws Exception {
        mvc.perform(post("/api/alerts").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cityId": -1, "type": "", "severity": "EXTREME"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.cityId").exists())
                .andExpect(jsonPath("$.errors.type").exists())
                .andExpect(jsonPath("$.errors.severity").exists());
        verifyNoInteractions(alertService);
    }

    @Test
    void unknownAlert_returns404() throws Exception {
        when(alertService.findById("nope")).thenThrow(new ResourceNotFoundException("Alert", "nope"));

        mvc.perform(get("/api/alerts/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Alert not found with id nope"));
    }

    @Test
    void remoteServiceDown_returns503() throws Exception {
        when(alertService.create(any(AlertRequest.class)))
                .thenThrow(new RemoteServiceUnavailableException("Location Service", new RuntimeException("timeout")));

        mvc.perform(post("/api/alerts").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cityId": 5, "type": "CANICULE", "severity": "HIGH"}
                                """))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void corsPreflightFromAngularIsAllowed() throws Exception {
        mvc.perform(options("/api/alerts")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }
}

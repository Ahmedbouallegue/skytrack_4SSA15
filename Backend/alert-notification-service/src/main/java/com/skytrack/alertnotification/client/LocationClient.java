package com.skytrack.alertnotification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "location-service", url = "${clients.location-service.url}")
public interface LocationClient {

    @GetMapping("/api/cities/{id}")
    CityDto getCityById(@PathVariable("id") Long id);
}

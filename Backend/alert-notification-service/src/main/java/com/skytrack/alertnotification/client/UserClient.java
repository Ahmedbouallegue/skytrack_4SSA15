package com.skytrack.alertnotification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/** The User Service is written in .NET; it is called over REST/JSON like any other service. */
@FeignClient(name = "user-service", url = "${clients.user-service.url}")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}

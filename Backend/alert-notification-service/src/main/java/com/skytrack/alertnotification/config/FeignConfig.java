package com.skytrack.alertnotification.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

/**
 * Enables the OpenFeign clients (Location Service, User Service).
 * Kept out of the main class so that slice tests (@WebMvcTest) do not try to create them.
 */
@Configuration
@EnableFeignClients(basePackages = "com.skytrack.alertnotification.client")
public class FeignConfig {
}

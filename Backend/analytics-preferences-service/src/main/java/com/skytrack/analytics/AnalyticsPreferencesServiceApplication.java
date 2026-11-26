package com.skytrack.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AnalyticsPreferencesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                AnalyticsPreferencesServiceApplication.class, args);
    }
}

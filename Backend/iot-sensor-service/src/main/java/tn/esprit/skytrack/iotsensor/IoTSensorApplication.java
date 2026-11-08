package tn.esprit.skytrack.iotsensor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IoTSensorApplication {
    public static void main(String[] args) {
        SpringApplication.run(IoTSensorApplication.class, args);
    }
}

package com.infosys.healthtwinservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class HealthtwinserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthtwinserviceApplication.class, args);
    }

}
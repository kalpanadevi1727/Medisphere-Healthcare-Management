package com.infosys.consentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class ConsentserviceApplication {

	public static void main(String[] args) {

        SpringApplication.run(ConsentserviceApplication.class, args);
	}

}

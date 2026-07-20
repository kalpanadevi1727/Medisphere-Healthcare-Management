package com.infosys.patient_service.producer;

import com.infosys.patient_service.event.PatientCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PatientProducer {

    @Autowired
    private KafkaTemplate<UUID, PatientCreatedEvent> kafkaTemplate;

    private static final String TOPIC = "patient-created";

    public void sendPatientCreatedEvent(PatientCreatedEvent event) {

        kafkaTemplate.send(TOPIC, event)
                .whenComplete((result, ex) -> {

                    if (ex == null) {
                        System.out.println("Message sent successfully");
                        System.out.println("Topic: " + result.getRecordMetadata().topic());
                        System.out.println("Partition: " + result.getRecordMetadata().partition());
                        System.out.println("Offset: " + result.getRecordMetadata().offset());
                    } else {
                        System.out.println("Failed to send message");
                        ex.printStackTrace();
                    }

                });

        System.out.println("Patient Event Published Successfully");

    }

}
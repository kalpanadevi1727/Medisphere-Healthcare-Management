package com.infosys.vitalsservice.producer;

import com.infosys.vitalsservice.event.VitalsUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class VitalsProducer {

    private static final String TOPIC = "vitals-stream";

    @Autowired
    private KafkaTemplate<String, VitalsUpdatedEvent> kafkaTemplate;

    public void sendVitals(VitalsUpdatedEvent event) {

        kafkaTemplate.send(TOPIC, event);

        System.out.println("==================================");
        System.out.println("VitalsUpdatedEvent Published");
        System.out.println(event);
        System.out.println("==================================");
    }
}
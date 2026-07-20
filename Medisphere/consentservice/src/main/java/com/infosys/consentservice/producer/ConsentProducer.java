package com.infosys.consentservice.producer;

import com.infosys.consentservice.event.ConsentUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class ConsentProducer {

    private static final String TOPIC = "consent-updated";

    @Autowired
    private KafkaTemplate<String, ConsentUpdatedEvent> kafkaTemplate;

    public void sendConsent(ConsentUpdatedEvent event) {

        kafkaTemplate.send(TOPIC, event);

        System.out.println("==================================");
        System.out.println("ConsentUpdatedEvent Published");
        System.out.println(event);
        System.out.println("==================================");
    }
}

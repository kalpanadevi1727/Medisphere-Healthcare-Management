package com.infosys.vitalsservice.producer;

import com.infosys.vitalsservice.Entity.Alert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class AlertProducer {

    private static final String TOPIC = "alerts-stream";

    @Autowired
    private KafkaTemplate<String, Alert> kafkaTemplate;

    public void sendAlert(Alert alert) {
        kafkaTemplate.send(TOPIC, alert.getAlertId().toString(), alert);
        System.out.println("Alert Event Published to topic alerts-stream: " + alert.getAlertId());
    }
}

package com.infosys.vitalsservice.producer;

import com.infosys.vitalsservice.event.NotificationEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationProducer {

    private static final String TOPIC = "notification-stream";

    @Autowired
    private KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void sendNotification(NotificationEvent event) {
        kafkaTemplate.send(TOPIC, event.getNotificationId().toString(), event);
        System.out.println("Notification Event Published to topic notification-stream: " + event.getNotificationId());
    }
}

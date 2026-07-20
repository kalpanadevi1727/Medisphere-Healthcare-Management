package com.infosys.healthtwinservice.consumer;

import com.infosys.healthtwinservice.Entity.HealthTwin;
import com.infosys.healthtwinservice.Repository.HealthTwinRepository;
import com.infosys.healthtwinservice.event.PatientCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;

import java.util.UUID;

@Service
public class PatientConsumer {

    @Autowired
    private HealthTwinRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @KafkaListener(topics = "patient-created", groupId = "healthtwin-group")
    public void consume(PatientCreatedEvent event) {

        System.out.println("========== EVENT RECEIVED ==========");
        System.out.println(event);

        Query query = new Query(Criteria.where("patientId").is(event.getPatientId()));
        Update update = new Update()
                .setOnInsert("twinId", UUID.randomUUID())
                .setOnInsert("patientId", event.getPatientId())
                .setOnInsert("bloodgroup", "Unknown")
                .setOnInsert("height", 0.0)
                .setOnInsert("weight", 0.0)
                .setOnInsert("temperature", 0.0)
                .setOnInsert("disease", "None");

        mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                HealthTwin.class
        );

        System.out.println("========== HEALTH TWIN UPSERTED ==========");
    }
}
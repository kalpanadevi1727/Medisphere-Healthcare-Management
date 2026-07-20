package com.infosys.vitalsservice.consumer;


import com.infosys.vitalsservice.Entity.Vitals;
import com.infosys.vitalsservice.Repository.VitalsRepository;
import com.infosys.vitalsservice.event.PatientCreatedEvent;
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
    private VitalsRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @KafkaListener(topics = "patient-created", groupId = "vitals-group")
    public void consume(PatientCreatedEvent event) {

        System.out.println("========== EVENT RECEIVED ==========");
        System.out.println(event);

        Query query = new Query(Criteria.where("patientId").is(event.getPatientId()));
        Update update = new Update()
                .setOnInsert("vitalsId", UUID.randomUUID())
                .setOnInsert("patientId", event.getPatientId())
                .setOnInsert("heartbeat", 0)
                .setOnInsert("bloodpressure", "Unknown")
                .setOnInsert("oxygenlevel", 0)
                .setOnInsert("bloodsuger", 0.0)
                .setOnInsert("pulserate", 0);

        mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                Vitals.class
        );

        System.out.println("========== VITALS UPSERTED ==========");
    }
}
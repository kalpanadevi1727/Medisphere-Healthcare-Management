package com.infosys.consentservice.consumer;

import com.infosys.consentservice.Entity.Consent;
import com.infosys.consentservice.Repository.ConsentRepository;
import com.infosys.consentservice.event.PatientCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class PatientConsumer {

    @Autowired
    private ConsentRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @KafkaListener(topics = "patient-created", groupId = "consent-group")
    public void consume(PatientCreatedEvent event) {

        System.out.println("========== CONSENT EVENT RECEIVED ==========");
        System.out.println(event);

        Query query = new Query(Criteria.where("patientId").is(event.getPatientId()));
        Update update = new Update()
                .setOnInsert("consentId", UUID.randomUUID())
                .setOnInsert("patientId", event.getPatientId())
                .setOnInsert("consenttype", "General")
                .setOnInsert("status", "GRANTED")
                .setOnInsert("granteddate", LocalDate.now())
                .setOnInsert("expirydate", LocalDate.now().plusYears(1));

        mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                Consent.class
        );

        System.out.println("========== CONSENT UPSERTED ==========");
    }
}

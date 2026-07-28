package com.infosys.consentservice.Service;

import com.infosys.consentservice.Entity.Consent;
import com.infosys.consentservice.Repository.ConsentRepository;
import com.infosys.consentservice.dto.ConsentRequestDTO;
import com.infosys.consentservice.dto.ConsentResponseDTO;
import com.infosys.consentservice.event.ConsentUpdatedEvent;
import com.infosys.consentservice.producer.ConsentProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConsentService {

    @Autowired
    private ConsentRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private ConsentProducer producer;

    // Save
    public ConsentResponseDTO save(ConsentRequestDTO dto) {

        Query query = new Query(Criteria.where("patientId").is(dto.getPatientId()));
        Update update = new Update()
                .set("consenttype", dto.getConsenttype())
                .set("status", dto.getStatus())
                .set("granteddate", dto.getGranteddate())
                .set("expirydate", dto.getExpirydate())
                .setOnInsert("consentId", UUID.randomUUID())
                .setOnInsert("patientId", dto.getPatientId());

        Consent savedConsent = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                Consent.class
        );

        ConsentUpdatedEvent event = new ConsentUpdatedEvent();
        event.setConsentId(savedConsent.getConsentId());
        event.setPatientId(savedConsent.getPatientId());
        event.setConsenttype(savedConsent.getConsenttype());
        event.setStatus(savedConsent.getStatus());
        event.setGranteddate(savedConsent.getGranteddate());
        event.setExpirydate(savedConsent.getExpirydate());
        producer.sendConsent(event);

        return mapToDTO(savedConsent);
    }

    // Get By Patient Id
    public ConsentResponseDTO getByPatientId(String patientId) {

        Consent consent = repository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Consent Not Found"));

        return mapToDTO(consent);
    }

    // Update
    public ConsentResponseDTO update(UUID id, ConsentRequestDTO dto) {

        Consent consent = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consent not found"));

        consent.setPatientId(dto.getPatientId());
        consent.setConsenttype(dto.getConsenttype());
        consent.setStatus(dto.getStatus());
        consent.setGranteddate(dto.getGranteddate());
        consent.setExpirydate(dto.getExpirydate());

        Consent savedConsent = repository.save(consent);

        ConsentUpdatedEvent event = new ConsentUpdatedEvent();
        event.setConsentId(savedConsent.getConsentId());
        event.setPatientId(savedConsent.getPatientId());
        event.setConsenttype(savedConsent.getConsenttype());
        event.setStatus(savedConsent.getStatus());
        event.setGranteddate(savedConsent.getGranteddate());
        event.setExpirydate(savedConsent.getExpirydate());
        producer.sendConsent(event);

        return mapToDTO(savedConsent);
    }

    // Revoke
    public ConsentResponseDTO revoke(UUID id) {

        Consent consent = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consent not found"));

        consent.setStatus("REVOKED");

        Consent savedConsent = repository.save(consent);

        ConsentUpdatedEvent event = new ConsentUpdatedEvent();
        event.setConsentId(savedConsent.getConsentId());
        event.setPatientId(savedConsent.getPatientId());
        event.setConsenttype(savedConsent.getConsenttype());
        event.setStatus(savedConsent.getStatus());
        event.setGranteddate(savedConsent.getGranteddate());
        event.setExpirydate(savedConsent.getExpirydate());
        producer.sendConsent(event);

        return mapToDTO(savedConsent);
    }

    private ConsentResponseDTO mapToDTO(Consent consent) {

        ConsentResponseDTO dto = new ConsentResponseDTO();

        dto.setConsentId(consent.getConsentId());
        dto.setPatientId(consent.getPatientId());
        dto.setConsenttype(consent.getConsenttype());
        dto.setStatus(consent.getStatus());
        dto.setGranteddate(consent.getGranteddate());
        dto.setExpirydate(consent.getExpirydate());

        return dto;
    }
    public List<ConsentResponseDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public void deleteByPatientId(String patientId) {
        repository.findByPatientId(patientId).ifPresent(consent -> repository.delete(consent));
    }
}
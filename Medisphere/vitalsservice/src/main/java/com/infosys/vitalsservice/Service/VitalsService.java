package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Vitals;
import com.infosys.vitalsservice.Repository.VitalsRepository;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import com.infosys.vitalsservice.dto.VitalsResponseDTO;
import com.infosys.vitalsservice.event.VitalsUpdatedEvent;
import com.infosys.vitalsservice.producer.VitalsProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VitalsService {

    @Autowired
    private VitalsRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private VitalsProducer producer;

    public VitalsResponseDTO save(VitalsRequestDTO dto) {

        Query query = new Query(Criteria.where("patientId").is(dto.getPatientId()));
        Update update = new Update()
                .set("heartbeat", dto.getHeartbeat())
                .set("bloodpressure", dto.getBloodpressure())
                .set("oxygenlevel", dto.getOxygenlevel())
                .set("bloodsuger", dto.getBloodsuger())
                .set("pulserate", dto.getPulserate())
                .set("bloodglucose", dto.getBloodglucose())
                .set("cholesterol", dto.getCholesterol())
                .set("bpm", dto.getBpm())
                .set("systolicbp", dto.getSystolicbp())
                .set("recordedAt", LocalDateTime.now())
                .setOnInsert("vitalsId", UUID.randomUUID())
                .setOnInsert("patientId", dto.getPatientId());

        Vitals savedVitals = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                Vitals.class
        );

        VitalsUpdatedEvent event = new VitalsUpdatedEvent();

        event.setVitalsId(savedVitals.getVitalsId());
        event.setPatientId(savedVitals.getPatientId());
        event.setHeartbeat(savedVitals.getHeartbeat());
        event.setBloodpressure(savedVitals.getBloodpressure());
        event.setOxygenlevel(savedVitals.getOxygenlevel());
        event.setBloodsuger(savedVitals.getBloodsuger());
        event.setPulserate(savedVitals.getPulserate());
        event.setBloodglucose(savedVitals.getBloodglucose());
        event.setCholesterol(savedVitals.getCholesterol());
        event.setBpm(savedVitals.getBpm());
        event.setSystolicbp(savedVitals.getSystolicbp());
        event.setRecordedAt(savedVitals.getRecordedAt());

        producer.sendVitals(event);

        return mapToDTO(savedVitals);
    }

    public List<VitalsResponseDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public VitalsResponseDTO getById(UUID id) {

        Vitals vitals = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vitals not found"));

        return mapToDTO(vitals);
    }

    public List<VitalsResponseDTO> getByPatientId(UUID patientId) {

        return repository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void delete(UUID id) {

        repository.deleteById(id);
    }

    public void deleteByPatientId(UUID patientId) {
        repository.deleteByPatientId(patientId);
    }

    private VitalsResponseDTO mapToDTO(Vitals vitals){

        VitalsResponseDTO dto = new VitalsResponseDTO();

        dto.setVitalsId(vitals.getVitalsId());
        dto.setPatientId(vitals.getPatientId());
        dto.setHeartbeat(vitals.getHeartbeat());
        dto.setBloodpressure(vitals.getBloodpressure());
        dto.setOxygenlevel(vitals.getOxygenlevel());
        dto.setBloodsuger(vitals.getBloodsuger());
        dto.setPulserate(vitals.getPulserate());
        dto.setBloodglucose(vitals.getBloodglucose());
        dto.setCholesterol(vitals.getCholesterol());
        dto.setBpm(vitals.getBpm());
        dto.setSystolicbp(vitals.getSystolicbp());
        dto.setRecordedAt(vitals.getRecordedAt());

        return dto;
    }
    public VitalsResponseDTO getLatestByPatientId(UUID patientId) {

        Vitals vitals = repository
                .findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new RuntimeException("Vitals not found"));

        return mapToDTO(vitals);
    }
    public VitalsResponseDTO updateVitals(UUID id, VitalsRequestDTO dto){

       Vitals vitals=repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vitals Not Found"));

        vitals.setHeartbeat(dto.getHeartbeat());
        vitals.setBloodpressure(dto.getBloodpressure());
        vitals.setOxygenlevel(dto.getOxygenlevel());
        vitals.setBloodsuger(dto.getBloodsuger());
        vitals.setPulserate(dto.getPulserate());
        vitals.setBloodglucose(dto.getBloodglucose());
        vitals.setCholesterol(dto.getCholesterol());
        vitals.setBpm(dto.getBpm());
        vitals.setSystolicbp(dto.getSystolicbp());

        Vitals savedVitals=repository.save(vitals);
        VitalsUpdatedEvent event = new VitalsUpdatedEvent();

        event.setVitalsId(savedVitals.getVitalsId());
        event.setPatientId(savedVitals.getPatientId());
        event.setHeartbeat(savedVitals.getHeartbeat());
        event.setBloodpressure(savedVitals.getBloodpressure());
        event.setOxygenlevel(savedVitals.getOxygenlevel());
        event.setBloodsuger(savedVitals.getBloodsuger());
        event.setPulserate(savedVitals.getPulserate());
        event.setBloodglucose(savedVitals.getBloodglucose());
        event.setCholesterol(savedVitals.getCholesterol());
        event.setBpm(savedVitals.getBpm());
        event.setSystolicbp(savedVitals.getSystolicbp());
        event.setRecordedAt(savedVitals.getRecordedAt());

        producer.sendVitals(event);

        return mapToDTO(savedVitals);


    }
}
package com.infosys.healthtwinservice.Service;
import com.infosys.healthtwinservice.Entity.HealthTwin;
import com.infosys.healthtwinservice.Repository.HealthTwinRepository;
import com.infosys.healthtwinservice.dto.HealthTwinRequestDTO;
import com.infosys.healthtwinservice.dto.HealthTwinResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;

import java.util.List;
import java.util.UUID;

@Service
public class HealthTwinService {

    @Autowired
    private HealthTwinRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // Save
    public HealthTwinResponseDTO save(HealthTwinRequestDTO dto) {

        Query query = new Query(Criteria.where("patientId").is(dto.getPatientId()));
        Update update = new Update()
                .set("bloodgroup", dto.getBloodgroup())
                .set("height", dto.getHeight())
                .set("weight", dto.getWeight())
                .set("temperature", dto.getTemperature())
                .set("disease", dto.getDisease())
                .setOnInsert("twinId", UUID.randomUUID())
                .setOnInsert("patientId", dto.getPatientId());

        HealthTwin savedTwin = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                HealthTwin.class
        );

        return mapToResponse(savedTwin);
    }

    // Get All
    public List<HealthTwinResponseDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get By Twin Id
    public HealthTwinResponseDTO getById(UUID id) {

        HealthTwin twin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health Twin Not Found"));

        return mapToResponse(twin);
    }

    // NEW METHOD
    public HealthTwinResponseDTO getByPatientId(UUID patientId){

        HealthTwin twin = repository.findByPatientId(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Health Twin Not Found"));

        return mapToResponse(twin);
    }

    // Update
    public HealthTwinResponseDTO update(UUID id, HealthTwinRequestDTO dto) {

        HealthTwin twin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health Twin Not Found"));

        twin.setPatientId(dto.getPatientId());
        twin.setBloodgroup(dto.getBloodgroup());
        twin.setHeight(dto.getHeight());
        twin.setWeight(dto.getWeight());
        twin.setTemperature(dto.getTemperature());
        twin.setDisease(dto.getDisease());

        HealthTwin updatedTwin = repository.save(twin);

        return mapToResponse(updatedTwin);
    }

    // Delete
    public void delete(UUID id) {

        repository.deleteById(id);
    }

    public void deleteByPatientId(UUID patientId) {
        repository.findByPatientId(patientId).ifPresent(twin -> repository.delete(twin));
    }

    private HealthTwinResponseDTO mapToResponse(HealthTwin twin) {

        HealthTwinResponseDTO dto = new HealthTwinResponseDTO();

        dto.setTwinId(twin.getTwinId());
        dto.setPatientId(twin.getPatientId());
        dto.setBloodgroup(twin.getBloodgroup());
        dto.setHeight(twin.getHeight());
        dto.setWeight(twin.getWeight());
        dto.setTemperature(twin.getTemperature());
        dto.setDisease(twin.getDisease());

        return dto;
    }
}
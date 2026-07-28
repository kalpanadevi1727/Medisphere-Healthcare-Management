package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.Vitals;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VitalsRepository extends MongoRepository<Vitals, UUID> {
    List<Vitals> findByPatientId(String patientId);
    Optional<Vitals> findTopByPatientIdOrderByRecordedAtDesc(String patientId);
    void deleteByPatientId(String patientId);
}

package com.infosys.aipredictionservice.repository;

import com.infosys.aipredictionservice.entity.Explanation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExplanationRepository extends MongoRepository<Explanation, String> {
    Optional<Explanation> findByPatientIdAndRiskType(String patientId, String riskType);
}

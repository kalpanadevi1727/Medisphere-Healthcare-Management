package com.infosys.aipredictionservice.repository;

import com.infosys.aipredictionservice.entity.RiskPrediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskPredictionRepository extends MongoRepository<RiskPrediction, String> {
    List<RiskPrediction> findByPatientId(UUID patientId);
    Optional<RiskPrediction> findFirstByPatientIdOrderByPredictionDateDesc(UUID patientId);
}

package com.infosys.aipredictionservice.repository;

import com.infosys.aipredictionservice.entity.ModelVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModelVersionRepository extends MongoRepository<ModelVersion, String> {
    Optional<ModelVersion> findFirstByStatusOrderByCreatedDateDesc(String status);
}

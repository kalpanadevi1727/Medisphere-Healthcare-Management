package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.ThresholdConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThresholdConfigRepository extends MongoRepository<ThresholdConfig, String> {
}

package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends MongoRepository<Alert, UUID> {
    List<Alert> findByPatientId(String patientId);
    List<Alert> findByRoutingSpecialty(String routingSpecialty);
}

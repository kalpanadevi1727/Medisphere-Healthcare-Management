package com.infosys.fhirservice.Repository;

import com.infosys.fhirservice.entity.FhirPatient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FhirPatientRepository
        extends MongoRepository<FhirPatient, UUID> {

    Optional<FhirPatient> findByPatientId(String patientId);

}
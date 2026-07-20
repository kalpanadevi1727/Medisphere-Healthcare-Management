package com.infosys.fhirservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "fhir_patient")
public class FhirPatient {

    @Id
    private UUID id;

    private String resourceType;

    private UUID patientId;

    private String firstName;

    private String lastName;

    private String gender;

    private LocalDate dob;

    private String email;

    private String doctorDescription;
}
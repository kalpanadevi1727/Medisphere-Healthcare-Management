package com.infosys.patient_service.dto;

import lombok.Data;

@Data
public class Patient360Response {

    private PatientResponseDTO patient;
    private HealthTwinResponseDTO healthTwin;
    private ConsentResponseDTO consent;
    private VitalsResponseDTO vitals;

    // getters and setters
}
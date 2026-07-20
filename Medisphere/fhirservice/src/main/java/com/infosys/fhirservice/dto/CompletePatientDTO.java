package com.infosys.fhirservice.dto;

import lombok.Data;

@Data
public class CompletePatientDTO {

    private Object patient;

    private Object healthTwin;

    private Object vitals;

    private Object consent;

    private String doctorDescription;

}
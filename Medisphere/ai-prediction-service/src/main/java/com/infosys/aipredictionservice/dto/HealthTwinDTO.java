package com.infosys.aipredictionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthTwinDTO {
    private UUID twinId;
    private UUID patientId;
    private String bloodgroup;
    private double height;
    private double weight;
}

package com.infosys.aipredictionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {
    private String id;
    private UUID patientId;
    private String riskType;
    private double riskPercentage;
    private String riskLevel;
    private double confidence;
    private LocalDate predictionDate;
    private String modelVersion;
}

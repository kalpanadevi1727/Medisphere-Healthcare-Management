package com.infosys.aipredictionservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "risk_predictions")
public class RiskPrediction {

    @Id
    private String id;
    private String patientId;
    private String riskType;
    private double riskPercentage;
    private String riskLevel;
    private double confidence;
    private LocalDate predictionDate;
    private String modelVersion;
}

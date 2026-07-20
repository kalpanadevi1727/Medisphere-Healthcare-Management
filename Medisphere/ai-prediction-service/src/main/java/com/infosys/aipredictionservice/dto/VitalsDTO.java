package com.infosys.aipredictionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalsDTO {
    private UUID vitalsId;
    private UUID patientId;
    private int heartbeat;
    private String bloodpressure;
    private int oxygenlevel;
    private double bloodsuger;
    private double bloodglucose;
    private int cholesterol;
    private int bpm;
    private int systolicbp;
}

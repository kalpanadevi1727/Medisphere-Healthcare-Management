package com.infosys.vitalsservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VitalsUpdatedEvent {

    private UUID vitalsId;
    private UUID patientId;
    private int heartbeat;
    private String bloodpressure;
    private int oxygenlevel;
    private double bloodsuger;
    private int pulserate;
    private double bloodglucose;
    private int cholesterol;
    private int bpm;
    private int systolicbp;
    private LocalDateTime recordedAt;
}
package com.infosys.vitalsservice.event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;
@Data
@AllArgsConstructor
@NoArgsConstructor

public class PatientCreatedEvent {

    private String patientId;
    private String firstname;
    private String lastname;
    private String gender;
    private LocalDate dob;
    private String email;

    // getters and setters
}
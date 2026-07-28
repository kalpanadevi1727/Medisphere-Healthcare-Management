package com.infosys.patient_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientCreatedEvent {

    private String patientId;

    private String firstname;

    private String lastname;

    private String gender;

    private LocalDate dob;

    private String email;
}
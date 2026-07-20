package com.infosys.aipredictionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private UUID patientId;
    private String firstname;
    private String lastname;
    private String gender;
    private LocalDate dob;
    private String email;
}

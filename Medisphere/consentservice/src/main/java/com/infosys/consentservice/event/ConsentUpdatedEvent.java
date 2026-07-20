package com.infosys.consentservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsentUpdatedEvent {

    private UUID consentId;
    private UUID patientId;
    private String consenttype;
    private String status;
    private LocalDate granteddate;
    private LocalDate expirydate;
}

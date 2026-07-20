package com.infosys.aipredictionservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "models")
public class ModelVersion {

    @Id
    private String version;
    private double accuracy;
    private LocalDate createdDate;
    private String status; // "ACTIVE" or "INACTIVE"
}

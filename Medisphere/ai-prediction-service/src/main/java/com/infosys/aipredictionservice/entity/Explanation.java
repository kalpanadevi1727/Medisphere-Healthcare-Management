package com.infosys.aipredictionservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "explanations")
public class Explanation {

    @Id
    private String id;
    private UUID patientId;
    private String riskType;
    private String risk;
    private List<String> topFactors;
}

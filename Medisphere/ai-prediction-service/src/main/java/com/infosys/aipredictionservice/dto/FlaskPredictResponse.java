package com.infosys.aipredictionservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlaskPredictResponse {

    @JsonProperty("risk_probability")
    private double riskProbability;

    @JsonProperty("risk")
    private String risk;
}

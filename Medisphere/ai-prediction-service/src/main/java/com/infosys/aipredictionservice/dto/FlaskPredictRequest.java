package com.infosys.aipredictionservice.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.ANY,
    getterVisibility = JsonAutoDetect.Visibility.NONE,
    setterVisibility = JsonAutoDetect.Visibility.NONE
)
public class FlaskPredictRequest {

    @JsonProperty("Age")
    private int age;

    @JsonProperty("BP")
    private int bp;

    @JsonProperty("BMI")
    private double bmi;

    @JsonProperty("HbA1c")
    private double hba1c;

    @JsonProperty("HeartRate")
    private int heartRate;

    @JsonProperty("Cholesterol")
    private int cholesterol;
}

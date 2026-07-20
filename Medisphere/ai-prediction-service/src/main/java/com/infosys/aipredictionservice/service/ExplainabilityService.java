package com.infosys.aipredictionservice.service;

import com.infosys.aipredictionservice.dto.*;
import com.infosys.aipredictionservice.entity.Explanation;
import com.infosys.aipredictionservice.repository.ExplanationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ExplainabilityService {

    @Autowired
    private ExplanationRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${python.ml.service.url}")
    private String pythonMlServiceUrl;

    @Value("${medisphere.patientservice.url}")
    private String patientServiceUrl;

    @Value("${medisphere.healthtwinservice.url}")
    private String healthTwinServiceUrl;

    @Value("${medisphere.vitalsservice.url}")
    private String vitalsServiceUrl;

    public Explanation getExplanation(UUID patientId, String riskType) {
        return repository.findByPatientIdAndRiskType(patientId, riskType)
                .orElseThrow(() -> new RuntimeException("Explanation not generated yet for patient: " + patientId + " and type: " + riskType));
    }

    public Explanation generateExplanation(UUID patientId, String riskType) {
        // Fetch patient
        PatientDTO patient = null;
        try {
            patient = restTemplate.getForObject(patientServiceUrl + "/" + patientId, PatientDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Patient Service: " + e.getMessage());
        }

        // Fetch health twin
        HealthTwinDTO healthTwin = null;
        try {
            healthTwin = restTemplate.getForObject(healthTwinServiceUrl + "/patient/" + patientId, HealthTwinDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Health Twin Service: " + e.getMessage());
        }

        // Fetch vitals
        VitalsDTO vitals = null;
        try {
            vitals = restTemplate.getForObject(vitalsServiceUrl + "/latest/" + patientId, VitalsDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Vitals Service: " + e.getMessage());
        }

        // Compute features
        int age = 45; // default fallback
        if (patient != null && patient.getDob() != null) {
            age = Period.between(patient.getDob(), LocalDate.now()).getYears();
        }

        double bmi = 24.0; // default fallback
        if (healthTwin != null && healthTwin.getHeight() > 0) {
            double heightM = healthTwin.getHeight();
            // If height is in cm (e.g. > 100), convert to meters
            if (heightM > 100) {
                heightM /= 100.0;
            }
            bmi = healthTwin.getWeight() / (heightM * heightM);
        }

        int heartbeat = 75; // default fallback
        int bpSystolic = 120; // default fallback
        double bloodSugar = 5.5; // default fallback (mapping to HbA1c)
        int cholesterol = 180; // default fallback

        if (vitals != null) {
            if (vitals.getBpm() > 0) {
                heartbeat = vitals.getBpm();
            } else if (vitals.getHeartbeat() > 0) {
                heartbeat = vitals.getHeartbeat();
            } else {
                heartbeat = 75;
            }

            if (vitals.getBloodglucose() > 0) {
                if (vitals.getBloodglucose() > 20.0) {
                    bloodSugar = (vitals.getBloodglucose() + 46.7) / 28.7;
                } else {
                    bloodSugar = vitals.getBloodglucose();
                }
            } else if (vitals.getBloodsuger() > 0) {
                if (vitals.getBloodsuger() > 20.0) {
                    bloodSugar = (vitals.getBloodsuger() + 46.7) / 28.7;
                } else {
                    bloodSugar = vitals.getBloodsuger();
                }
            } else {
                bloodSugar = 5.5;
            }
            
            if (vitals.getSystolicbp() > 0) {
                bpSystolic = vitals.getSystolicbp();
            } else if (vitals.getBloodpressure() != null && !vitals.getBloodpressure().equals("Unknown")) {
                try {
                    String[] bpParts = vitals.getBloodpressure().split("/");
                    bpSystolic = Integer.parseInt(bpParts[0].trim());
                } catch (Exception e) {
                    System.err.println("Failed to parse blood pressure: " + vitals.getBloodpressure());
                }
            }
            if (bpSystolic <= 0) {
                bpSystolic = 120;
            }

            if (vitals.getCholesterol() > 0) {
                cholesterol = vitals.getCholesterol();
            } else {
                cholesterol = 170 + (int)(bmi * 1.5) + (age / 3);
                if (cholesterol > 300) cholesterol = 290;
            }
        } else {
            cholesterol = 170 + (int)(bmi * 1.5) + (age / 3);
            if (cholesterol > 300) cholesterol = 290;
        }

        // Apply scaling for Diabetes to align with ML simulation
        double querySugar = bloodSugar;
        if ("DIABETES".equals(riskType)) {
            querySugar = bloodSugar * 1.25;
        }

        // Build Flask request
        FlaskPredictRequest flaskRequest = new FlaskPredictRequest(
                age,
                bpSystolic,
                bmi,
                querySugar,
                heartbeat,
                cholesterol
        );

        // Call Flask /explain
        List<String> factors = new ArrayList<>();
        String riskLevel = "LOW";
        try {
            String url = pythonMlServiceUrl + "/explain";
            FlaskExplainResponse flaskResponse = restTemplate.postForObject(url, flaskRequest, FlaskExplainResponse.class);
            if (flaskResponse != null) {
                riskLevel = flaskResponse.getRisk();
                factors = flaskResponse.getFactors();
            }
        } catch (Exception e) {
            System.err.println("Error calling Flask Explain API: " + e.getMessage());
            // Safe fallback explanation calculations in case Flask is offline
            riskLevel = (age > 60 || bpSystolic > 140 || bmi > 30 || bloodSugar > 7.0) ? "HIGH" : "LOW";
            factors.add("Age " + (age > 60 ? "+15" : "+0"));
            factors.add("Blood Pressure " + (bpSystolic > 140 ? "+20" : "+0"));
            factors.add("BMI " + (bmi > 30 ? "+15" : "+0"));
            factors.add("HbA1c " + (bloodSugar > 7.0 ? "+20" : "+0"));
        }

        // Save Explanation
        Explanation explanation = repository.findByPatientIdAndRiskType(patientId, riskType)
                .orElse(new Explanation());
        explanation.setPatientId(patientId);
        explanation.setRiskType(riskType);
        explanation.setRisk(riskLevel);
        explanation.setTopFactors(factors);

        return repository.save(explanation);
    }
}

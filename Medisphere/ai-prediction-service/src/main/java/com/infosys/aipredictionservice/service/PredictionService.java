package com.infosys.aipredictionservice.service;

import com.infosys.aipredictionservice.dto.*;
import com.infosys.aipredictionservice.entity.RiskPrediction;
import com.infosys.aipredictionservice.entity.ModelVersion;
import com.infosys.aipredictionservice.repository.RiskPredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PredictionService {

    @Autowired
    private RiskPredictionRepository repository;

    @Autowired
    private ModelManagementService modelService;

    @Autowired
    private ExplainabilityService explainabilityService;

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

    public List<RiskPrediction> getHistory(String patientId) {
        return repository.findByPatientId(patientId);
    }

    public Optional<RiskPrediction> getLatest(String patientId) {
        return repository.findFirstByPatientIdOrderByPredictionDateDesc(patientId);
    }

    public void deletePrediction(String id) {
        repository.deleteById(id);
    }

    public RiskPrediction predictCardioRisk(String patientId) {
        return runPrediction(patientId, "CARDIO");
    }

    public RiskPrediction predictDiabetesRisk(String patientId) {
        return runPrediction(patientId, "DIABETES");
    }

    private RiskPrediction runPrediction(String patientId, String riskType) {
        // 1. Fetch patient details
        PatientDTO patient = null;
        try {
            patient = restTemplate.getForObject(patientServiceUrl + "/" + patientId, PatientDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Patient Service: " + e.getMessage());
        }

        // 2. Fetch health twin details
        HealthTwinDTO healthTwin = null;
        try {
            healthTwin = restTemplate.getForObject(healthTwinServiceUrl + "/patient/" + patientId, HealthTwinDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Health Twin Service: " + e.getMessage());
        }

        // 3. Fetch latest vitals details
        VitalsDTO vitals = null;
        try {
            vitals = restTemplate.getForObject(vitalsServiceUrl + "/latest/" + patientId, VitalsDTO.class);
        } catch (Exception e) {
            System.err.println("Error calling Vitals Service: " + e.getMessage());
        }

        // 4. Compute input features
        int age = 45; // fallback
        if (patient != null && patient.getDob() != null) {
            age = Period.between(patient.getDob(), LocalDate.now()).getYears();
        }

        double bmi = 24.0; // fallback
        if (healthTwin != null && healthTwin.getHeight() > 0) {
            double heightM = healthTwin.getHeight();
            if (heightM > 100) {
                heightM /= 100.0;
            }
            bmi = healthTwin.getWeight() / (heightM * heightM);
        }

        int heartbeat = 75; // fallback
        int bpSystolic = 120; // fallback
        double bloodSugar = 5.5; // fallback (mapping to HbA1c)
        int cholesterol = 180; // fallback

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

        // For Diabetes risk prediction, let's perturb the inputs slightly (e.g. increase HbA1c significance)
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

        // Get the active model version info
        ModelVersion activeModel = modelService.getLatestModel();
        String activeVersion = activeModel != null ? activeModel.getVersion() : "1.0";

        double riskProb = 0.25; // default fallback probability
        String riskLevel = "LOW";

        // Call Flask API /predict
        try {
            String url = pythonMlServiceUrl + "/predict";
            FlaskPredictResponse flaskResponse = restTemplate.postForObject(url, flaskRequest, FlaskPredictResponse.class);
            if (flaskResponse != null) {
                riskProb = flaskResponse.getRiskProbability();
                // Map probability to risk levels
                if (riskProb > 0.6) {
                    riskLevel = "HIGH";
                } else if (riskProb > 0.35) {
                    riskLevel = "MEDIUM";
                } else {
                    riskLevel = "LOW";
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Flask Predict API: " + e.getMessage());
            // Fallback to rule-based score calculation
            int score = age > 60 ? 15 : 0;
            score += bpSystolic > 140 ? 20 : 0;
            score += bmi > 30 ? 15 : 0;
            score += bloodSugar > 7 ? 20 : 0;
            score += cholesterol > 220 ? 20 : 0;
            score += heartbeat > 110 ? 10 : 0;
            
            riskProb = score / 100.0;
            if (score >= 61) {
                riskLevel = "HIGH";
            } else if (score >= 31) {
                riskLevel = "MEDIUM";
            } else {
                riskLevel = "LOW";
            }
        }

        // Compute model confidence: higher when prediction is certain (near 0 or 1)
        double confidence = 85.0 + (Math.abs(riskProb - 0.5) * 30.0);
        if (confidence > 98.0) confidence = 98.0;
        confidence = Math.round(confidence * 10.0) / 10.0; // round to 1 decimal

        // Save prediction record
        RiskPrediction riskPrediction = new RiskPrediction();
        riskPrediction.setPatientId(patientId);
        riskPrediction.setRiskType(riskType);
        riskPrediction.setRiskPercentage(Math.round(riskProb * 100.0 * 10.0) / 10.0);
        riskPrediction.setRiskLevel(riskLevel);
        riskPrediction.setConfidence(confidence);
        riskPrediction.setPredictionDate(LocalDate.now());
        riskPrediction.setModelVersion(activeVersion);

        RiskPrediction savedPrediction = repository.save(riskPrediction);

        // Pre-generate SHAP explanation in the background database for retrieval
        try {
            explainabilityService.generateExplanation(patientId, riskType);
        } catch (Exception ex) {
            System.err.println("Failed to pre-generate explainability factor bars: " + ex.getMessage());
        }

        return savedPrediction;
    }
}

package com.infosys.vitalsservice.consumer;

import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Entity.ThresholdConfig;
import com.infosys.vitalsservice.Repository.AlertRepository;
import com.infosys.vitalsservice.Repository.ThresholdConfigRepository;
import com.infosys.vitalsservice.event.NotificationEvent;
import com.infosys.vitalsservice.event.VitalsUpdatedEvent;
import com.infosys.vitalsservice.producer.AlertProducer;
import com.infosys.vitalsservice.producer.NotificationProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VitalsStreamConsumer {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertProducer alertProducer;

    @Autowired
    private NotificationProducer notificationProducer;

    @Autowired
    private ThresholdConfigRepository thresholdConfigRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @KafkaListener(
        topics = "vitals-stream",
        groupId = "alerts-group-v3",
        properties = {"spring.json.value.default.type=com.infosys.vitalsservice.event.VitalsUpdatedEvent"}
    )
    public void consumeVitals(VitalsUpdatedEvent event) {
        System.out.println("Processing VitalsStreamEvent: Patient ID = " + event.getPatientId());

        // Extract parameters
        int hr = event.getHeartbeat();
        int spO2 = event.getOxygenlevel();
        double sugar = event.getBloodsuger();
        int systolic = event.getSystolicbp();
        if (systolic == 0 && event.getBloodpressure() != null) {
            try {
                String[] parts = event.getBloodpressure().split("/");
                if (parts.length == 2) {
                    systolic = Integer.parseInt(parts[0]);
                }
            } catch (Exception ignored) {}
        }

        // Fetch patient age from patientservice
        int age = fetchPatientAge(event.getPatientId());

        ThresholdConfig config = thresholdConfigRepository.findById("default")
                .orElse(new ThresholdConfig("default", 130, 90, 180, 200.0));

        Alert alert = null;

        // 1. Clinical Rule Engine - CRITICAL BREACHES
        if (hr > 140 && age > 50) {
            alert = createAlert(event, "Critical", "Possible AFib detected: HR > 140 bpm (" + hr + ") and Age > 50 (" + age + ")",
                    "Suspected Atrial Fibrillation event based on patient age and heart rate breach.", 0.94, "Cardiologist");
        } else if (spO2 < 90) {
            alert = createAlert(event, "Critical", "Oxygen Alert: SpO2 < 90% (" + spO2 + "%)",
                    "Severe hypoxemia and respiratory distress detected.", 0.96, "General Practitioner");
        } else if (systolic > 180) {
            alert = createAlert(event, "Critical", "Hypertension Crisis: Systolic BP > 180 mmHg (" + systolic + ")",
                    "Severe hypertensive crisis detected requiring immediate intervention.", 0.95, "Cardiologist");
        }
        // 2. CONFIGURABLE THRESHOLDS BREACHES (High priority)
        else if (hr > config.getHrMax()) {
            alert = createAlert(event, "High", "High Heart Rate Breach: HR > " + config.getHrMax() + " bpm (" + hr + ")",
                    "Telemetry heartbeat exceeded customized thresholds configuration.", 0.89, "Cardiologist");
        } else if (spO2 < config.getSpO2Min()) {
            alert = createAlert(event, "High", "Oxygen Saturation Breach: SpO2 < " + config.getSpO2Min() + "% (" + spO2 + "%)",
                    "Telemetry SpO2 level fell below customized thresholds configuration.", 0.90, "General Practitioner");
        } else if (systolic > config.getSystolicMax()) {
            alert = createAlert(event, "High", "Blood Pressure Breach: Systolic BP > " + config.getSystolicMax() + " mmHg (" + systolic + ")",
                    "Telemetry systolic pressure exceeded customized thresholds configuration.", 0.88, "Cardiologist");
        } else if (sugar > config.getSugarMax()) {
            alert = createAlert(event, "High", "Blood Sugar Breach: Sugar > " + config.getSugarMax() + " mg/dL (" + sugar + ")",
                    "Telemetry sugar concentration exceeded customized thresholds configuration.", 0.88, "Endocrinologist");
        }

        // If an alert was generated, save and dispatch
        if (alert != null) {
            // Check if there is already an acknowledged alert for this patient and vital category
            List<Alert> existingAlerts = alertRepository.findByPatientId(alert.getPatientId());
            boolean shouldSkip = false;
            for (Alert ext : existingAlerts) {
                if ("ACKNOWLEDGED".equals(ext.getStatus())) {
                    String existingType = getBreachType(ext.getDescription());
                    String newType = getBreachType(alert.getDescription());
                    if (existingType.equals(newType)) {
                        shouldSkip = true;
                        break;
                    }
                }
            }

            if (!shouldSkip) {
                alertRepository.save(alert);
                alertProducer.sendAlert(alert);

                // Generate notifications for High/Critical severities
                if ("High".equalsIgnoreCase(alert.getSeverity()) || "Critical".equalsIgnoreCase(alert.getSeverity())) {
                    sendNotifications(alert);
                }
            } else {
                System.out.println("Skipping duplicate alert generation for patient " + alert.getPatientId() + " because an acknowledged alert of type " + getBreachType(alert.getDescription()) + " already exists.");
            }
        }
    }

    private String getBreachType(String description) {
        if (description == null) return "";
        if (description.contains("Heart Rate") || description.contains("AFib")) return "HEART_RATE";
        if (description.contains("Oxygen") || description.contains("SpO2")) return "OXYGEN";
        if (description.contains("Blood Pressure") || description.contains("Hypertension")) return "BLOOD_PRESSURE";
        if (description.contains("Blood Sugar") || description.contains("Sugar") || description.contains("Glucose")) return "BLOOD_SUGAR";
        return description;
    }

    private Alert createAlert(VitalsUpdatedEvent event, String severity, String description, String aiAnalysis, double confidence, String specialty) {
        Alert alert = new Alert();
        alert.setAlertId(UUID.randomUUID());
        alert.setPatientId(event.getPatientId());
        alert.setVitalsId(event.getVitalsId());
        alert.setTimestamp(LocalDateTime.now());
        alert.setSeverity(severity);
        alert.setStatus("NEW");
        alert.setDescription(description);
        alert.setAiAnalysis(aiAnalysis);
        alert.setConfidenceScore(confidence);
        alert.setRoutingSpecialty(specialty);
        return alert;
    }

    private int fetchPatientAge(UUID patientId) {
        try {
            String url = "http://localhost:8081/patient/" + patientId;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.get("dob") != null) {
                String dobStr = response.get("dob").toString();
                LocalDate dob = LocalDate.parse(dobStr);
                return Period.between(dob, LocalDate.now()).getYears();
            }
        } catch (Exception e) {
            System.err.println("Could not resolve patient age from patient-service: " + e.getMessage());
        }
        return 55; // Default age to simulate age-restricted rules
    }

    private void sendNotifications(Alert alert) {
        // Send Firebase mobile notification
        dispatchNotification(alert, "Doctor", "Push", "Firebase Mobile Push");
        // Send SMS notification
        dispatchNotification(alert, "Patient", "SMS", "Twilio SMS Gateway");
        // Send Email notification
        dispatchNotification(alert, "Nurse", "Email", "Spring Mail SMTP");
    }

    private void dispatchNotification(Alert alert, String recipient, String method, String gateway) {
        NotificationEvent notif = new NotificationEvent();
        notif.setNotificationId(UUID.randomUUID());
        notif.setPatientId(alert.getPatientId());
        notif.setAlertId(alert.getAlertId());
        notif.setTimestamp(LocalDateTime.now());
        notif.setMessage("ALERT [" + alert.getSeverity() + "]: " + alert.getDescription());
        notif.setRecipientRole(recipient);
        notif.setDeliveryMethod(method);

        notificationProducer.sendNotification(notif);

        // Simulation console printouts
        System.out.println(">>> [" + gateway.toUpperCase() + "] Dispatch to " + recipient + ": " + notif.getMessage());
    }
}

package com.infosys.fhirservice.Service;

import com.infosys.fhirservice.Repository.FhirPatientRepository;
import com.infosys.fhirservice.entity.FhirPatient;
import com.infosys.fhirservice.event.PatientCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.infosys.fhirservice.dto.CompletePatientDTO;

import java.util.List;
import java.util.UUID;

@Service
public class FhirService {

    @Autowired
    private FhirPatientRepository repository;
    @Autowired
    private RestTemplate restTemplate;

    private final String PATIENT_URL =
            "http://localhost:8081/patient";

    private final String HEALTHTWIN_URL =
            "http://localhost:8082/healthtwin";

    private final String VITALS_URL =
            "http://localhost:8083/vitals";

    private final String CONSENT_URL =
            "http://localhost:8084/consent";

    // Called by Kafka Consumer
    public void savePatient(PatientCreatedEvent event){

        FhirPatient patient = new FhirPatient();

        patient.setId(UUID.randomUUID());
        patient.setResourceType("Patient");
        patient.setPatientId(event.getPatientId());
        patient.setFirstName(event.getFirstname());
        patient.setLastName(event.getLastname());
        patient.setGender(event.getGender());
        patient.setDob(event.getDob());
        patient.setEmail(event.getEmail());

        repository.save(patient);
    }

    // Get all FHIR patients
    public List<FhirPatient> getAllPatients() {
        return repository.findAll();
    }

    // Get one FHIR patient
    public FhirPatient getPatientByPatientId(UUID patientId) {

        return repository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

    }
    public CompletePatientDTO getCompleteRecord(UUID patientId) {

        CompletePatientDTO dto = new CompletePatientDTO();

        try {
            System.out.println("Calling Patient Service...");
            Object patient = restTemplate.getForObject(
                    PATIENT_URL + "/" + patientId,
                    Object.class);
            dto.setPatient(patient);
            System.out.println("Patient Loaded");
        } catch (Exception e) {
            System.out.println("Patient Error:");
            e.printStackTrace();
        }

        try {
            System.out.println("Calling Health Twin...");
            Object health = restTemplate.getForObject(
                    HEALTHTWIN_URL + "/patient/" + patientId,
                    Object.class);
            dto.setHealthTwin(health);
            System.out.println("Health Loaded");
        } catch (Exception e) {
            System.out.println("Health Error:");
            e.printStackTrace();
        }

        try {
            System.out.println("Calling Vitals...");
            Object vitals = restTemplate.getForObject(
                    VITALS_URL + "/latest/" + patientId,
                    Object.class);
            dto.setVitals(vitals);
            System.out.println("Vitals Loaded");
        } catch (Exception e) {
            System.out.println("Vitals Error:");
            e.printStackTrace();
        }

        try {
            System.out.println("Calling Consent...");
            Object consent = restTemplate.getForObject(
                    CONSENT_URL + "/patient/" + patientId,
                    Object.class);
            dto.setConsent(consent);
            System.out.println("Consent Loaded");
        } catch (Exception e) {
            System.out.println("Consent Error:");
            e.printStackTrace();
        }

        try {
            FhirPatient fhirPatient = repository.findByPatientId(patientId).orElse(null);
            if (fhirPatient != null) {
                dto.setDoctorDescription(fhirPatient.getDoctorDescription());
            }
        } catch (Exception e) {
            System.out.println("Error loading doctorDescription from local database:");
            e.printStackTrace();
        }

        return dto;
    }

    public FhirPatient updatePatientDescription(UUID patientId, String description) {
        FhirPatient patient = repository.findByPatientId(patientId).orElse(null);
        if (patient == null) {
            try {
                System.out.println("FhirPatient not found locally. Fetching details from Patient Service to self-heal...");
                java.util.Map<String, Object> patientMap = restTemplate.getForObject(
                        PATIENT_URL + "/" + patientId,
                        java.util.Map.class);
                if (patientMap != null) {
                    patient = new FhirPatient();
                    patient.setId(UUID.randomUUID());
                    patient.setResourceType("Patient");
                    patient.setPatientId(patientId);
                    patient.setFirstName((String) patientMap.get("firstname"));
                    patient.setLastName((String) patientMap.get("lastname"));
                    patient.setGender((String) patientMap.get("gender"));
                    if (patientMap.get("dob") != null) {
                        patient.setDob(java.time.LocalDate.parse((String) patientMap.get("dob")));
                    }
                    patient.setEmail((String) patientMap.get("email"));
                }
            } catch (Exception e) {
                System.out.println("Failed to fetch details during self-healing: " + e.getMessage());
            }

            if (patient == null) {
                patient = new FhirPatient();
                patient.setId(UUID.randomUUID());
                patient.setResourceType("Patient");
                patient.setPatientId(patientId);
            }
        }
        patient.setDoctorDescription(description);
        return repository.save(patient);
    }

    public void deleteByPatientId(UUID patientId) {
        repository.findByPatientId(patientId).ifPresent(patient -> repository.delete(patient));
    }
}
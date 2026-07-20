package com.infosys.patient_service.Service;
import com.infosys.patient_service.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
public class Patient360Service {

    @Autowired
    private RestTemplate restTemplate;

    public Patient360Response getPatient360(UUID patientId){

        Patient360Response response = new Patient360Response();

        PatientResponseDTO patient =
                restTemplate.getForObject(
                        "http://localhost:8081/patient/" + patientId,
                        PatientResponseDTO.class);

        HealthTwinResponseDTO twin =
                restTemplate.getForObject(
                        "http://localhost:8082/healthtwin/patient/" + patientId,
                        HealthTwinResponseDTO.class);

        VitalsResponseDTO vitals =
                restTemplate.getForObject(
                        "http://localhost:8083/vitals/latest/" + patientId,
                        VitalsResponseDTO.class);

        ConsentResponseDTO consent =
                restTemplate.getForObject(
                        "http://localhost:8084/consent/patient/" + patientId,
                        ConsentResponseDTO.class);


        response.setPatient(patient);
        response.setHealthTwin(twin);
        response.setConsent(consent);
        response.setVitals(vitals);

        return response;
    }

}
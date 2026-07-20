package com.infosys.patient_service.Service;

import com.infosys.patient_service.dto.PatientRequestDTO;
import com.infosys.patient_service.dto.PatientResponseDTO;
import com.infosys.patient_service.Entity.Patient;
import com.infosys.patient_service.Repository.PatientRepository;
import com.infosys.patient_service.event.PatientCreatedEvent;
import com.infosys.patient_service.producer.PatientProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

    @Autowired
    private PatientProducer producer;

    @Autowired
    private RestTemplate restTemplate;

    public PatientResponseDTO savePatient(PatientRequestDTO dto){

        Patient patient=new Patient();

        patient.setPatientId(UUID.randomUUID());
        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        repository.save(patient);
        PatientCreatedEvent event =
                new PatientCreatedEvent(

                        patient.getPatientId(),

                        patient.getFirstname(),

                        patient.getLastname(),

                        patient.getGender(),

                        patient.getDob(),

                        patient.getEmail()

                );

        producer.sendPatientCreatedEvent(event);
        return convertToResponse(patient);
    }

    public List<PatientResponseDTO> getAllPatients(){

        return repository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getPatient(UUID id){

        Patient patient=repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

        return convertToResponse(patient);
    }

    public PatientResponseDTO updatePatient(UUID id, PatientRequestDTO dto){

        Patient patient=repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        repository.save(patient);

        return convertToResponse(patient);
    }

    public void deletePatient(UUID id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Patient not found");
        }

        // Cascade deletion to other microservices
        try {
            restTemplate.delete("http://localhost:8082/healthtwin/patient/" + id);
            System.out.println("Cascade deleted healthtwin for patient " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete healthtwin: " + e.getMessage());
        }

        try {
            restTemplate.delete("http://localhost:8083/vitals/patient/" + id);
            System.out.println("Cascade deleted vitals for patient " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete vitals: " + e.getMessage());
        }

        try {
            restTemplate.delete("http://localhost:8084/consent/patient/" + id);
            System.out.println("Cascade deleted consent for patient " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete consent: " + e.getMessage());
        }

        try {
            restTemplate.delete("http://localhost:8085/fhir/patient/" + id);
            System.out.println("Cascade deleted FHIR record for patient " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete FHIR record: " + e.getMessage());
        }

        repository.deleteById(id);
    }

    private PatientResponseDTO convertToResponse(Patient patient){

        PatientResponseDTO dto=new PatientResponseDTO();

        dto.setPatientId(patient.getPatientId());
        dto.setFirstname(patient.getFirstname());
        dto.setLastname(patient.getLastname());
        dto.setGender(patient.getGender());
        dto.setDob(patient.getDob());
        dto.setEmail(patient.getEmail());
        dto.setPhoneno(patient.getPhoneno());
        dto.setAddress(patient.getAddress());

        return dto;
    }
    public PatientResponseDTO getPatientByPatientId(UUID patientId) {

        Patient patient = repository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

        return convertToResponse(patient);

    }

}
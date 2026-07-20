package com.infosys.fhirservice.Controller;

import com.infosys.fhirservice.Service.FhirService;
import com.infosys.fhirservice.dto.CompletePatientDTO;
import com.infosys.fhirservice.entity.FhirPatient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/fhir")
public class FhirController {

    @Autowired
    private FhirService service;

    // Get all FHIR patients
    @GetMapping("/patients")
    public List<FhirPatient> getAllPatients() {
        System.out.println("FHIR /patients API called");

        return service.getAllPatients();
    }

    // Get FHIR patient by Patient ID
    @GetMapping("/patient/{patientId}")
    public FhirPatient getPatientByPatientId(@PathVariable UUID patientId) {
        return service.getPatientByPatientId(patientId);
    }
    @GetMapping("/patient/{patientId}/complete")
    public CompletePatientDTO getCompleteRecord(
            @PathVariable UUID patientId){

        return service.getCompleteRecord(patientId);

    }

    @PutMapping("/patient/{patientId}/description")
    public FhirPatient updateDescription(@PathVariable UUID patientId,
                                         @RequestBody java.util.Map<String, String> request) {
         String description = request.get("doctorDescription");
         return service.updatePatientDescription(patientId, description);
    }

    @DeleteMapping("/patient/{patientId}")
    public String deleteByPatientId(@PathVariable UUID patientId) {
        service.deleteByPatientId(patientId);
        return "FHIR Patient Deleted Successfully";
    }
}
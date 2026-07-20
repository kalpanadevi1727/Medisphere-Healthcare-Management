package com.infosys.fhirservice.consumer;

import com.infosys.fhirservice.Service.FhirService;
import com.infosys.fhirservice.event.PatientCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class PatientConsumer {

    @Autowired
    private FhirService service;

    @KafkaListener(
            topics="patient-created",
            groupId="fhir-group"
    )
    public void consume(PatientCreatedEvent event){

        System.out.println("Patient Event Received");

        service.savePatient(event);

        System.out.println("FHIR Resource Saved");

    }

}
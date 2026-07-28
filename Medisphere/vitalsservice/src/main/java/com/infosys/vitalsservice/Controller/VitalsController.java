package com.infosys.vitalsservice.Controller;

import com.infosys.vitalsservice.Service.VitalsService;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import com.infosys.vitalsservice.dto.VitalsResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vitals")
public class VitalsController {

    @Autowired
    private VitalsService service;

    @PostMapping("/save")
    public VitalsResponseDTO save(@Valid @RequestBody VitalsRequestDTO dto) {

        return service.save(dto);
    }

    @GetMapping("/all")
    public List<VitalsResponseDTO> getAll() {

        return service.getAll();
    }

    @GetMapping("/{id}")
    public VitalsResponseDTO getById(@PathVariable UUID id) {

        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<VitalsResponseDTO> getByPatientId(@PathVariable String patientId) {

        return service.getByPatientId(patientId);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable UUID id) {

        service.delete(id);

        return "Vitals Deleted Successfully";
    }

    @DeleteMapping("/patient/{patientId}")
    public String deleteByPatientId(@PathVariable String patientId) {
        service.deleteByPatientId(patientId);
        return "Vitals Deleted Successfully";
    }
    @GetMapping("/latest/{patientId}")
    public VitalsResponseDTO getLatest(@PathVariable String patientId) {

        return service.getLatestByPatientId(patientId);
    }
    @PutMapping("update/{id}")
    public VitalsResponseDTO update(@PathVariable UUID id,
                                     @Valid @RequestBody VitalsRequestDTO dto){

        return service.updateVitals(id,dto);
    }


}
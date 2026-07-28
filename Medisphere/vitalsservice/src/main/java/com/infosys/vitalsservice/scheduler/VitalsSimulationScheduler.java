package com.infosys.vitalsservice.scheduler;

import com.infosys.vitalsservice.Entity.Vitals;
import com.infosys.vitalsservice.Repository.VitalsRepository;
import com.infosys.vitalsservice.Service.VitalsService;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
public class VitalsSimulationScheduler {

    @Autowired
    private VitalsRepository repository;

    @Autowired
    private VitalsService service;

    private final Random random = new Random();

    @Scheduled(fixedRate = 10000)
    public void simulateVitalsChange() {
        List<Vitals> allVitals = repository.findAll();
        for (Vitals v : allVitals) {
            try {
                // Parse Blood Pressure: e.g. "120/80"
                int systolic = 120;
                int diastolic = 80;
                try {
                    String[] bpParts = v.getBloodpressure().split("/");
                    if (bpParts.length == 2) {
                        systolic = Integer.parseInt(bpParts[0]);
                        diastolic = Integer.parseInt(bpParts[1]);
                    }
                } catch (Exception ignored) {}

                // Walk values randomly to represent real-time updates
                int newHeartbeat = Math.max(50, Math.min(180, v.getHeartbeat() + random.nextInt(5) - 2));
                int newOxygen = Math.max(90, Math.min(100, v.getOxygenlevel() + random.nextInt(3) - 1));
                double newSugar = Math.max(60.0, Math.min(300.0, v.getBloodsuger() + random.nextInt(7) - 3));
                int newPulse = newHeartbeat;

                systolic = Math.max(90, Math.min(190, systolic + random.nextInt(5) - 2));
                diastolic = Math.max(60, Math.min(110, diastolic + random.nextInt(5) - 2));
                
                // Keep bloodglucose correlated (approx sugar / 18)
                double newGlucose = Math.round((newSugar / 18.0) * 10.0) / 10.0;
                int newCholesterol = Math.max(120, Math.min(320, v.getCholesterol() + random.nextInt(7) - 3));

                VitalsRequestDTO dto = new VitalsRequestDTO();
                dto.setPatientId(v.getPatientId());
                dto.setHeartbeat(newHeartbeat);
                dto.setBloodpressure(systolic + "/" + diastolic);
                dto.setOxygenlevel(newOxygen);
                dto.setBloodsuger(newSugar);
                dto.setPulserate(newPulse);
                dto.setBloodglucose(newGlucose);
                dto.setCholesterol(newCholesterol);
                dto.setBpm(newHeartbeat);
                dto.setSystolicbp(systolic);

                service.save(dto);
            } catch (Exception e) {
                System.err.println("Error simulating vitals for patient " + v.getPatientId() + ": " + e.getMessage());
            }
        }
    }
}

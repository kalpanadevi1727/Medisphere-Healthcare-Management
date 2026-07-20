package com.infosys.aipredictionservice.service;

import com.infosys.aipredictionservice.entity.ModelVersion;
import com.infosys.aipredictionservice.repository.ModelVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ModelManagementService {

    @Autowired
    private ModelVersionRepository repository;

    public ModelVersion registerModel(ModelVersion model) {
        if (model.getCreatedDate() == null) {
            model.setCreatedDate(LocalDate.now());
        }
        if (model.getStatus() == null) {
            model.setStatus("INACTIVE");
        }
        // If there are no models at all, let's make this first one active
        if (repository.count() == 0) {
            model.setStatus("ACTIVE");
        }
        return repository.save(model);
    }

    public List<ModelVersion> getAllModels() {
        // Initialize self-healing defaults if no model exists in the database
        if (repository.count() == 0) {
            createDefaultModel();
        }
        return repository.findAll();
    }

    public ModelVersion getLatestModel() {
        if (repository.count() == 0) {
            createDefaultModel();
        }
        // Get the active one, or fallback to the latest created model
        return repository.findFirstByStatusOrderByCreatedDateDesc("ACTIVE")
                .orElseGet(() -> repository.findAll().stream()
                        .sorted((m1, m2) -> m2.getCreatedDate().compareTo(m1.getCreatedDate()))
                        .findFirst()
                        .orElse(null));
    }

    public ModelVersion activateModel(String version) {
        ModelVersion targetModel = repository.findById(version)
                .orElseThrow(() -> new RuntimeException("Model version not found: " + version));
        
        // Deactivate all others
        List<ModelVersion> allModels = repository.findAll();
        for (ModelVersion m : allModels) {
            if (m.getVersion().equals(version)) {
                m.setStatus("ACTIVE");
            } else {
                m.setStatus("INACTIVE");
            }
            repository.save(m);
        }
        return targetModel;
    }

    public void deleteModel(String version) {
        repository.deleteById(version);
    }

    private void createDefaultModel() {
        ModelVersion defaultModel = new ModelVersion();
        defaultModel.setVersion("1.0");
        defaultModel.setAccuracy(91.4);
        defaultModel.setCreatedDate(LocalDate.of(2026, 7, 12));
        defaultModel.setStatus("ACTIVE");
        repository.save(defaultModel);
    }
}

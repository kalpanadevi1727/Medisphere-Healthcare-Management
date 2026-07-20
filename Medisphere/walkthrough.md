# Walkthrough - Side-by-Side CVD and Diabetes Predictions & Explanations

This walkthrough details the changes made to support separate, side-by-side predictions and SHAP explanations for Cardiovascular (CVD) and Diabetes risk assessments, along with resolving the duplicate-records bug.

## Changes Made

### 1. Backend Service Updates (`ai-prediction-service`)
* **[Explanation.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/ai-prediction-service/src/main/java/com/infosys/aipredictionservice/entity/Explanation.java)**: Added `riskType` field to store SHAP explanations separately.
* **[ExplanationRepository.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/ai-prediction-service/src/main/java/com/infosys/aipredictionservice/repository/ExplanationRepository.java)**: Changed database query signature from `findByPatientId` to `findByPatientIdAndRiskType`.
* **[ExplainabilityService.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/ai-prediction-service/src/main/java/com/infosys/aipredictionservice/service/ExplainabilityService.java)**: Updated signatures to accept and filter by `riskType`, applied the $1.25\times$ blood sugar scaling for the diabetes simulation request, and saved the result mapping.
* **[PredictionService.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/ai-prediction-service/src/main/java/com/infosys/aipredictionservice/service/PredictionService.java)**: Updated prediction logic to pass the specific `riskType` into the explanation generator.
* **[ExplainabilityController.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/ai-prediction-service/src/main/java/com/infosys/aipredictionservice/controller/ExplainabilityController.java)**: Updated mapping endpoints to include `/riskType` in the URL (e.g. `/api/explanation/{patientId}/{riskType}`).

### 2. Duplicate Record Bug Fix
We resolved the database mismatch where seeding created duplicate vitals, health twins, and consent records (which caused division-by-zero `NaN` values and crashed SHAP predictions):
* **[VitalsService.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/vitalsservice/src/main/java/com/infosys/vitalsservice/Service/VitalsService.java)**: Updated the `save` method to locate and update the existing default vitals record (created during patient registration) instead of writing a new document.
* **[HealthTwinService.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/healthtwinservice/src/main/java/com/infosys/healthtwinservice/Service/HealthTwinService.java)**: Updated `save` method to check for and update the existing health twin record.
* **[ConsentService.java](file:///c:/Users/Asus/IdeaProjects/infosys/Medisphere/consentservice/src/main/java/com/infosys/consentservice/Service/ConsentService.java)**: Updated `save` to update the patient's existing consent rather than duplicating.

### 3. Frontend Updates (`medisphere-ui`)
* **[predictionService.js](file:///c:/Users/Asus/IdeaProjects/infosys/medisphere-ui/src/services/predictionService.js)**: Updated API calls to request explanations by `patientId` and `riskType`.
* **[PredictionPage.jsx](file:///c:/Users/Asus/IdeaProjects/infosys/medisphere-ui/src/pages/prediction/PredictionPage.jsx)**:
  * Kept independent states for both Cardiovascular and Diabetes predictions and SHAP explanations.
  * Re-rendered the **Latest Assessment** panel into two side-by-side columns: one for CVD and one for Diabetes.
  * Added sub-tabs to the **SHAP Explanations** section to allow doctors to toggle between viewing CVD or Diabetes factor contributions.

---

## Verification Results

### Compile Verification
All modified microservices successfully compiled using Maven wrapper:
- `ai-prediction-service`: `BUILD SUCCESS`
- `vitalsservice`: `BUILD SUCCESS`
- `healthtwinservice`: `BUILD SUCCESS`
- `consentservice`: `BUILD SUCCESS`

import api from "../api/axios";

// AI Predictions
export const predictCvd = (patientId) => 
    api.post("/api/prediction/cvd", { patientId });

export const predictDiabetes = (patientId) => 
    api.post("/api/prediction/diabetes", { patientId });

export const getPredictionHistory = (patientId) => 
    api.get(`/api/prediction/history/${patientId}`);

export const getLatestPrediction = (patientId) => 
    api.get(`/api/prediction/latest/${patientId}`);

export const deletePrediction = (id) => 
    api.delete(`/api/prediction/${id}`);

export const getPredictionAccuracy = () => 
    api.get("/api/prediction/accuracy");

export const getPredictionCalibration = () => 
    api.get("/api/prediction/calibration");

export const getPredictionBiasAudit = () => 
    api.get("/api/prediction/bias-audit");

// Explainability
export const getExplanation = (patientId, riskType) => 
    api.get(`/api/explanation/${patientId}/${riskType}`);

export const generateExplanation = (patientId, riskType) => 
    api.post(`/api/explanation/${patientId}/${riskType}`);

export const validateExplanation = () => 
    api.get("/api/explanation/validate");

// Model Management
export const registerModel = (model) => 
    api.post("/api/model", model);

export const getModels = () => 
    api.get("/api/model");

export const getLatestModel = () => 
    api.get("/api/model/latest");

export const activateModel = (version) => 
    api.put(`/api/model/${version}`);

export const deleteModel = (version) => 
    api.delete(`/api/model/${version}`);

export const getModelStatus = () => 
    api.get("/api/model/status");

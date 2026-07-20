import api from "../api/axios";

// Get All Health Twins
export const getAllHealthTwins = () => {
    return api.get("/healthtwin/all");
};

// Save Health Twin
export const saveHealthTwin = (healthTwin) => {
    return api.post("/healthtwin/save", healthTwin);
};

// Get Health Twin By Id
export const getHealthTwinById = (id) => {
    return api.get(`/healthtwin/${id}`);
};

// Update Health Twin
export const updateHealthTwin = (id, healthTwin) => {
    return api.put(`/healthtwin/${id}`, healthTwin);
};

// Delete Health Twin
export const deleteHealthTwin = (id) => {
    return api.delete(`/healthtwin/${id}`);
};

// Get Health Twin By Patient Id
export const getHealthTwinByPatientId = (patientId) => {
    return api.get(`/healthtwin/patient/${patientId}`);
};
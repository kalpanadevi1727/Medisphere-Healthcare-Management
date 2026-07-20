import api from "../api/axios";

export const getAllConsents = () => {
    return api.get("/consent/all");
};

export const getConsentByPatientId = (patientId) => {
    return api.get(`/consent/patient/${patientId}`);
};

export const addConsent = (consent) => {
    return api.post("/consent/save", consent);
};

export const updateConsent = (id, consent) => {
    return api.put(`/consent/${id}`, consent);
};

// Add this function
export const revokeConsent = (id) => {
    return api.patch(`/consent/${id}/revoke`);
};
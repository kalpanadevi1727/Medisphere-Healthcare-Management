import api from "../api/axios";

export const getAllVitals = () => {
    return api.get("/vitals/all");
};

export const saveVitals = (vitals) => {
    return api.post("/vitals/save", vitals);
};

export const getVitalsById = (id) => {
    return api.get(`/vitals/${id}`);
};

export const updateVitals = (id, data) => {
    return api.put(`/vitals/update/${id}`, data);
};

export const deleteVitals = (id) => {
    return api.delete(`/vitals/${id}`);
};

export const getAllAlerts = (specialty) => {
    const url = specialty ? `/vitals/alerts/all?specialty=${specialty}` : "/vitals/alerts/all";
    return api.get(url);
};

export const acknowledgeAlert = (id) => {
    return api.put(`/vitals/alerts/${id}/acknowledge`);
};

export const closeAlert = (id) => {
    return api.put(`/vitals/alerts/${id}/close`);
};

export const getAlertMetrics = () => {
    return api.get("/vitals/alerts/metrics");
};

export const getThresholds = () => {
    return api.get("/vitals/alerts/thresholds");
};

export const saveThresholds = (thresholds) => {
    return api.post("/vitals/alerts/thresholds", thresholds);
};

export const clearAllAlerts = () => {
    return api.post("/vitals/alerts/clear");
};
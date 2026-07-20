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
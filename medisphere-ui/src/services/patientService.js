import api from "../api/axios";

export const getPatients = () =>
    api.get("/patient/all");

export const getPatientById = (id) =>
    api.get(`/patient/${id}`);

export const addPatient = (patient) =>
    api.post("/patient/save", patient);

export const updatePatient = (id, patient) =>
    api.put(`/patient/${id}`, patient);

export const deletePatient = (id) =>
    api.delete(`/patient/${id}`);
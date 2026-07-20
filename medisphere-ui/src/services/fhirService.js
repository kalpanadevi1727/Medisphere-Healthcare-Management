import api from "../api/axios";

export const getAllFhirPatients = () => {
    return api.get("/fhir/patients");
};

export const getCompleteFhirRecord = (patientId) => {
    return api.get(`/fhir/patient/${patientId}/complete`);
};

export const updateFhirPatientDescription = (patientId, doctorDescription) => {
    return api.put(`/fhir/patient/${patientId}/description`, { doctorDescription });
};
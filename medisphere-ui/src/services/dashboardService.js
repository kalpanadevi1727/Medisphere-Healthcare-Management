import api from "../api/axios";

export const getPatientCount = () => {
    return api.get("/patient/all");
};

export const getTwinCount = () => {
    return api.get("/healthtwin/all");
};

export const getFhirCount = () => {
    return api.get("/fhir/patients");
};
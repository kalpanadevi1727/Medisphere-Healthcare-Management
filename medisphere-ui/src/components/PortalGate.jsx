import React, { useState, useEffect } from "react";
import keycloak from "../auth/keycloak";
import { getPatients } from "../services/patientService";

function PortalGate({ children }) {
    const isDoctor = keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT") && !keycloak.hasRealmRole("ADMIN");

    const [doctorLoggedIn, setDoctorLoggedIn] = useState(!!sessionStorage.getItem("doctor_portal_user"));
    const [patientLoggedIn, setPatientLoggedIn] = useState(!!sessionStorage.getItem("patient_portal_user"));

    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);

    const DOCTORS_LIST = [
        { name: "Dr. Alice (Cardiologist)", role: "Cardiologist" },
        { name: "Dr. Bob (Diabetologist)", role: "Diabetologist" },
        { name: "Dr. Charlie (General Practitioner)", role: "General Practitioner" }
    ];

    useEffect(() => {
        if (isPatient && !patientLoggedIn) {
            loadPatients();
        }
    }, [isPatient, patientLoggedIn]);

    const loadPatients = async () => {
        setLoadingPatients(true);
        try {
            const res = await getPatients();
            setPatients(res.data || []);
        } catch (err) {
            console.error("Failed to load patients for selection gate", err);
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleDoctorLogin = (e) => {
        e.preventDefault();
        if (!selectedDoctor) return;
        const doc = DOCTORS_LIST.find(d => d.name === selectedDoctor);
        if (doc) {
            sessionStorage.setItem("doctor_portal_user", JSON.stringify(doc));
            setDoctorLoggedIn(true);
        }
    };

    const handlePatientLogin = (e) => {
        e.preventDefault();
        if (!selectedPatientId) return;
        
        if (selectedPatientId === "ADD_PATIENT") {
            const newPatientObj = { patientId: "ADD_PATIENT", firstname: "New", lastname: "Patient" };
            sessionStorage.setItem("patient_portal_user", JSON.stringify(newPatientObj));
            setPatientLoggedIn(true);
            window.location.href = "/patient/add";
            return;
        }

        const patient = patients.find(p => p.patientId === selectedPatientId);
        if (patient) {
            sessionStorage.setItem("patient_portal_user", JSON.stringify(patient));
            setPatientLoggedIn(true);
        }
    };

    // 1. Doctor Portal Login Gate
    if (isDoctor && !doctorLoggedIn) {
        return (
            <div 
                className="d-flex align-items-center justify-content-center min-vh-100" 
                style={{ backgroundColor: "#000000", fontFamily: "'Inter', sans-serif" }}
            >
                <div 
                    className="card p-5 shadow-lg text-center" 
                    style={{ 
                        maxWidth: "450px", 
                        width: "100%", 
                        borderRadius: "16px", 
                        backgroundColor: "#ffffff",
                        border: "none"
                    }}
                >
                    <div className="mb-4">
                        <div 
                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                            style={{ width: "64px", height: "64px", backgroundColor: "#eff6ff", color: "#3b82f6" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-shield-plus" viewBox="0 0 16 16">
                                <path d="M5.337 7.999h.853V7a.5.5 0 0 1 1 0v.999h.983a.5.5 0 1 1 0 1h-.983v1a.5.5 0 1 1-1 0v-1h-.853a.5.5 0 1 1 0-1z"/>
                                <path d="M1.01 3.25c.097-1.2 1.362-2.113 2.853-2.593C5.22.22 6.7.077 8 .077c1.3 0 2.78.143 4.137.58 1.491.48 2.756 1.393 2.853 2.593.076.942-.15 2.1-.555 3.327-.417 1.266-.99 2.569-1.575 3.736a55.12 55.12 0 0 1-2.1 3.867 2.25 2.25 0 0 1-2.84 1.15 2.25 2.25 0 0 1-2.84-1.15 55.12 55.12 0 0 1-2.1-3.867C1.556 8.918.983 7.615.566 6.348c-.405-1.228-.631-2.385-.556-3.327zm2.812-.871c-1.107.356-1.92.936-1.977 1.636-.051.644.132 1.543.518 2.715.38 1.153.907 2.343 1.442 3.41C4.336 11.2 5.011 12.384 5.58 13.1c.422.534.811.956 1.096 1.25.132.137.247.244.324.316.077-.072.192-.179.324-.316.285-.294.674-.716 1.096-1.25.569-.716 1.244-1.9 1.772-2.964.535-1.067 1.062-2.257 1.442-3.41.386-1.172.569-2.071.518-2.715-.057-.7-.87-1.28-1.977-1.636C9.13 2.012 7.896 1.88 8 1.88c-.104 0-1.33.132-2.812.603z"/>
                            </svg>
                        </div>
                        <h3 className="fw-bold mb-1 text-dark">Doctor Portal Login</h3>
                        <p className="text-muted small">Please select your doctor profile to access clinical tools.</p>
                    </div>
                    
                    <form onSubmit={handleDoctorLogin}>
                        <div className="mb-4 text-start">
                            <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>CHOOSE PROFILE</label>
                            <select 
                                className="form-select form-select-lg border-2"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                style={{ borderRadius: "10px", fontSize: "16px" }}
                                required
                            >
                                <option value="">-- Choose Doctor --</option>
                                {DOCTORS_LIST.map(d => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                            style={{ borderRadius: "10px", padding: "12px" }}
                        >
                            Access Portal
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Patient Portal Login Gate
    if (isPatient && !patientLoggedIn) {
        return (
            <div 
                className="d-flex align-items-center justify-content-center min-vh-100" 
                style={{ backgroundColor: "#000000", fontFamily: "'Inter', sans-serif" }}
            >
                <div 
                    className="card p-5 shadow-lg text-center" 
                    style={{ 
                        maxWidth: "450px", 
                        width: "100%", 
                        borderRadius: "16px", 
                        backgroundColor: "#ffffff",
                        border: "none"
                    }}
                >
                    <div className="mb-4">
                        <div 
                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                            style={{ width: "64px", height: "64px", backgroundColor: "#ecfdf5", color: "#10b981" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-heart" viewBox="0 0 16 16">
                                <path d="M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h10s1 0 1-1-1-4-6-4-6 3-6 4Zm13.5-8.09c1.387-1.425 4.855 1.07 0 4.277-4.854-3.207-1.387-5.702 0-4.276Z"/>
                            </svg>
                        </div>
                        <h3 className="fw-bold mb-1 text-dark">Patient Portal Login</h3>
                        <p className="text-muted small">Please select your patient identity to access health twins and vitals.</p>
                    </div>
                    
                    {loadingPatients ? (
                        <div className="py-4">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading Patients...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePatientLogin}>
                            <div className="mb-4 text-start">
                                <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>CHOOSE PROFILE</label>
                                <select 
                                    className="form-select form-select-lg border-2"
                                    value={selectedPatientId}
                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                    style={{ borderRadius: "10px", fontSize: "16px" }}
                                    required
                                >
                                    <option value="">-- Choose Patient --</option>
                                    <option value="ADD_PATIENT">-- Register / Add New Patient --</option>
                                    {patients.map(p => (
                                        <option key={p.patientId} value={p.patientId}>
                                            {p.firstname} {p.lastname} ({p.gender})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                                style={{ borderRadius: "10px", padding: "12px" }}
                            >
                                Access Portal
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return children;
}

export default PortalGate;

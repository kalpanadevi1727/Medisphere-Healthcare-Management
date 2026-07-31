import React, { useState, useEffect } from "react";
import keycloak from "../auth/keycloak";
import { getPatients } from "../services/patientService";

function PortalGate({ children }) {
    const isDoctor = keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT") && !keycloak.hasRealmRole("ADMIN");

    const [doctorLoggedIn, setDoctorLoggedIn] = useState(!!sessionStorage.getItem("doctor_portal_user"));
    const [patientLoggedIn, setPatientLoggedIn] = useState(!!sessionStorage.getItem("patient_portal_user"));

    const [enteredName, setEnteredName] = useState("");
    const [enteredTask, setEnteredTask] = useState("");
    const [doctorLoginError, setDoctorLoginError] = useState("");
    const [enteredPatientName, setEnteredPatientName] = useState("");
    const [enteredPatientId, setEnteredPatientId] = useState("");
    const [patientLoginError, setPatientLoginError] = useState("");
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
        setDoctorLoginError("");

        if (!enteredName || !enteredTask) return;

        const nameInput = enteredName.trim().toLowerCase();
        const taskInput = enteredTask.trim().toLowerCase();

        // Check matching doctor
        let matchedDoc = null;
        if (
            (nameInput.includes("alice") || nameInput === "dr. alice") && 
            (taskInput.includes("cardio") || taskInput.includes("heart"))
        ) {
            matchedDoc = DOCTORS_LIST[0]; // Dr. Alice (Cardiologist)
        } else if (
            (nameInput.includes("bob") || nameInput === "dr. bob") && 
            (taskInput.includes("diabet") || taskInput.includes("sugar"))
        ) {
            matchedDoc = DOCTORS_LIST[1]; // Dr. Bob (Diabetologist)
        } else if (
            (nameInput.includes("charlie") || nameInput === "dr. charlie") && 
            (taskInput.includes("general") || taskInput.includes("practi") || taskInput === "gp")
        ) {
            matchedDoc = DOCTORS_LIST[2]; // Dr. Charlie (General Practitioner)
        }

        // Generic fallback check
        if (!matchedDoc) {
            matchedDoc = DOCTORS_LIST.find(d => {
                const cleanName = d.name.toLowerCase();
                const cleanRole = d.role.toLowerCase();
                return (cleanName.includes(nameInput) || nameInput.includes(cleanName)) && 
                       (cleanRole.includes(taskInput) || taskInput.includes(cleanRole));
            });
        }

        if (matchedDoc) {
            sessionStorage.setItem("doctor_portal_user", JSON.stringify(matchedDoc));
            setDoctorLoggedIn(true);
        } else {
            setDoctorLoginError("Access Denied: Incorrect doctor name or specific task.");
        }
    };

    const handlePatientLogin = (e) => {
        e.preventDefault();
        setPatientLoginError("");

        if (!enteredPatientName || !enteredPatientId) return;

        const nameInput = enteredPatientName.trim().toLowerCase();
        const idInput = enteredPatientId.trim().toLowerCase();

        const patient = patients.find(p => {
            const cleanId = (p.patientId || "").toLowerCase().trim();
            const fullName = `${p.firstname || ""} ${p.lastname || ""}`.toLowerCase().trim();
            
            // Check if patientId matches and name is contained in full name (or vice versa)
            return cleanId === idInput && (fullName.includes(nameInput) || nameInput.includes(fullName));
        });

        if (patient) {
            sessionStorage.setItem("patient_portal_user", JSON.stringify(patient));
            setPatientLoggedIn(true);
        } else {
            setPatientLoginError("Access Denied: Incorrect Patient Name or Patient ID.");
        }
    };

    const handleRegisterRedirect = () => {
        const newPatientObj = { patientId: "ADD_PATIENT", firstname: "New", lastname: "Patient" };
        sessionStorage.setItem("patient_portal_user", JSON.stringify(newPatientObj));
        setPatientLoggedIn(true);
        window.location.href = "/patient/add";
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
                        <p className="text-muted small">Please enter your credentials to verify access to clinical tools.</p>
                    </div>
                    
                    <form onSubmit={handleDoctorLogin}>
                        {doctorLoginError && (
                            <div className="alert alert-danger py-2 px-3 mb-3 small fw-semibold text-start" style={{ borderRadius: "8px" }}>
                                ⚠️ {doctorLoginError}
                            </div>
                        )}
                        
                        <div className="mb-3 text-start">
                            <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>DOCTOR NAME</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg border-2 text-dark"
                                placeholder="Enter your name (e.g. Dr. Alice)"
                                value={enteredName}
                                onChange={(e) => setEnteredName(e.target.value)}
                                style={{ borderRadius: "10px", fontSize: "16px" }}
                                required
                            />
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>SPECIFIC TASK / SPECIALTY</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg border-2 text-dark"
                                placeholder="Enter specialty (e.g. Cardiologist)"
                                value={enteredTask}
                                onChange={(e) => setEnteredTask(e.target.value)}
                                style={{ borderRadius: "10px", fontSize: "16px" }}
                                required
                            />
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
                        <p className="text-muted small">Please enter your credentials to verify access to your health records.</p>
                    </div>
                    
                    {loadingPatients ? (
                        <div className="py-4">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading Patients...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePatientLogin}>
                            {patientLoginError && (
                                <div className="alert alert-danger py-2 px-3 mb-3 small fw-semibold text-start" style={{ borderRadius: "8px" }}>
                                    ⚠️ {patientLoginError}
                                </div>
                            )}

                            <div className="mb-3 text-start">
                                <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>PATIENT NAME</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg border-2 text-dark"
                                    placeholder="Enter your full name"
                                    value={enteredPatientName}
                                    onChange={(e) => setEnteredPatientName(e.target.value)}
                                    style={{ borderRadius: "10px", fontSize: "16px" }}
                                    required
                                />
                            </div>

                            <div className="mb-3 text-start">
                                <label className="form-label fw-bold text-secondary small" style={{ letterSpacing: "0.5px" }}>PATIENT ID</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg border-2 text-dark"
                                    placeholder="Enter your patient ID"
                                    value={enteredPatientId}
                                    onChange={(e) => setEnteredPatientId(e.target.value)}
                                    style={{ borderRadius: "10px", fontSize: "16px" }}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-success btn-lg w-100 fw-bold shadow-sm mb-3"
                                style={{ borderRadius: "10px", padding: "12px" }}
                            >
                                Access Portal
                            </button>

                            <div className="text-center pt-2 border-top" style={{ borderColor: "#f3f4f6" }}>
                                <button
                                    type="button"
                                    className="btn btn-link text-success fw-bold text-decoration-none small"
                                    onClick={handleRegisterRedirect}
                                >
                                    ➕ Register as a New Patient
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return children;
}

export default PortalGate;

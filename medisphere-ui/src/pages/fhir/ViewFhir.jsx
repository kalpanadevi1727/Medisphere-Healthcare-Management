import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getCompleteFhirRecord, updateFhirPatientDescription } from "../../services/fhirService";
import { getPredictionHistory, predictCvd, predictDiabetes } from "../../services/predictionService";
import keycloak from "../../auth/keycloak";
import { FaUser, FaHeartbeat, FaBrain, FaFileContract, FaArrowLeft, FaEdit } from "react-icons/fa";

const getConsentStatusBadge = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "approved" || s === "granted" || s === "active") return "badge bg-success bg-opacity-10 text-success border border-success border-opacity-20"; // Green
    if (s === "pending") return "badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20"; // Yellow
    if (s === "revoke" || s === "revoked" || s === "expired") return "badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20"; // Red
    return "badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20"; // Default Grey
};

function ViewFhir() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    
    // AI Predictions state
    const [cvdPred, setCvdPred] = useState(null);
    const [diaPred, setDiaPred] = useState(null);
    const [predicting, setPredicting] = useState(false);

    useEffect(() => {
        loadRecord();
        const interval = setInterval(loadRecord, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadRecord = async () => {
        try {
            const response = await getCompleteFhirRecord(id);
            setRecord(response.data);
            setDescription(response.data.doctorDescription || "");

            // Fetch prediction history
            try {
                const predResponse = await getPredictionHistory(id);
                const history = predResponse.data || [];
                const sortedHistory = [...history].sort((a, b) => (b.id || "").localeCompare(a.id || ""));
                
                const latestCvd = sortedHistory.find(p => p.riskType === "CARDIO" || p.riskType === "CVD");
                const latestDia = sortedHistory.find(p => p.riskType === "DIABETES");
                
                setCvdPred(latestCvd || null);
                setDiaPred(latestDia || null);
            } catch (predErr) {
                console.error("Failed to load predictions", predErr);
            }
        } catch (error) {
            console.log(error);
            alert("Unable to load Patient Record");
        }
    };

    const handleSaveDescription = async () => {
        setSaving(true);
        try {
            await updateFhirPatientDescription(id, description);
            alert("Clinical notes saved successfully!");
            loadRecord();
        } catch (error) {
            console.error(error);
            alert("Failed to update clinical notes");
        } finally {
            setSaving(false);
        }
    };

    const handleRunPrediction = async (type) => {
        setPredicting(true);
        try {
            if (type === "CVD") {
                await predictCvd(id);
            } else {
                await predictDiabetes(id);
            }
            alert(`${type === "CVD" ? "Cardiovascular" : "Diabetes"} Risk Prediction Completed Successfully!`);
            await loadRecord();
        } catch (error) {
            console.error(error);
            alert("Prediction failed. Check if Python ML Service is online.");
        } finally {
            setPredicting(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level?.toUpperCase()) {
            case "HIGH": return "#ef4444";
            case "MEDIUM": return "#f59e0b";
            case "LOW": return "#10b981";
            default: return "#6b7280";
        }
    };

    if (!record) {
        return (
            <Layout>
                <div className="container mt-4 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div 
                className="container-fluid py-4 px-4 my-2" 
                style={{ 
                    backgroundColor: "#ffffff", 
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    color: "#111827"
                }}
            >
                {/* Page Heading */}
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light">
                    <div>
                        <h2 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>
                            Patient <span style={{ background: "linear-gradient(90deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>360°</span> View
                        </h2>
                        <p className="text-muted mb-0">Comprehensive 360-degree patient health history, clinical records, and active consents</p>
                    </div>
                    <button
                        className="btn btn-outline-dark d-flex align-items-center gap-2 fw-semibold px-4"
                        onClick={() => navigate(-1)}
                        style={{ borderRadius: "10px", borderColor: "rgba(0, 0, 0, 0.2)", transition: "0.2s" }}
                    >
                        <FaArrowLeft /> Back
                    </button>
                </div>

                {/* 2x2 Grid of 4 Boxes */}
                <div className="row g-4 mb-4">
                    {/* Box 1: Patient Details */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Patient Details</h5>
                                    <span className="text-muted small">Demographics & contact</span>
                                </div>
                                <div className="rounded p-3 glow-icon-blue" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
                                    <FaUser size={24} />
                                </div>
                            </div>
                            <div className="small flex-grow-1 d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Patient ID</span>
                                    <span className="fw-bold text-dark">{record.patient?.patientId || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Full Name</span>
                                    <span className="fw-bold text-dark">{(record.patient?.firstname || "")} {(record.patient?.lastname || "")}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Gender</span>
                                    <span className="fw-bold text-dark">{record.patient?.gender || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Date of Birth</span>
                                    <span className="fw-bold text-dark">{record.patient?.dob || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Email</span>
                                    <span className="fw-bold text-dark text-end" style={{ wordBreak: "break-all", maxWidth: "200px" }}>{record.patient?.email || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2">
                                    <span className="text-muted">Phone</span>
                                    <span className="fw-bold text-dark">{record.patient?.phoneno || "N/A"}</span>
                                </div>
                                {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                                    <div className="mt-3 pt-3 border-top" style={{ borderColor: "#e5e7eb" }}>
                                        <strong className="d-block mb-1 text-muted">Doctor's Description:</strong>
                                        {record.doctorDescription ? (
                                            <p className="text-primary fw-semibold mb-0" style={{ fontStyle: "italic" }}>"{record.doctorDescription}"</p>
                                        ) : (
                                            <span className="text-muted small italic">No clinical description provided yet</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Box 2: Health Twin */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Health Twin</h5>
                                    <span className="text-muted small">Digital duplicate parameters</span>
                                </div>
                                <div className="rounded p-3 glow-icon-green" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
                                    <FaBrain size={24} />
                                </div>
                            </div>
                            <div className="small flex-grow-1 d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Height</span>
                                    <span className="fw-bold text-dark">{record.healthTwin?.height ? `${record.healthTwin.height} cm` : "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Weight</span>
                                    <span className="fw-bold text-dark">{record.healthTwin?.weight ? `${record.healthTwin.weight} kg` : "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Temperature</span>
                                    <span className="fw-bold text-dark">{record.healthTwin?.temperature ? `${record.healthTwin.temperature} °F` : "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Blood Group</span>
                                    <span className="fw-bold text-dark">{record.healthTwin?.bloodgroup || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2">
                                    <span className="text-muted">Disease / Condition</span>
                                    {record.healthTwin?.disease ? (
                                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 px-3 py-2" style={{ borderRadius: "8px" }}>
                                            {record.healthTwin.disease}
                                        </span>
                                    ) : (
                                        <span className="text-muted">N/A</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 3: Latest Vitals */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Latest Vitals</h5>
                                    <span className="text-muted small">Real-time telemetry</span>
                                </div>
                                <div className="rounded p-3 glow-icon-red" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                                    <FaHeartbeat size={24} />
                                </div>
                            </div>
                            <div className="small flex-grow-1 d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Heartbeat</span>
                                    <span className="fw-bold text-dark">{record.vitals?.heartbeat ? `${record.vitals.heartbeat} bpm` : "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Blood Pressure</span>
                                    <span className="fw-bold text-dark">{record.vitals?.bloodpressure || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Oxygen Level</span>
                                    <span className="fw-bold text-dark">{record.vitals?.oxygenlevel ? `${record.vitals.oxygenlevel}%` : "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Blood Sugar</span>
                                    <span className="fw-bold text-dark">{record.vitals?.bloodsuger || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2">
                                    <span className="text-muted">Pulse Rate</span>
                                    <span className="fw-bold text-dark">{record.vitals?.pulserate ? `${record.vitals.pulserate} bpm` : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 4: Consent */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Active Consent</h5>
                                    <span className="text-muted small">Access authorizations</span>
                                </div>
                                <div className="rounded p-3 glow-icon-purple" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
                                    <FaFileContract size={24} />
                                </div>
                            </div>
                            <div className="small flex-grow-1 d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Consent Type</span>
                                    <span className="fw-bold text-dark">{record.consent?.consenttype || "No Consent Available"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Status</span>
                                    <span className={getConsentStatusBadge(record.consent?.status)} style={{ padding: "6px 12px", borderRadius: "6px" }}>
                                        {record.consent?.status || "N/A"}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                    <span className="text-muted">Granted Date</span>
                                    <span className="fw-bold text-dark">{record.consent?.granteddate || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between pb-2">
                                    <span className="text-muted">Expiry Date</span>
                                    <span className="fw-bold text-dark">{record.consent?.expirydate || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 5: AI Cardiovascular Risk */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">AI Cardiovascular Risk</h5>
                                    <span className="text-muted small">CVD engine prediction</span>
                                </div>
                                <div className="rounded p-3 glow-icon-red" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}>
                                    <FaHeartbeat size={24} />
                                </div>
                            </div>
                            
                            {cvdPred ? (
                                <div className="small flex-grow-1 d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Risk Probability</span>
                                        <span className="fw-bold text-dark">{cvdPred.riskPercentage}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Risk Level</span>
                                        <span className="badge" style={{ backgroundColor: getRiskColor(cvdPred.riskLevel), color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                                            {cvdPred.riskLevel}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Confidence</span>
                                        <span className="fw-bold text-primary">{cvdPred.confidence}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Model Version</span>
                                        <span className="fw-bold text-dark">v{cvdPred.modelVersion}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2">
                                        <span className="text-muted">Prediction Date</span>
                                        <span className="fw-bold text-dark">{cvdPred.predictionDate}</span>
                                    </div>
                                    <button 
                                        className="btn btn-outline-primary btn-sm mt-2 w-100 fw-bold"
                                        onClick={() => handleRunPrediction("CVD")}
                                        disabled={predicting}
                                    >
                                        {predicting ? "Running..." : "Recalculate CVD Risk"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                                    <p className="text-muted mb-3">No Cardiovascular Assessment found for this patient.</p>
                                    <button 
                                        className="btn btn-primary btn-sm px-4 fw-bold"
                                        onClick={() => handleRunPrediction("CVD")}
                                        disabled={predicting}
                                    >
                                        {predicting ? "Running..." : "Predict CVD Risk"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Box 6: AI Diabetes Risk */}
                    <div className="col-md-6">
                        <div 
                            className="card border-0 shadow-sm p-4 h-100 transition-all hover-lift"
                            style={{ 
                                borderRadius: "16px", 
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                color: "#1f2937"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">AI Diabetes Risk</h5>
                                    <span className="text-muted small">Diabetes engine prediction</span>
                                </div>
                                <div className="rounded p-3 glow-icon-green" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                                    <FaBrain size={24} />
                                </div>
                            </div>
                            
                            {diaPred ? (
                                <div className="small flex-grow-1 d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Risk Probability</span>
                                        <span className="fw-bold text-dark">{diaPred.riskPercentage}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Risk Level</span>
                                        <span className="badge" style={{ backgroundColor: getRiskColor(diaPred.riskLevel), color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                                            {diaPred.riskLevel}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Confidence</span>
                                        <span className="fw-bold text-primary">{diaPred.confidence}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom" style={{ borderColor: "#f3f4f6" }}>
                                        <span className="text-muted">Model Version</span>
                                        <span className="fw-bold text-dark">v{diaPred.modelVersion}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2">
                                        <span className="text-muted">Prediction Date</span>
                                        <span className="fw-bold text-dark">{diaPred.predictionDate}</span>
                                    </div>
                                    <button 
                                        className="btn btn-outline-success btn-sm mt-2 w-100 fw-bold"
                                        onClick={() => handleRunPrediction("DIABETES")}
                                        disabled={predicting}
                                    >
                                        {predicting ? "Running..." : "Recalculate Diabetes Risk"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                                    <p className="text-muted mb-3">No Diabetes Assessment found for this patient.</p>
                                    <button 
                                        className="btn btn-success text-white btn-sm px-4 fw-bold"
                                        onClick={() => handleRunPrediction("DIABETES")}
                                        disabled={predicting}
                                    >
                                        {predicting ? "Running..." : "Predict Diabetes Risk"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clinical Notes Editor */}
                {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-1">
                            <h5 className="fw-bold text-dark d-flex align-items-center">
                                <FaEdit className="me-2 text-primary" /> Update Clinical Description / Seen notes
                            </h5>
                        </div>
                        <div className="card-body px-4 pb-4">
                            <textarea
                                className="form-control mb-3 text-dark"
                                rows="4"
                                placeholder="Write description or clinical notes regarding the patient..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ borderRadius: "10px", backgroundColor: "#f9fafb", borderColor: "#d1d5db" }}
                            />
                            <button
                                className="btn btn-success px-4 fw-bold"
                                onClick={handleSaveDescription}
                                disabled={saving}
                                style={{ borderRadius: "8px", transition: "0.2s" }}
                            >
                                {saving ? "Saving..." : "Save Description"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Additional Hover lift styling */}
                <style>{`
                    .hover-lift {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .hover-lift:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08) !important;
                        border-color: rgba(37, 99, 235, 0.2) !important;
                    }
                    .glow-icon-blue {
                        box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
                    }
                    .glow-icon-green {
                        box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
                    }
                    .glow-icon-red {
                        box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
                    }
                    .glow-icon-purple {
                        box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export default ViewFhir;
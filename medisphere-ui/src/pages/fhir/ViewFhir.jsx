import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getCompleteFhirRecord, updateFhirPatientDescription } from "../../services/fhirService";
import keycloak from "../../auth/keycloak";
import { FaUser, FaHeartbeat, FaBrain, FaFileContract, FaArrowLeft, FaEdit } from "react-icons/fa";

const getConsentStatusBadge = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "approved" || s === "granted" || s === "active") return "badge bg-success"; // Green
    if (s === "pending") return "badge bg-warning text-dark"; // Yellow
    if (s === "revoke" || s === "revoked" || s === "expired") return "badge bg-danger"; // Red
    return "badge bg-secondary"; // Default Grey
};

function ViewFhir() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRecord();
        const interval = setInterval(loadRecord, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadRecord = async () => {
        try {
            const response = await getCompleteFhirRecord(id);
            console.log(response.data);
            setRecord(response.data);
            setDescription(response.data.doctorDescription || "");
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
            <div className="container mt-4">
                {/* Page Heading */}
                <div className="mb-4">
                    <h2 className="fw-extrabold text-white" style={{ letterSpacing: "-0.5px" }}>
                        Complete FHIR Patient Record
                    </h2>
                    <p className="text-muted">Interoperable clinical record summary and consents</p>
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
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="fw-bold" style={{ color: "#1e40af" }}>Patient Details</h5>
                                <div className="rounded p-2" style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>
                                    <FaUser size={24} />
                                </div>
                            </div>
                            <div className="small">
                                <p className="mb-2"><strong>Patient ID:</strong> {record.patient?.patientId || "N/A"}</p>
                                <p className="mb-2">
                                    <strong>Name:</strong>{" "}
                                    {(record.patient?.firstname || "")}{" "}
                                    {(record.patient?.lastname || "")}
                                </p>
                                <p className="mb-2"><strong>Gender:</strong> {record.patient?.gender || "N/A"}</p>
                                <p className="mb-2"><strong>DOB:</strong> {record.patient?.dob || "N/A"}</p>
                                <p className="mb-2"><strong>Email:</strong> {record.patient?.email || "N/A"}</p>
                                <p className="mb-0"><strong>Phone:</strong> {record.patient?.phoneno || "N/A"}</p>
                                {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                                    <p className="mt-3 pt-2 border-top mb-0">
                                        <strong>Doctor's Description:</strong>{" "}
                                        {record.doctorDescription ? (
                                            <span className="text-info fw-semibold">{record.doctorDescription}</span>
                                        ) : (
                                            <span className="text-muted italic">No clinical description provided yet</span>
                                        )}
                                    </p>
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
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="fw-bold" style={{ color: "#1e40af" }}>Health Twin</h5>
                                <div className="rounded p-2" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
                                    <FaBrain size={24} />
                                </div>
                            </div>
                            <div className="small">
                                <p className="mb-2"><strong>Height:</strong> {record.healthTwin?.height || "N/A"}</p>
                                <p className="mb-2"><strong>Weight:</strong> {record.healthTwin?.weight || "N/A"}</p>
                                <p className="mb-2"><strong>Temperature:</strong> {record.healthTwin?.temperature || "N/A"}</p>
                                <p className="mb-2"><strong>Blood Group:</strong> {record.healthTwin?.bloodgroup || "N/A"}</p>
                                <p className="mb-0"><strong>Disease:</strong> <span className="badge bg-secondary">{record.healthTwin?.disease || "N/A"}</span></p>
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
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="fw-bold" style={{ color: "#1e40af" }}>Latest Vitals</h5>
                                <div className="rounded p-2" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
                                    <FaHeartbeat size={24} />
                                </div>
                            </div>
                            <div className="small">
                                <p className="mb-2"><strong>Heartbeat:</strong> {record.vitals?.heartbeat || "N/A"}</p>
                                <p className="mb-2"><strong>Blood Pressure:</strong> {record.vitals?.bloodpressure || "N/A"}</p>
                                <p className="mb-2"><strong>Oxygen Level:</strong> {record.vitals?.oxygenlevel || "N/A"}</p>
                                <p className="mb-2"><strong>Blood Sugar:</strong> {record.vitals?.bloodsuger || "N/A"}</p>
                                <p className="mb-0"><strong>Pulse Rate:</strong> {record.vitals?.pulserate || "N/A"}</p>
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
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="fw-bold" style={{ color: "#1e40af" }}>Consent</h5>
                                <div className="rounded p-2" style={{ backgroundColor: "#f5f3ff", color: "#8b5cf6" }}>
                                    <FaFileContract size={24} />
                                </div>
                            </div>
                            <div className="small">
                                <p className="mb-2"><strong>Consent Type:</strong> {record.consent?.consenttype || "No Consent Available"}</p>
                                <p className="mb-2"><strong>Status:</strong> <span className={getConsentStatusBadge(record.consent?.status)}>{record.consent?.status || "N/A"}</span></p>
                                <p className="mb-2"><strong>Granted Date:</strong> {record.consent?.granteddate || "N/A"}</p>
                                <p className="mb-0"><strong>Expiry Date:</strong> {record.consent?.expirydate || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Notes Editor */}
                {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", backgroundColor: "#ffffff" }}>
                        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-1">
                            <h5 className="fw-bold text-dark d-flex align-items-center">
                                <FaEdit className="me-2 text-primary" /> Update Clinical Description / Seen notes
                            </h5>
                        </div>
                        <div className="card-body px-4 pb-4">
                            <textarea
                                className="form-control mb-3 border-2"
                                rows="4"
                                placeholder="Write description or clinical notes regarding the patient..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ borderRadius: "10px" }}
                            />
                            <button
                                className="btn btn-success px-4 fw-bold"
                                onClick={handleSaveDescription}
                                disabled={saving}
                                style={{ borderRadius: "8px" }}
                            >
                                {saving ? "Saving..." : "Save Description"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mb-4">
                    <button
                        className="btn btn-secondary px-5 fw-bold"
                        onClick={() => navigate("/fhir")}
                        style={{ borderRadius: "8px" }}
                    >
                        Back
                    </button>
                </div>

                {/* Additional Hover lift styling */}
                <style>{`
                    .hover-lift:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export default ViewFhir;
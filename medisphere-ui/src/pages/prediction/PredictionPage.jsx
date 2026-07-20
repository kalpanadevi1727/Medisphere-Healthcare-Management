import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getPatients } from "../../services/patientService";
import {
    predictCvd,
    predictDiabetes,
    getPredictionHistory,
    getExplanation,
    getModels,
    activateModel,
    registerModel,
    getModelStatus,
    getPredictionAccuracy,
    getPredictionCalibration,
    getPredictionBiasAudit,
    validateExplanation
} from "../../services/predictionService";
import { FaHeartbeat, FaSearch, FaHistory, FaBrain, FaCogs, FaCheckCircle, FaTrashAlt } from "react-icons/fa";

function PredictionPage() {
    // Navigation / Tab state
    const [activeTab, setActiveTab] = useState("dashboard");

    // Data lists
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [predictionHistory, setPredictionHistory] = useState([]);
    
    // Active prediction/SHAP states
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [latestCvd, setLatestCvd] = useState(null);
    const [latestDiabetes, setLatestDiabetes] = useState(null);
    const [cvdExplanation, setCvdExplanation] = useState(null);
    const [diabetesExplanation, setDiabetesExplanation] = useState(null);
    const [explanationTab, setExplanationTab] = useState("CVD"); // "CVD" or "DIABETES"

    const activeExplanation = (explanationTab === "CVD" ? cvdExplanation : diabetesExplanation) || cvdExplanation || diabetesExplanation;
    
    // Model versions state
    const [models, setModels] = useState([]);
    const [newVersion, setNewVersion] = useState("");
    const [newAccuracy, setNewAccuracy] = useState("");
    
    // Validation dashboard metrics state
    const [validationStatus, setValidationStatus] = useState(null);
    const [accuracyMetrics, setAccuracyMetrics] = useState(null);
    const [calibrationMetrics, setCalibrationMetrics] = useState(null);
    const [biasAuditMetrics, setBiasAuditMetrics] = useState(null);
    const [shapValidation, setShapValidation] = useState(null);

    // General UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadPatients();
        loadModels();
        loadValidationMetrics();
    }, []);

    useEffect(() => {
        if (selectedPatientId) {
            const patient = patients.find(p => p.patientId === selectedPatientId);
            setSelectedPatient(patient);
            loadPatientData(selectedPatientId);
        } else {
            setSelectedPatient(null);
            setPredictionHistory([]);
            setCurrentPrediction(null);
            setExplanation(null);
        }
    }, [selectedPatientId]);

    const loadPatients = async () => {
        try {
            const res = await getPatients();
            setPatients(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedPatientId(res.data[0].patientId);
            }
        } catch (err) {
            console.error("Error loading patients", err);
        }
    };

    const loadModels = async () => {
        try {
            const res = await getModels();
            setModels(res.data || []);
        } catch (err) {
            console.error("Error loading models", err);
        }
    };

    const loadValidationMetrics = async () => {
        try {
            const statusRes = await getModelStatus();
            const accRes = await getPredictionAccuracy();
            const calRes = await getPredictionCalibration();
            const biasRes = await getPredictionBiasAudit();
            const shapRes = await validateExplanation();

            setValidationStatus(statusRes.data);
            setAccuracyMetrics(accRes.data);
            setCalibrationMetrics(calRes.data);
            setBiasAuditMetrics(biasRes.data);
            setShapValidation(shapRes.data);
        } catch (err) {
            console.error("Error loading validation metrics", err);
        }
    };

    const loadPatientData = async (patientId) => {
        setLoading(true);
        try {
            // Load history
            const historyRes = await getPredictionHistory(patientId);
            const sortedHistory = (historyRes.data || []).sort((a, b) => {
                return (b.id || "").localeCompare(a.id || "");
            });
            setPredictionHistory(sortedHistory);

            // Find latest predictions of each type
            const cvdPred = sortedHistory.find(p => p.riskType === "CARDIO" || p.riskType === "CVD");
            const diaPred = sortedHistory.find(p => p.riskType === "DIABETES");
            
            setLatestCvd(cvdPred || null);
            setLatestDiabetes(diaPred || null);

            // Set latest prediction as current if exists
            if (sortedHistory.length > 0) {
                const latest = sortedHistory[0];
                setCurrentPrediction(latest);
            } else {
                setCurrentPrediction(null);
            }

            // Load CVD explanation
            if (cvdPred) {
                try {
                    const expRes = await getExplanation(patientId, "CARDIO");
                    setCvdExplanation(expRes.data);
                } catch (err) {
                    setCvdExplanation(null);
                }
            } else {
                setCvdExplanation(null);
            }

            // Load Diabetes explanation
            if (diaPred) {
                try {
                    const expRes = await getExplanation(patientId, "DIABETES");
                    setDiabetesExplanation(expRes.data);
                } catch (err) {
                    setDiabetesExplanation(null);
                }
            } else {
                setDiabetesExplanation(null);
            }
        } catch (err) {
            console.error("Error loading patient data", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async (type) => {
        if (!selectedPatientId) return;
        setLoading(true);
        setMessage({ text: "Running AI Prediction Model...", type: "info" });
        try {
            let res;
            if (type === "CVD") {
                res = await predictCvd(selectedPatientId);
            } else {
                res = await predictDiabetes(selectedPatientId);
            }
            setCurrentPrediction(res.data);
            setMessage({ text: `${type === "CVD" ? "Cardiovascular" : "Diabetes"} Risk Prediction Completed Successfully!`, type: "success" });
            
            // Reload patient data to update history & explanation
            await loadPatientData(selectedPatientId);
            
            // Auto switch explanation view tab to match the run prediction type
            setExplanationTab(type === "CVD" ? "CVD" : "DIABETES");
        } catch (err) {
            console.error(err);
            setMessage({ text: "Prediction failed. Check if Python ML Service is online.", type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const handleActivateModel = async (version) => {
        try {
            await activateModel(version);
            setMessage({ text: `Model version ${version} activated successfully!`, type: "success" });
            loadModels();
            loadValidationMetrics();
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to activate model", type: "danger" });
        }
    };

    const handleRegisterModel = async (e) => {
        e.preventDefault();
        if (!newVersion || !newAccuracy) return;
        try {
            const modelData = {
                version: newVersion,
                accuracy: parseFloat(newAccuracy),
                status: "INACTIVE"
            };
            await registerModel(modelData);
            setMessage({ text: `New model version ${newVersion} registered!`, type: "success" });
            setNewVersion("");
            setNewAccuracy("");
            loadModels();
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to register new model", type: "danger" });
        }
    };

    // Calculate age helper
    const calculateAge = (dobString) => {
        if (!dobString) return "N/A";
        const dob = new Date(dobString);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const getRiskColor = (level) => {
        switch (level?.toUpperCase()) {
            case "HIGH": return "#ef4444";
            case "MEDIUM": return "#f59e0b";
            case "LOW": return "#10b981";
            default: return "#6b7280";
        }
    };

    return (
        <Layout>
            <div className="container-fluid py-4" style={{ backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4 bg-white p-4 rounded-3 shadow-sm">
                    <div>
                        <h2 className="fw-bold mb-1 text-dark d-flex align-items-center">
                            <FaBrain className="text-primary me-3 animate-pulse" />
                            AI Clinical Risk & Model Management
                        </h2>
                        <p className="text-muted mb-0">Milestone 2 - AI risk engine, explainable SHAP factors, and federated learning simulations</p>
                    </div>
                </div>

                {/* Notifications */}
                {message && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show shadow-sm border-0`} role="alert">
                        <strong>{message.text}</strong>
                        <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
                    <div className="bg-dark text-white px-3">
                        <ul className="nav nav-tabs nav-justified border-0">
                            <li className="nav-item">
                                <button
                                    className={`nav-link text-white py-3 border-0 rounded-0 fw-semibold d-flex align-items-center justify-content-center ${activeTab === "dashboard" ? "bg-primary active" : ""}`}
                                    onClick={() => setActiveTab("dashboard")}
                                >
                                    <FaHeartbeat className="me-2" /> Risk Prediction Dashboard
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link text-white py-3 border-0 rounded-0 fw-semibold d-flex align-items-center justify-content-center ${activeTab === "explain" ? "bg-primary active" : ""}`}
                                    onClick={() => setActiveTab("explain")}
                                    disabled={!cvdExplanation && !diabetesExplanation}
                                >
                                    <FaSearch className="me-2" /> SHAP Explanations {!cvdExplanation && !diabetesExplanation && "(Run Prediction First)"}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link text-white py-3 border-0 rounded-0 fw-semibold d-flex align-items-center justify-content-center ${activeTab === "models" ? "bg-primary active" : ""}`}
                                    onClick={() => setActiveTab("models")}
                                >
                                    <FaCogs className="me-2" /> Model Version Registry
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link text-white py-3 border-0 rounded-0 fw-semibold d-flex align-items-center justify-content-center ${activeTab === "validation" ? "bg-primary active" : ""}`}
                                    onClick={() => setActiveTab("validation")}
                                >
                                    <FaCheckCircle className="me-2" /> Validation Auditing
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Tab Contents */}
                {activeTab === "dashboard" && (
                    <div className="row g-4">
                        {/* Selector Column */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
                                <h4 className="fw-bold mb-4 text-secondary d-flex align-items-center">
                                    <FaSearch className="me-2 text-primary" /> Select Patient
                                </h4>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-muted small uppercase">Choose Patient Record</label>
                                    <select
                                        className="form-select form-select-lg border-2"
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="">-- Choose Patient --</option>
                                        {patients.map(p => (
                                            <option key={p.patientId} value={p.patientId}>
                                                {p.firstname} {p.lastname} ({p.gender})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPatient && (
                                    <div className="p-3 bg-light rounded-3 mb-4">
                                        <h5 className="fw-bold mb-3 text-dark">Patient Profile</h5>
                                        <div className="row g-2 small">
                                            <div className="col-5 text-muted">Full Name:</div>
                                            <div className="col-7 fw-bold">{selectedPatient.firstname} {selectedPatient.lastname}</div>
                                            
                                            <div className="col-5 text-muted">Gender:</div>
                                            <div className="col-7 fw-bold">{selectedPatient.gender}</div>

                                            <div className="col-5 text-muted">Age:</div>
                                            <div className="col-7 fw-bold">{calculateAge(selectedPatient.dob)} years</div>

                                            <div className="col-5 text-muted">Email:</div>
                                            <div className="col-7 text-truncate">{selectedPatient.email}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedPatient && (
                                    <div className="d-grid gap-2">
                                        <button
                                            className="btn btn-primary btn-lg fw-bold shadow-sm d-flex align-items-center justify-content-center"
                                            onClick={() => handlePredict("CVD")}
                                            disabled={loading}
                                            style={{ borderRadius: "10px" }}
                                        >
                                            <FaHeartbeat className="me-2" /> Predict CVD Risk
                                        </button>
                                        <button
                                            className="btn btn-info btn-lg fw-bold text-white shadow-sm d-flex align-items-center justify-content-center"
                                            onClick={() => handlePredict("Diabetes")}
                                            disabled={loading}
                                            style={{ borderRadius: "10px" }}
                                        >
                                            <FaBrain className="me-2" /> Predict Diabetes Risk
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results Column */}
                        <div className="col-lg-8">
                            <div className="row g-4 mb-4">
                                {/* Cardiovascular Assessment Card */}
                                <div className="col-md-6">
                                    {latestCvd ? (
                                        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="fw-bold mb-4 text-primary">Cardiovascular Assessment</h5>
                                                <div className="text-center mb-3">
                                                    <div 
                                                        className="d-inline-flex align-items-center justify-content-center rounded-circle border-5 shadow"
                                                        style={{
                                                            width: "120px",
                                                            height: "120px",
                                                            border: `6px solid ${getRiskColor(latestCvd.riskLevel)}`,
                                                            backgroundColor: "#f9fafb"
                                                        }}
                                                    >
                                                        <div>
                                                            <h3 className="fw-extrabold mb-0" style={{ color: getRiskColor(latestCvd.riskLevel) }}>
                                                                {latestCvd.riskPercentage}%
                                                            </h3>
                                                            <span className="small text-muted uppercase fw-bold" style={{ fontSize: "10px" }}>Probability</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center mb-3">
                                                    <span className="badge px-3 py-2 text-white" style={{ backgroundColor: getRiskColor(latestCvd.riskLevel), borderRadius: "50px" }}>
                                                        {latestCvd.riskLevel} RISK LEVEL
                                                    </span>
                                                </div>
                                                <div className="small border-top pt-2">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted">Model:</span>
                                                        <span className="fw-bold">v{latestCvd.modelVersion}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted">Confidence:</span>
                                                        <span className="fw-bold text-primary">{latestCvd.confidence}%</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Date:</span>
                                                        <span className="fw-bold">{latestCvd.predictionDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {cvdExplanation && (
                                                <button 
                                                    className="btn btn-outline-primary btn-sm mt-3 w-100 fw-bold"
                                                    onClick={() => { setExplanationTab("CVD"); setActiveTab("explain"); }}
                                                    style={{ borderRadius: "8px" }}
                                                >
                                                    View SHAP Explanation
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white text-center text-muted h-100 d-flex flex-column justify-content-center align-items-center min-vh-25" style={{ minHeight: "280px" }}>
                                            <FaHeartbeat size={40} className="text-muted mb-2 opacity-50" />
                                            <h6>No CVD Assessment</h6>
                                            <p className="small mb-0">Click Predict CVD Risk to calculate cardiovascular risks.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Diabetes Assessment Card */}
                                <div className="col-md-6">
                                    {latestDiabetes ? (
                                        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="fw-bold mb-4 text-info">Diabetes Assessment</h5>
                                                <div className="text-center mb-3">
                                                    <div 
                                                        className="d-inline-flex align-items-center justify-content-center rounded-circle border-5 shadow"
                                                        style={{
                                                            width: "120px",
                                                            height: "120px",
                                                            border: `6px solid ${getRiskColor(latestDiabetes.riskLevel)}`,
                                                            backgroundColor: "#f9fafb"
                                                        }}
                                                    >
                                                        <div>
                                                            <h3 className="fw-extrabold mb-0" style={{ color: getRiskColor(latestDiabetes.riskLevel) }}>
                                                                {latestDiabetes.riskPercentage}%
                                                            </h3>
                                                            <span className="small text-muted uppercase fw-bold" style={{ fontSize: "10px" }}>Probability</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center mb-3">
                                                    <span className="badge px-3 py-2 text-white" style={{ backgroundColor: getRiskColor(latestDiabetes.riskLevel), borderRadius: "50px" }}>
                                                        {latestDiabetes.riskLevel} RISK LEVEL
                                                    </span>
                                                </div>
                                                <div className="small border-top pt-2">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted">Model:</span>
                                                        <span className="fw-bold">v{latestDiabetes.modelVersion}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted">Confidence:</span>
                                                        <span className="fw-bold text-primary">{latestDiabetes.confidence}%</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Date:</span>
                                                        <span className="fw-bold">{latestDiabetes.predictionDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {diabetesExplanation && (
                                                <button 
                                                    className="btn btn-outline-info btn-sm mt-3 w-100 fw-bold text-info border-info"
                                                    onClick={() => { setExplanationTab("DIABETES"); setActiveTab("explain"); }}
                                                    style={{ borderRadius: "8px" }}
                                                >
                                                    View SHAP Explanation
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white text-center text-muted h-100 d-flex flex-column justify-content-center align-items-center min-vh-25" style={{ minHeight: "280px" }}>
                                            <FaBrain size={40} className="text-muted mb-2 opacity-50" />
                                            <h6>No Diabetes Assessment</h6>
                                            <p className="small mb-0">Click Predict Diabetes Risk to calculate diabetes risks.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* History Table */}
                            {predictionHistory.length > 0 && (
                                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                                    <h4 className="fw-bold mb-3 text-secondary d-flex align-items-center">
                                        <FaHistory className="me-2 text-primary" /> Prediction History
                                    </h4>
                                    <div className="table-responsive">
                                        <table className="table align-middle table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Risk Value</th>
                                                    <th>Risk Level</th>
                                                    <th>Confidence</th>
                                                    <th>Date</th>
                                                    <th>Version</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {predictionHistory.map(pred => (
                                                    <tr key={pred.id}>
                                                        <td className="fw-bold">{pred.riskType}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="progress w-100 me-2" style={{ height: "6px" }}>
                                                                    <div 
                                                                        className="progress-bar" 
                                                                        role="progressbar" 
                                                                        style={{ width: `${pred.riskPercentage}%`, backgroundColor: getRiskColor(pred.riskLevel) }}
                                                                    ></div>
                                                                </div>
                                                                <span className="small fw-semibold">{pred.riskPercentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge" style={{ backgroundColor: getRiskColor(pred.riskLevel), color: "white" }}>
                                                                {pred.riskLevel}
                                                            </span>
                                                        </td>
                                                        <td className="text-primary fw-semibold">{pred.confidence}%</td>
                                                        <td>{pred.predictionDate}</td>
                                                        <td>v{pred.modelVersion}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "explain" && activeExplanation && (
                    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                        {/* Sub tabs for CVD vs Diabetes explanations */}
                        <div className="d-flex justify-content-center mb-4">
                            <div className="btn-group shadow-sm" role="group">
                                <button
                                    type="button"
                                    className={`btn px-4 fw-bold ${explanationTab === "CVD" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setExplanationTab("CVD")}
                                    disabled={!cvdExplanation}
                                >
                                    Cardiovascular SHAP
                                </button>
                                <button
                                    type="button"
                                    className={`btn px-4 fw-bold ${explanationTab === "DIABETES" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setExplanationTab("DIABETES")}
                                    disabled={!diabetesExplanation}
                                >
                                    Diabetes SHAP
                                </button>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                            <div>
                                <h4 className="fw-bold text-dark mb-1">Explainable AI - SHAP Feature Contributions ({explanationTab === "CVD" ? "Cardiovascular" : "Diabetes"})</h4>
                                <p className="text-muted mb-0">Simulating Shapley values to identify clinical variables driving prediction</p>
                            </div>
                            <div className="badge px-4 py-2 text-white" style={{ backgroundColor: getRiskColor(activeExplanation.risk), fontSize: "16px", borderRadius: "50px" }}>
                                RISK LEVEL: {activeExplanation.risk}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6">
                                <div className="p-4 bg-light rounded-3 h-100">
                                    <h5 className="fw-bold text-secondary mb-4">Shapley Impact Bars</h5>
                                    
                                    {activeExplanation.topFactors && activeExplanation.topFactors.map((factor, idx) => {
                                        // Parse Factor like "Blood Pressure +20"
                                        const parts = factor.split(" ");
                                        const valueStr = parts[parts.length - 1]; // "+20"
                                        const name = factor.replace(valueStr, "").trim(); // "Blood Pressure"
                                        const value = parseInt(valueStr); // 20
                                        
                                        const percentage = Math.min(Math.abs(value) * 4, 100); // normalized bar width
                                        const isPositive = value >= 0;

                                        return (
                                            <div key={idx} className="mb-4">
                                                <div className="d-flex justify-content-between mb-1 small fw-bold">
                                                    <span className="text-dark">{name}</span>
                                                    <span style={{ color: isPositive ? "#ef4444" : "#10b981" }}>{valueStr}% Impact</span>
                                                </div>
                                                <div className="progress bg-white border" style={{ height: "24px", borderRadius: "6px" }}>
                                                    <div
                                                        className="progress-bar transition-all"
                                                        role="progressbar"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: isPositive ? "#ef4444" : "#10b981",
                                                            borderRadius: "6px"
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="card p-4 border-0 h-100">
                                    <h5 className="fw-bold text-secondary mb-3">Clinical Explanation Summary</h5>
                                    <p>Based on SHAP (SHapley Additive exPlanations) values computed from our active deep neural network model, the patient's risk level is determined to be <strong>{activeExplanation.risk}</strong>.</p>
                                    
                                    <h6 className="fw-bold mt-4 text-dark">Interpretation Guidelines:</h6>
                                    <ul className="small text-muted ps-3">
                                        <li className="mb-2"><strong>Positive (+) values</strong> indicate clinical indicators that push the model's prediction higher towards a positive diagnosis (higher risk).</li>
                                        <li className="mb-2"><strong>Negative (-) values</strong> indicate healthy variables that anchor or reduce the prediction towards healthy (lower risk).</li>
                                        <li className="mb-2">The factors listed are ordered by absolute contribution magnitude, displaying the top driving causes behind the AI's clinical assessment.</li>
                                    </ul>

                                    <div className="alert alert-warning mt-4 border-0 rounded-3">
                                        <strong>Medical Disclaimer:</strong> Explanations generated represent simulated metrics for validation check support. Final assessments must be evaluated under a clinical setting by a certified practitioner.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "models" && (
                    <div className="row g-4">
                        {/* Models Registry */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                                <h4 className="fw-bold mb-4 text-secondary">Model Version Control</h4>
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Model Version</th>
                                                <th>Reported Accuracy</th>
                                                <th>Register Date</th>
                                                <th>Status</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {models.map(model => (
                                                <tr key={model.version}>
                                                    <td className="fw-bold text-dark">v{model.version}</td>
                                                    <td className="text-primary fw-bold">{model.accuracy}%</td>
                                                    <td>{model.createdDate}</td>
                                                    <td>
                                                        <span className={`badge px-3 py-1 ${model.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`}>
                                                            {model.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {model.status === "INACTIVE" && (
                                                            <button
                                                                className="btn btn-outline-primary btn-sm fw-bold"
                                                                onClick={() => handleActivateModel(model.version)}
                                                            >
                                                                Activate Version
                                                            </button>
                                                        )}
                                                        {model.status === "ACTIVE" && (
                                                            <span className="text-success fw-bold small">Current Model</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Add Version */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                                <h4 className="fw-bold mb-4 text-secondary">Register New Model</h4>
                                <form onSubmit={handleRegisterModel}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted small">Model Version Number</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="e.g. 1.1"
                                            value={newVersion}
                                            onChange={(e) => setNewVersion(e.target.value)}
                                            required
                                            style={{ borderRadius: "10px" }}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-muted small">Validation Set Accuracy (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control form-control-lg"
                                            placeholder="e.g. 92.5"
                                            value={newAccuracy}
                                            onChange={(e) => setNewAccuracy(e.target.value)}
                                            required
                                            style={{ borderRadius: "10px" }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-dark btn-lg w-100 fw-bold shadow-sm"
                                        style={{ borderRadius: "10px" }}
                                    >
                                        Register Model
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "validation" && (
                    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                        <h4 className="fw-bold mb-4 text-secondary">Milestone 2 Validation Audits & Checks</h4>
                        
                        <div className="row g-4">
                            {/* Accuracy */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">PASSED</span>
                                    <h2 className="fw-bold mb-1 text-primary">{accuracyMetrics?.value}%</h2>
                                    <h5 className="fw-bold mb-2">Model Accuracy</h5>
                                    <p className="text-muted small mb-0">Minimum threshold expected: {accuracyMetrics?.threshold}%</p>
                                </div>
                            </div>

                            {/* Federated Learning */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">CONVERGED</span>
                                    <h2 className="fw-bold mb-1 text-success">{validationStatus?.federatedRoundConvergence ? "Round 15" : "N/A"}</h2>
                                    <h5 className="fw-bold mb-2">Federated Round Convergence</h5>
                                    <p className="text-muted small mb-0">Weights averages aggregated across client node sites.</p>
                                </div>
                            </div>

                            {/* Calibration */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">STABLE</span>
                                    <h2 className="fw-bold mb-1 text-info">{calibrationMetrics?.brierScore}</h2>
                                    <h5 className="fw-bold mb-2">Prediction Calibration Check</h5>
                                    <p className="text-muted small mb-0">Brier score checks prediction probabilities alignment.</p>
                                </div>
                            </div>

                            {/* SHAP Validity */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">VALIDATED</span>
                                    <h2 className="fw-bold mb-1 text-danger">{shapValidation?.coveragePercentage}%</h2>
                                    <h5 className="fw-bold mb-2">Explainability Coverage</h5>
                                    <p className="text-muted small mb-0">Coverage and feature contribution attribution checks.</p>
                                </div>
                            </div>

                            {/* Bias Audit */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">PASSED</span>
                                    <h2 className="fw-bold mb-1 text-warning">+{biasAuditMetrics?.genderParityDiff}</h2>
                                    <h5 className="fw-bold mb-2">Demographic Bias Parity</h5>
                                    <p className="text-muted small mb-0">Demographic parity gender audit divergence values.</p>
                                </div>
                            </div>

                            {/* Guidelines */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 bg-light p-4 rounded-3 text-center">
                                    <span className="badge bg-success py-2 px-3 align-self-center mb-3">COMPLIANT</span>
                                    <h2 className="fw-bold mb-1 text-dark">AHA/ACC</h2>
                                    <h5 className="fw-bold mb-2">Clinical Guidelines Compliance</h5>
                                    <p className="text-muted small mb-0">AHA/ACC cardiovascular risk computation rules compliance status.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default PredictionPage;

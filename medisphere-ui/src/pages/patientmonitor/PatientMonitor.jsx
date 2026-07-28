import { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import { 
    saveVitals, 
    getAllAlerts, 
    acknowledgeAlert, 
    closeAlert, 
    getAlertMetrics,
    getThresholds,
    saveThresholds,
    clearAllAlerts,
    getAllVitals
} from "../../services/vitalsService";
import { getPatients } from "../../services/patientService";
import keycloak from "../../auth/keycloak";
import { 
    FaUsers, 
    FaPlay, 
    FaStop, 
    FaBell, 
    FaCheck, 
    FaTimes, 
    FaExchangeAlt, 
    FaShieldAlt,
    FaCogs
} from "react-icons/fa";

function PatientMonitor() {
    const isDoctor = keycloak.hasRealmRole("DOCTOR");
    const isPatient = keycloak.hasRealmRole("PATIENT");
    const isAdmin = keycloak.hasRealmRole("ADMIN");

    // Fetch doctor specialty if logged in as a doctor
    const docUserStr = sessionStorage.getItem("doctor_portal_user");
    let docUser = null;
    if (docUserStr) {
        try { docUser = JSON.parse(docUserStr); } catch (e) {}
    }
    const doctorSpecialty = docUser ? docUser.role : null;

    // Fetch patient portal user if logged in as patient
    const patientUserStr = sessionStorage.getItem("patient_portal_user");
    let patientUser = null;
    if (patientUserStr) {
        try { patientUser = JSON.parse(patientUserStr); } catch (e) {}
    }

    // Simulation states
    const timerRef = useRef(null);
    const [running, setRunning] = useState(false);
    const [patientsList, setPatientsList] = useState([]);
    const [simulationLogs, setSimulationLogs] = useState([]);

    const [vitals, setVitals] = useState({
        patientId: "",
        heartbeat: 80,
        bloodpressure: "120/80",
        oxygenlevel: 98,
        bloodsuger: 110,
        pulserate: 80,
        systolicbp: 120,
        bpm: 80,
        bloodglucose: 6.1,
        cholesterol: 180
    });

    // Alert dashboard states
    const [alerts, setAlerts] = useState([]);
    const [metrics, setMetrics] = useState({
        wearablesOnline: 892,
        alertsToday: 47,
        criticalAlertsToday: 5,
        averageResponseTimeMinutes: 3.2,
        precisionPercent: 88.5,
        falseAlertRatePercent: 2.1
    });

    const [selectedAlert, setSelectedAlert] = useState(null);

    // Range threshold settings
    const [thresholds, setThresholds] = useState({
        hrMin: 60,
        hrMax: 100,
        systolicMin: 90,
        systolicMax: 120,
        spO2Min: 95,
        sugarMax: 140
    });

    useEffect(() => {
        if (isPatient && !isDoctor && !isAdmin) {
            window.location.href = "/";
            return;
        }

        loadInitialData();
        // Poll alerts and metrics every 5 seconds to show real-time changes
        const pollId = setInterval(() => {
            fetchAlertData();
        }, 5000);

        return () => {
            clearInterval(pollId);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const loadInitialData = async () => {
        try {
            // Clear alerts to start freshly on mount or page refresh
            try {
                await clearAllAlerts();
            } catch (err) {
                console.warn("Failed to clear alerts on load", err);
            }

            const res = await getPatients();
            let initialPatientId = "";
            // If logged in as patient, restrict simulation target dropdown list to only themselves
            if (isPatient && patientUser) {
                setPatientsList([patientUser]);
                setVitals(prev => ({
                    ...prev,
                    patientId: patientUser.patientId
                }));
                initialPatientId = patientUser.patientId;
            } else {
                setPatientsList(res.data || []);
                if (res.data && res.data.length > 0) {
                    setVitals(prev => ({
                        ...prev,
                        patientId: res.data[0].patientId
                    }));
                    initialPatientId = res.data[0].patientId;
                }
            }
            
            // Load custom thresholds from database
            const threshRes = await getThresholds();
            if (threshRes.data) {
                setThresholds(threshRes.data);
            }

            if (initialPatientId) {
                loadPatientVitals(initialPatientId);
            }

            fetchAlertData();
        } catch (err) {
            console.error("Error loading initial data", err);
        }
    };

    const loadPatientVitals = async (pId) => {
        if (!pId) return;
        try {
            const res = await getAllVitals();
            const pVitals = (res.data || []).find(v => v.patientId === pId);
            if (pVitals) {
                setVitals({
                    patientId: pId,
                    heartbeat: pVitals.heartbeat || 80,
                    bloodpressure: pVitals.bloodpressure || "120/80",
                    oxygenlevel: pVitals.oxygenlevel || 98,
                    bloodsuger: pVitals.bloodsuger || 110,
                    pulserate: pVitals.pulserate || pVitals.heartbeat || 80,
                    systolicbp: pVitals.systolicbp || 120,
                    bpm: pVitals.bpm || pVitals.heartbeat || 80,
                    bloodglucose: pVitals.bloodglucose || 6.1,
                    cholesterol: pVitals.cholesterol || 180
                });
            } else {
                setVitals({
                    patientId: pId,
                    heartbeat: 80,
                    bloodpressure: "120/80",
                    oxygenlevel: 98,
                    bloodsuger: 110,
                    pulserate: 80,
                    systolicbp: 120,
                    bpm: 80,
                    bloodglucose: 6.1,
                    cholesterol: 180
                });
            }
        } catch (err) {
            console.error("Failed to load patient vitals", err);
        }
    };

    const handlePatientChange = (e) => {
        const selectedId = e.target.value;
        setVitals(prev => ({
            ...prev,
            patientId: selectedId
        }));
        loadPatientVitals(selectedId);
    };

    const handleSaveThresholds = async () => {
        try {
            await saveThresholds(thresholds);
            alert("Alert threshold limits updated successfully!");
            fetchAlertData();
        } catch (err) {
            console.error("Failed to save thresholds", err);
            alert("Failed to update thresholds configuration");
        }
    };

    const fetchAlertData = async () => {
        try {
            // Scoped alerts based on doctor specialty
            const filterSpecialty = isDoctor ? doctorSpecialty : null;
            const alertsRes = await getAllAlerts(filterSpecialty);
            
            let fetchedAlerts = alertsRes.data || [];
            
            // If patient is logged in, filter to only show their own alerts
            if (isPatient && patientUser) {
                fetchedAlerts = fetchedAlerts.filter(a => a.patientId === patientUser.patientId);
            }
            
            setAlerts(fetchedAlerts);

            const metricsRes = await getAlertMetrics();
            if (metricsRes.data) {
                setMetrics(metricsRes.data);
            }
        } catch (err) {
            console.error("Failed to load alerts/metrics", err);
        }
    };

    const handleThresholdChange = (e) => {
        setThresholds({
            ...thresholds,
            [e.target.name]: Number(e.target.value)
        });
    };

    const handleChange = (e) => {
        const val = e.target.name === "bloodsuger" ? Number(e.target.value) : e.target.value;
        setVitals({
            ...vitals,
            [e.target.name]: val
        });
    };

    const vitalsRef = useRef(vitals);
    vitalsRef.current = vitals;

    const startMonitoring = () => {
        if (running) return;
        if (!vitals.patientId) {
            alert("Please select a Patient ID to begin simulation.");
            return;
        }
        setRunning(true);
        setSimulationLogs(prev => [`[System] Simulation started for Patient ID: ${vitals.patientId}`, ...prev]);

        timerRef.current = setInterval(async () => {
            const prev = vitalsRef.current;
            
            // Fluctuating values randomly to simulate live streams
            const heart = Math.max(40, Math.min(200, Number(prev.heartbeat) + Math.floor(Math.random() * 9 - 4)));
            const oxygen = Math.max(80, Math.min(100, Number(prev.oxygenlevel) + Math.floor(Math.random() * 5 - 2)));
            const sugar = Math.max(50, Math.min(400, Number(prev.bloodsuger) + Math.floor(Math.random() * 11 - 5)));
            
            let bpParts = prev.bloodpressure.split("/");
            let systolic = bpParts[0] ? Number(bpParts[0]) : 120;
            let diastolic = bpParts[1] ? Number(bpParts[1]) : 80;
            systolic = Math.max(80, Math.min(220, systolic + Math.floor(Math.random() * 7 - 3)));
            diastolic = Math.max(50, Math.min(120, diastolic + Math.floor(Math.random() * 5 - 2)));

            const nextVitals = {
                ...prev,
                heartbeat: heart,
                oxygenlevel: oxygen,
                bloodsuger: sugar,
                pulserate: heart,
                bpm: heart,
                systolicbp: systolic,
                bloodglucose: Math.round((sugar / 18.0) * 10) / 10,
                bloodpressure: `${systolic}/${diastolic}`
            };

            setVitals(nextVitals);

            try {
                await saveVitals(nextVitals);
                setSimulationLogs(prevLogs => [
                    `[Vitals Sent] HR: ${heart} bpm | BP: ${systolic}/${diastolic} | SpO2: ${oxygen}% | Sugar: ${sugar} mg/dL`,
                    ...prevLogs.slice(0, 19)
                ]);
            } catch (err) {
                console.error("Vitals simulation upload failed", err);
            }
        }, 10000);
    };

    const stopMonitoring = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setRunning(false);
        setSimulationLogs(prev => ["[System] Simulation stopped", ...prev]);
    };

    const handleAcknowledge = async (id) => {
        try {
            await acknowledgeAlert(id);
            fetchAlertData();
        } catch (err) {
            console.error("Failed to acknowledge alert", err);
        }
    };

    const handleClose = async (id) => {
        try {
            await closeAlert(id);
            fetchAlertData();
        } catch (err) {
            console.error("Failed to close alert", err);
        }
    };

    const getSeverityBadge = (sev) => {
        const s = (sev || "").toLowerCase();
        if (s === "critical") return { bg: "#7f1d1d", color: "#fca5a5", label: "Critical" };
        if (s === "high") return { bg: "#dc2626", color: "#fecaca", label: "High" };
        if (s === "medium") return { bg: "#ea580c", color: "#ffedd5", label: "Medium" };
        return { bg: "#eab308", color: "#fef9c3", label: "Low" };
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "CLOSED") return "badge bg-secondary";
        if (s === "ACKNOWLEDGED") return "badge bg-info text-dark";
        if (s === "SENT" || s === "DELIVERED") return "badge bg-warning text-dark";
        return "badge bg-danger";
    };

    return (
        <Layout>
            <div className="container-fluid py-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#f7f8f8" }}>
                            Continuous Patient Monitor
                        </h2>
                        <p style={{ color: "#9ca3af" }}>
                            Real-time streaming ingestion, rule breaches evaluation, and AI-driven alerting.
                            {doctorSpecialty && <span className="ms-2 badge bg-primary">Inbox filtered: {doctorSpecialty}</span>}
                        </p>
                    </div>
                </div>

                {/* Key Metrics Row */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-4 col-sm-6">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: "#ffffff" }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Patient Count</h6>
                                    <h3 className="fw-bold mb-0 text-dark">{metrics.wearablesOnline}</h3>
                                </div>
                                <div className="p-3 bg-light rounded-circle text-primary">
                                    <FaUsers size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 col-sm-6">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: "#ffffff" }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Alerts Today</h6>
                                    <h3 className="fw-bold mb-0 text-danger">
                                        {metrics.alertsToday} <span className="small text-muted fw-normal">({metrics.criticalAlertsToday} Critical)</span>
                                    </h3>
                                </div>
                                <div className="p-3 bg-danger-subtle rounded-circle text-danger">
                                    <FaBell size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 col-sm-6">
                        <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: "#ffffff" }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Precision / False-Rate</h6>
                                    <h3 className="fw-bold mb-0 text-success">
                                        {metrics.precisionPercent}% <span className="small text-muted fw-normal">/ {metrics.falseAlertRatePercent}%</span>
                                    </h3>
                                </div>
                                <div className="p-3 bg-success-subtle rounded-circle text-success">
                                    <FaShieldAlt size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Active Alerts List (Left Column) */}
                    <div className="col-xl-8">
                        <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: "#ffffff" }}>
                            <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark mb-0">Active Anomaly Alert Stream</h5>
                                <button className="btn btn-sm btn-outline-secondary" onClick={fetchAlertData}>
                                    Refresh Stream
                                </button>
                            </div>
                            <div className="card-body px-4">
                                <div className="table-responsive" style={{ maxHeight: "550px" }}>
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Severity</th>
                                                <th>Patient ID</th>
                                                <th>Trigger Event</th>
                                                <th>Routing</th>
                                                <th>Status</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alerts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-muted">
                                                        No alerts reported in this stream.
                                                    </td>
                                                </tr>
                                            ) : (
                                                alerts.map((alert) => {
                                                    const badge = getSeverityBadge(alert.severity);
                                                    return (
                                                        <tr key={alert.alertId} style={{ cursor: "pointer" }} onClick={() => setSelectedAlert(alert)}>
                                                            <td>
                                                                <span 
                                                                    className="badge px-3 py-2 fw-semibold"
                                                                    style={{ backgroundColor: badge.bg, color: badge.color }}
                                                                >
                                                                    {badge.label}
                                                                </span>
                                                            </td>
                                                            <td className="small text-muted">{alert.patientId}</td>
                                                            <td>
                                                                <div className="fw-bold text-dark">{alert.description}</div>
                                                                <small className="text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</small>
                                                            </td>
                                                            <td className="small fw-semibold">{alert.routingSpecialty || "General"}</td>
                                                            <td>
                                                                <span className={getStatusBadge(alert.status)}>
                                                                    {alert.status}
                                                                </span>
                                                            </td>
                                                            <td className="text-end" onClick={(e) => e.stopPropagation()}>
                                                                {alert.status !== "CLOSED" && alert.status !== "ACKNOWLEDGED" && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-success me-2"
                                                                        title="Acknowledge Alert"
                                                                        onClick={() => handleAcknowledge(alert.alertId)}
                                                                    >
                                                                        <FaCheck /> Ack
                                                                    </button>
                                                                )}
                                                                {alert.status !== "CLOSED" && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        title="Close Alert"
                                                                        onClick={() => handleClose(alert.alertId)}
                                                                    >
                                                                        <FaTimes /> Close
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Active Alert details + Range limits configuration */}
                    <div className="col-xl-4">
                        <div className="d-flex flex-column gap-4">
                            {/* Alert Details Card */}
                            {selectedAlert && (
                                <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="fw-bold text-dark mb-0">Alert Diagnostic Info</h5>
                                            <button className="btn-close" onClick={() => setSelectedAlert(null)}></button>
                                        </div>
                                        <div className="p-3 bg-light rounded-3 mb-3">
                                            <div className="small text-muted mb-1">AI Explanation & Analysis</div>
                                            <div className="fw-bold text-dark mb-2">{selectedAlert.aiAnalysis}</div>
                                            <div className="small text-muted">
                                                Confidence Score: <span className="fw-bold text-primary">{(selectedAlert.confidenceScore * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="row g-2 small">
                                            <div className="col-5 text-muted">Vitals Event ID:</div>
                                            <div className="col-7 text-truncate">{selectedAlert.vitalsId}</div>
                                            <div className="col-5 text-muted">Reported At:</div>
                                            <div className="col-7">{new Date(selectedAlert.timestamp).toLocaleString()}</div>
                                            {selectedAlert.acknowledgedAt && (
                                                <>
                                                    <div className="col-5 text-muted text-success">Ack At:</div>
                                                    <div className="col-7 text-success">{new Date(selectedAlert.acknowledgedAt).toLocaleTimeString()}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Wearables Simulator Controls */}
                            <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <h5 className="fw-bold text-dark mb-0">Random Vitals Generator Simulator</h5>
                                </div>
                                <div className="card-body px-4 pb-4">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">SELECT SIMULATION TARGET</label>
                                        <select 
                                            className="form-select"
                                            name="patientId"
                                            value={vitals.patientId}
                                            onChange={handlePatientChange}
                                            disabled={running}
                                        >
                                            {patientsList.map(p => (
                                                <option key={p.patientId} value={p.patientId}>
                                                    {p.firstname} {p.lastname} ({p.patientId.slice(0, 8)}...)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">HEART RATE (BPM)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                name="heartbeat" 
                                                value={vitals.heartbeat} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">OXYGEN (%)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                name="oxygenlevel" 
                                                value={vitals.oxygenlevel} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">BP (SYS/DIA)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="bloodpressure" 
                                                value={vitals.bloodpressure} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">GLUCOSE (MG/DL)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                name="bloodsuger" 
                                                value={vitals.bloodsuger} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mt-4">
                                        {!running ? (
                                            <button className="btn btn-success flex-grow-1 fw-bold" onClick={startMonitoring}>
                                                <FaPlay className="me-2" /> Start Stream
                                            </button>
                                        ) : (
                                            <button className="btn btn-danger flex-grow-1 fw-bold" onClick={stopMonitoring}>
                                                <FaStop className="me-2" /> Stop Stream
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Range Validation Configuration */}
                            <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                                <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex align-items-center">
                                    <FaCogs className="text-secondary me-2" />
                                    <h5 className="fw-bold text-dark mb-0">Alert Threshold Limits</h5>
                                </div>
                                <div className="card-body px-4 pb-4">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">HR Max limit</label>
                                            <input type="number" className="form-control form-control-sm" name="hrMax" value={thresholds.hrMax} onChange={handleThresholdChange} />
                                        </div>
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">SpO2 Alert limit</label>
                                            <input type="number" className="form-control form-control-sm" name="spO2Min" value={thresholds.spO2Min} onChange={handleThresholdChange} />
                                        </div>
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">BP Systolic limit</label>
                                            <input type="number" className="form-control form-control-sm" name="systolicMax" value={thresholds.systolicMax} onChange={handleThresholdChange} />
                                        </div>
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">Sugar Alert limit</label>
                                            <input type="number" className="form-control form-control-sm" name="sugarMax" value={thresholds.sugarMax} onChange={handleThresholdChange} />
                                        </div>
                                    </div>
                                    <div className="text-center mt-3">
                                        <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={handleSaveThresholds}>
                                            Save Thresholds
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simulation Logging window */}
                <div className="card border-0 shadow-sm mt-4" style={{ backgroundColor: "#ffffff" }}>
                    <div className="card-header bg-transparent border-0 pt-4 px-4">
                        <h5 className="fw-bold text-dark mb-0">Kafka Live Streaming Logs</h5>
                    </div>
                    <div className="card-body px-4 pb-4">
                        <div className="bg-dark p-3 rounded-3" style={{ height: "150px", overflowY: "auto", fontFamily: "monospace" }}>
                            {simulationLogs.length === 0 ? (
                                <div className="text-muted small">Logs will appear here once the streaming starts.</div>
                            ) : (
                                simulationLogs.map((log, index) => (
                                    <div key={index} className="text-success small mb-1">{log}</div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}

export default PatientMonitor;
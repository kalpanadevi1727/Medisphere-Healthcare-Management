import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getCompleteFhirRecord, updateFhirPatientDescription } from "../../services/fhirService";
import keycloak from "../../auth/keycloak";

function ViewFhir() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRecord();
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
                <h3 className="text-center mt-5">
                    Loading...
                </h3>
            </Layout>
        );

    }

    return (

        <Layout>

            <div className="container mt-4">

                <h2 className="text-center mb-4">
                    Complete FHIR Patient Record
                </h2>

                {/* Patient */}

                <div className="card shadow mb-4">

                    <div className="card-header bg-primary text-white">

                        Patient Details

                    </div>

                    <div className="card-body">

                        <p><strong>Patient ID:</strong> {record.patient?.patientId || "N/A"}</p>

                        <p>
                            <strong>Name:</strong>{" "}
                            {(record.patient?.firstname || "")}{" "}
                            {(record.patient?.lastname || "")}
                        </p>

                        <p><strong>Gender:</strong> {record.patient?.gender || "N/A"}</p>

                        <p><strong>DOB:</strong> {record.patient?.dob || "N/A"}</p>

                        <p><strong>Email:</strong> {record.patient?.email || "N/A"}</p>

                        <p><strong>Phone:</strong> {record.patient?.phoneno || "N/A"}</p>

                        {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                            <p>
                                <strong>Doctor's Description:</strong>{" "}
                                {record.doctorDescription ? (
                                    <span className="text-info">{record.doctorDescription}</span>
                                ) : (
                                    <span className="text-muted italic">No clinical description provided yet</span>
                                )}
                            </p>
                        )}

                    </div>

                </div>

                {/* Health Twin */}

                <div className="card shadow mb-4">

                    <div className="card-header bg-success text-white">

                        Health Twin

                    </div>

                    <div className="card-body">

                        <p><strong>Height:</strong> {record.healthTwin?.height || "N/A"}</p>

                        <p><strong>Weight:</strong> {record.healthTwin?.weight || "N/A"}</p>

                        <p><strong>Temperature:</strong> {record.healthTwin?.temperature || "N/A"}</p>

                        <p><strong>Blood Group:</strong> {record.healthTwin?.bloodgroup || "N/A"}</p>

                        <p><strong>Disease:</strong> {record.healthTwin?.disease || "N/A"}</p>

                    </div>

                </div>

                {/* Vitals */}

                <div className="card shadow mb-4">

                    <div className="card-header bg-danger text-white">

                        Latest Vitals

                    </div>

                    <div className="card-body">

                        <p><strong>Heartbeat:</strong> {record.vitals?.heartbeat || "N/A"}</p>

                        <p><strong>Blood Pressure:</strong> {record.vitals?.bloodpressure || "N/A"}</p>

                        <p><strong>Oxygen Level:</strong> {record.vitals?.oxygenlevel || "N/A"}</p>

                        <p><strong>Blood Sugar:</strong> {record.vitals?.bloodsuger || "N/A"}</p>

                        <p><strong>Pulse Rate:</strong> {record.vitals?.pulserate || "N/A"}</p>


                    </div>

                </div>

                {/* Consent */}

                <div className="card shadow mb-4">

                    <div className="card-header bg-warning">

                        Consent

                    </div>

                    <div className="card-body">

                        <p><strong>Consent Type:</strong> {record.consent?.consenttype || "No Consent Available"}</p>

                        <p><strong>Status:</strong> {record.consent?.status || "N/A"}</p>

                        <p><strong>Granted Date:</strong> {record.consent?.granteddate || "N/A"}</p>

                        <p><strong>Expiry Date:</strong> {record.consent?.expirydate || "N/A"}</p>

                    </div>

                </div>

                {/* Clinical Notes Editor */}
                {keycloak.hasRealmRole("DOCTOR") && !keycloak.hasRealmRole("ADMIN") && (
                    <div className="card shadow mb-4" style={{ border: "1px solid #374151", background: "#1f2937" }}>
                        <div className="card-header bg-secondary text-white fw-bold">
                            Update Clinical Description / Seen notes
                        </div>
                        <div className="card-body">
                            <textarea
                                className="form-control mb-3"
                                rows="4"
                                placeholder="Write description or clinical notes regarding the patient..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ background: "#111827", color: "#f3f4f6", border: "1px solid #374151" }}
                            />
                            <button
                                className="btn btn-success px-4"
                                onClick={handleSaveDescription}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Description"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center">

                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/fhir")}
                    >
                        Back
                    </button>

                </div>

            </div>

        </Layout>

    );

}

export default ViewFhir;
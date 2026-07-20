import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import keycloak from "../../auth/keycloak";
import { getPatients } from "../../services/patientService";

import {
    getAllVitals,
    deleteVitals
} from "../../services/vitalsService";

function VitalsList() {

    const isAdmin = keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT");
    const userEmail = keycloak.tokenParsed?.email;

    const [vitals, setVitals] = useState([]);
    const [search, setSearch] = useState("");
    const [myPatientId, setMyPatientId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadVitals();
        if (isPatient) {
            loadMyPatientId();
        }
    }, []);

    const loadMyPatientId = async () => {
        try {
            const response = await getPatients();
            const me = response.data.find(p => p.email?.toLowerCase() === userEmail?.toLowerCase());
            if (me) {
                setMyPatientId(me.patientId);
            }
        } catch (err) {
            console.error("Error finding patient ID:", err);
        }
    };

    const loadVitals = async () => {

        try {

            const response = await getAllVitals();

            setVitals(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const removeVitals = async (id) => {

        if (!window.confirm("Delete this Vitals Record?")) {
            return;
        }

        try {

            await deleteVitals(id);

            alert("Deleted Successfully");

            loadVitals();

        } catch (error) {

            console.log(error);

            alert("Delete Failed");

        }

    };

    // Filter vitals based on Patient ID
    const filteredVitals = vitals.filter((vital) => {
        if (isPatient && !isAdmin) {
            const addedPatientIds = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
            const allowedPatientIds = [myPatientId, ...addedPatientIds].filter(Boolean);
            return allowedPatientIds.includes(vital.patientId);
        }
        return vital.patientId
            ?.toString()
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (

        <Layout>

            <div className="container mt-4">

                {/* Heading and Add Button */}
                <div className="d-flex justify-content-between align-items-center mb-2">

                    <h2 style={{ color: "#f7f8f8" }}>
                        Vitals
                    </h2>

                    {(isAdmin || isPatient) && (
                        <Link
                            to="/vitals/add"
                            className="btn btn-success"
                        >
                            Add Vitals
                        </Link>
                    )}

                </div>

                {/* Search Box */}
                {(!isPatient || isAdmin) && (
                    <div className="mb-4">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Patient ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                maxWidth: "1250px",
                                borderRadius: "10px"
                            }}
                        />

                    </div>
                )}

                <div className="table-responsive">

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>

                                <th>Patient ID</th>

                                <th>Blood Pressure</th>

                                <th>Heart Rate (BPM)</th>

                                <th>Oxygen Level</th>

                                <th>Blood Glucose</th>

                                <th>Cholesterol</th>

                                <th className="text-center">Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                filteredVitals.length === 0 ?

                                    (

                                        <tr>

                                            <td

                                                colSpan="7"

                                                className="text-center"

                                            >

                                                No Vitals Found

                                            </td>

                                        </tr>

                                    )

                                    :

                                    filteredVitals.map((vital) => (

                                        <tr key={vital.vitalsId}>

                                            <td>{vital.patientId}</td>

                                            <td>{vital.bloodpressure}</td>

                                            <td>{vital.heartbeat || vital.bpm || vital.pulserate || 0} bpm</td>

                                            <td>{vital.oxygenlevel} %</td>

                                            <td>{vital.bloodglucose || vital.bloodsuger || 0}</td>

                                            <td>{vital.cholesterol}</td>

                                            <td className="text-center">

                                                <div className="d-flex justify-content-center gap-2">

                                                    <Link

                                                        className="btn btn-info btn-sm"

                                                        to={`/vitals/view/${vital.vitalsId}`}

                                                    >

                                                        View

                                                    </Link>

                                                    {(isAdmin || isPatient) && (

                                                        <button

                                                            className="btn btn-warning btn-sm me-2"

                                                            onClick={() =>

                                                                navigate(`/vitals/edit/${vital.vitalsId}`)

                                                            }

                                                        >

                                                            Edit

                                                        </button>

                                                    )}

                                                    {isAdmin && (

                                                        <button

                                                            className="btn btn-danger btn-sm"

                                                            onClick={() =>

                                                                removeVitals(vital.vitalsId)

                                                            }

                                                        >

                                                            Delete

                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </Layout>

    );

}

export default VitalsList;
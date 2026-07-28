import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import keycloak from "../../auth/keycloak";
import { getPatients } from "../../services/patientService";

import {
    getAllHealthTwins,
    deleteHealthTwin
} from "../../services/healthTwinService";

function HealthTwinList() {

    const isAdmin = keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT");
    const userEmail = keycloak.tokenParsed?.email;

    const [healthTwins, setHealthTwins] = useState([]);
    const [search, setSearch] = useState("");
    const [myPatientId, setMyPatientId] = useState(null);

    useEffect(() => {
        loadHealthTwins();
        if (isPatient) {
            loadMyPatientId();
        }
    }, []);

    const loadMyPatientId = () => {
        const selectedPatientStr = sessionStorage.getItem("patient_portal_user");
        if (selectedPatientStr) {
            try {
                const selectedPatient = JSON.parse(selectedPatientStr);
                setMyPatientId(selectedPatient.patientId);
            } catch (err) {
                console.error("Error parsing patient_portal_user", err);
            }
        }
    };

    const loadHealthTwins = async () => {

        try {

            const response = await getAllHealthTwins();

            setHealthTwins(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const removeHealthTwin = async (id) => {

        if (!window.confirm("Delete this Health Twin?")) {
            return;
        }

        try {

            await deleteHealthTwin(id);

            alert("Deleted Successfully");

            loadHealthTwins();

        } catch (error) {

            console.log(error);

            alert("Delete Failed");

        }

    };

    // Search Filter
    const filteredHealthTwins = healthTwins.filter((twin) => {
        // Apply doctor specialty filtering
        const isDoctor = keycloak.hasRealmRole("DOCTOR") && !isAdmin;
        if (isDoctor) {
            const docUserStr = sessionStorage.getItem("doctor_portal_user");
            let docUser = null;
            if (docUserStr) {
                try { docUser = JSON.parse(docUserStr); } catch (e) {}
            }
            const specialty = docUser ? docUser.role : null;
            if (specialty === "Cardiologist") {
                if (twin.disease !== "Cardiovascular Disease") return false;
            } else if (specialty === "Diabetologist") {
                if (twin.disease !== "Diabetes") return false;
            }
        }

        if (isPatient && !isAdmin) {
            const addedPatientIds = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
            const allowedPatientIds = [myPatientId, ...addedPatientIds].filter(Boolean);
            return allowedPatientIds.includes(twin.patientId);
        }

        const searchText = search.toLowerCase();

        return (

            twin.patientId?.toLowerCase().includes(searchText) ||

            twin.bloodgroup?.toLowerCase().includes(searchText) ||

            twin.disease?.toLowerCase().includes(searchText) ||

            String(twin.temperature).includes(searchText)

        );

    });

    return (

        <Layout>

            <div className="container mt-4">

                <div className="d-flex justify-content-between align-items-center">

                    <h2 style={{ color: "#f7f8f8" }}>
                        Health Twins
                    </h2>

                    {/* Heading and Add Button */}
                    {(isAdmin || isPatient) && (
                        <Link
                            to="/healthtwin/add"
                            className="btn btn-success"
                        >
                            Add Health Twin
                        </Link>
                    )}

                </div>

                {/* Search Box */}
                {(!isPatient || isAdmin) && (
                    <div className="mt-3 mb-4">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍 Search by Patient ID, Blood Group, Disease..."
                            style={{
                                borderRadius: "10px"
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                    </div>
                )}

                {/* Table */}

                <table className="table table-bordered table-hover">

                    <thead className="table-dark">

                        <tr>

                            <th>Patient ID</th>
                            <th>Blood Group</th>
                            <th>Height</th>
                            <th>Weight</th>
                            <th>Temperature</th>
                            <th>Disease</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredHealthTwins.length === 0 ?

                                (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center"
                                        >

                                            No Health Twins Found

                                        </td>

                                    </tr>

                                )

                                :

                                filteredHealthTwins.map((twin) => (

                                    <tr key={twin.twinId}>

                                        <td>{twin.patientId}</td>
                                        <td>{twin.bloodgroup}</td>
                                        <td>{twin.height}</td>
                                        <td>{twin.weight}</td>
                                        <td>{twin.temperature}</td>
                                        <td>{twin.disease}</td>

                                        <td>

                                            <Link
                                                className="btn btn-info btn-sm me-2"
                                                to={`/healthtwin/view/${twin.twinId}`}
                                            >
                                                View
                                            </Link>

                                             {(isAdmin || isPatient) && (
                                                 <Link
                                                     className="btn btn-warning btn-sm me-2"
                                                     to={`/healthtwin/edit/${twin.twinId}`}
                                                 >
                                                     Edit
                                                 </Link>
                                             )}

                                             {isAdmin && (
                                                 <button
                                                     className="btn btn-danger btn-sm"
                                                     onClick={() => removeHealthTwin(twin.twinId)}
                                                 >
                                                     Delete
                                                 </button>
                                             )}

                                        </td>

                                    </tr>

                                ))

                        }

                    </tbody>

                </table>

            </div>

        </Layout>

    );

}

export default HealthTwinList;
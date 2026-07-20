import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getAllFhirPatients } from "../../services/fhirService";
import keycloak from "../../auth/keycloak";
import { getPatients } from "../../services/patientService";

function FhirList() {

    const isAdmin = keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT");
    const userEmail = keycloak.tokenParsed?.email;

    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [myPatientId, setMyPatientId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadPatients();
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

    const loadPatients = async () => {

        try {

            const response = await getAllFhirPatients();

            setPatients(response.data);

        } catch (error) {

            console.log(error);

            alert("Unable to load FHIR Patients");

        }

    };

    // Filter by Patient ID
    const filteredPatients = patients.filter((patient) => {
        if (isPatient && !isAdmin) {
            const addedPatientIds = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
            const allowedPatientIds = [myPatientId, ...addedPatientIds].filter(Boolean);
            return allowedPatientIds.includes(patient.patientId);
        }
        return patient.patientId
            ?.toString()
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (

        <Layout>

            <div className="container mt-4">

                {/* Heading */}
                <h2
                    className="mb-2"
                    style={{ color: "#f7f8f8" }}
                >
                    FHIR Patient Records
                </h2>

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
                                width: "100%",
                                borderRadius: "10px"
                            }}
                        />

                    </div>
                )}

                {/* Table */}
                <table className="table table-bordered table-hover shadow">

                    <thead className="table-dark">

                        <tr>

                            <th>Patient ID</th>

                            <th>First Name</th>

                            <th>Last Name</th>

                            <th>Gender</th>

                            <th>Resource</th>

                            <th className="text-center">Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredPatients.length === 0 ?

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center"
                                    >
                                        No FHIR Patients Found
                                    </td>

                                </tr>

                                :

                                filteredPatients.map((patient) => (

                                    <tr key={patient.patientId}>

                                        <td>{patient.patientId}</td>

                                        <td>{patient.firstName}</td>

                                        <td>{patient.lastName}</td>

                                        <td>{patient.gender}</td>

                                        <td>{patient.resourceType}</td>

                                        <td className="text-center">

                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() =>
                                                    navigate(`/fhir/view/${patient.patientId}`)
                                                }
                                            >
                                                View
                                            </button>

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

export default FhirList;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import keycloak from "../../auth/keycloak";
import { getPatients } from "../../services/patientService";

import {
    getAllConsents,
    revokeConsent
} from "../../services/consentService";

function ConsentList() {

    const isAdmin = keycloak.hasRealmRole("ADMIN");
    const isPatient = keycloak.hasRealmRole("PATIENT");
    const userEmail = keycloak.tokenParsed?.email;

    const [consents, setConsents] = useState([]);
    const [search, setSearch] = useState("");
    const [myPatientId, setMyPatientId] = useState(null);

    useEffect(() => {
        loadConsents();
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

    const loadConsents = async () => {

        try {

            const response = await getAllConsents();

            setConsents(response.data);

        } catch (error) {

            console.log(error);
            alert("Failed to load consent records");

        }

    };

    const revoke = async (consentId) => {

        if (!window.confirm("Do you want to revoke this consent?")) {
            return;
        }

        try {

            await revokeConsent(consentId);

            alert("Consent Revoked Successfully");

            loadConsents();

        } catch (error) {

            console.log(error);

            alert("Failed to Revoke Consent");

        }

    };

    // Search by Patient ID
    const filteredConsents = consents.filter((consent) => {
        if (isPatient && !isAdmin) {
            const addedPatientIds = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
            const allowedPatientIds = [myPatientId, ...addedPatientIds].filter(Boolean);
            return allowedPatientIds.includes(consent.patientId);
        }
        return consent.patientId
            ?.toString()
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (

        <Layout>

            <div className="container mt-4">

                {/* Heading + Add Button */}
                <div className="d-flex justify-content-between align-items-center mb-2">

                    <h2 style={{ color: "#f7f8f8" }}>
                        Consent Management
                    </h2>

                    {(isAdmin || isPatient) && (
                        <Link
                            to="/consent/add"
                            className="btn btn-success"
                        >
                            + Add Consent
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

                {/* Single Table */}
                <table className="table table-bordered table-hover shadow">

                    <thead
                        style={{
                            backgroundColor: "#000",
                            color: "#fff"
                        }}
                    >

                        <tr>

                            <th style={{ backgroundColor: "#000", color: "#fff" }}>
                                Patient ID
                            </th>

                            <th style={{ backgroundColor: "#000", color: "#fff" }}>
                                Consent Type
                            </th>

                            <th style={{ backgroundColor: "#000", color: "#fff" }}>
                                Status
                            </th>

                            <th style={{ backgroundColor: "#000", color: "#fff" }}>
                                Granted Date
                            </th>

                            <th style={{ backgroundColor: "#000", color: "#fff" }}>
                                Expiry Date
                            </th>

                            <th
                                className="text-center"
                                style={{ backgroundColor: "#000", color: "#fff" }}
                            >
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredConsents.length === 0 ?

                                (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center"
                                        >
                                            No Consent Records Found
                                        </td>

                                    </tr>

                                )

                                :

                                filteredConsents.map((consent) => (

                                    <tr key={consent.consentId}>

                                        <td>{consent.patientId}</td>

                                        <td>{consent.consenttype}</td>

                                        <td>

                                            <span
                                                className={
                                                    consent.status === "Granted"
                                                        ? "badge bg-success"
                                                        : "badge bg-danger"
                                                }
                                            >
                                                {consent.status}
                                            </span>

                                        </td>

                                        <td>{consent.granteddate}</td>

                                        <td>{consent.expirydate}</td>

                                         <td className="text-center">

                                             <div className="d-flex justify-content-center gap-2">

                                                 <Link
                                                     to={`/consent/view/${consent.patientId}`}
                                                     className="btn btn-info btn-sm"
                                                 >
                                                     View
                                                 </Link>

                                                 {(isAdmin || isPatient) && (
                                                     <Link
                                                         to={`/consent/edit/${consent.patientId}`}
                                                         className="btn btn-warning btn-sm"
                                                     >
                                                         Edit
                                                     </Link>
                                                 )}

                                                 {isAdmin && (
                                                     <button
                                                         className="btn btn-danger btn-sm"
                                                         onClick={() =>
                                                             revoke(consent.consentId)
                                                         }
                                                     >
                                                         Revoke
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

        </Layout>

    );

}

export default ConsentList;
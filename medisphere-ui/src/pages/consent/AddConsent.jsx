import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { addConsent } from "../../services/consentService";
import { getPatients } from "../../services/patientService";
import keycloak from "../../auth/keycloak";

function AddConsent() {

    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
            navigate("/consent");
        }
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await getPatients();
            setPatients(response.data || []);
        } catch (error) {
            console.error("Failed to load patients", error);
        }
    };

    const [consent, setConsent] = useState({

        patientId: "",
        consenttype: "",
        status: "",
        granteddate: "",
        expirydate: ""

    });

    const handleChange = (e) => {

        setConsent({

            ...consent,
            [e.target.name]: e.target.value

        });

    };

    const saveConsent = async (e) => {

        e.preventDefault();

        try {

            await addConsent(consent);

            alert("Consent Saved Successfully");

            navigate("/consent");

        } catch (error) {

            console.log(error);

            alert("Unable to Save Consent");

        }

    };

    return (

        <Layout>

            <div className="container mt-4">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div className="card shadow">

                            <div className="card-header bg-primary text-white">

                                <h3 className="mb-0">Add Consent</h3>

                            </div>

                            <div className="card-body">

                                <form onSubmit={saveConsent}>

                                    {/* Patient ID */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Patient
                                        </label>

                                        <select
                                            className="form-select"
                                            name="patientId"
                                            value={consent.patientId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Patient</option>
                                            {patients.map(p => (
                                                <option key={p.patientId} value={p.patientId}>
                                                    {p.firstname} {p.lastname} ({p.patientId})
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    {/* Consent Type */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Consent Type
                                        </label>

                                        <select
                                            className="form-select"
                                            name="consenttype"
                                            value={consent.consenttype}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="">
                                                Select Consent Type
                                            </option>

                                            <option value="Treatment">
                                                Treatment
                                            </option>

                                            <option value="Research">
                                                Research
                                            </option>

                                            <option value="Data Sharing">
                                                Data Sharing
                                            </option>

                                            <option value="Emergency Access">
                                                Emergency Access
                                            </option>

                                            <option value="Insurance">
                                                Insurance
                                            </option>

                                            <option value="Telemedicine">
                                                Telemedicine
                                            </option>

                                        </select>

                                    </div>

                                    {/* Status */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            name="status"
                                            value={consent.status}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="">
                                                Select Status
                                            </option>

                                            <option value="PENDING">
                                                PENDING
                                            </option>

                                            <option value="ACTIVE">
                                                ACTIVE
                                            </option>

                                            <option value="REVOKED">
                                                REVOKED
                                            </option>

                                        </select>

                                    </div>

                                    {/* Granted Date */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Granted Date
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            name="granteddate"
                                            value={consent.granteddate}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    {/* Expiry Date */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Expiry Date
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            name="expirydate"
                                            value={consent.expirydate}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    {/* Buttons */}

                                    <div className="text-center">

                                        <button
                                            type="submit"
                                            className="btn btn-success me-3"
                                        >
                                            Save Consent
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate("/consent")}
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </Layout>

    );

}

export default AddConsent;
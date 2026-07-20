import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import keycloak from "../../auth/keycloak";

import {
    getConsentByPatientId,
    updateConsent
} from "../../services/consentService";

function EditConsent() {

    const { patientId } = useParams();

    const navigate = useNavigate();

    const [consentId, setConsentId] = useState("");

    const [consent, setConsent] = useState({

        patientId: "",
        consenttype: "",
        status: "",
        granteddate: "",
        expirydate: ""

    });

    useEffect(() => {
        if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
            navigate("/consent");
        } else {
            loadConsent();
        }
    }, []);

    const loadConsent = async () => {

        try {

            const response = await getConsentByPatientId(patientId);

            setConsentId(response.data.consentId);

            setConsent({

                patientId: response.data.patientId || "",
                consenttype: response.data.consenttype || "",
                status: response.data.status || "",
                granteddate: response.data.granteddate || "",
                expirydate: response.data.expirydate || ""

            });

        } catch (error) {

            console.log(error);

            alert("Unable to load Consent");

        }

    };

    const handleChange = (e) => {

        setConsent({

            ...consent,

            [e.target.name]: e.target.value

        });

    };

    const updateData = async (e) => {

        e.preventDefault();

        try {

            await updateConsent(consentId, consent);

            alert("Consent Updated Successfully");

            navigate("/consent");

        } catch (error) {

            console.log(error);

            alert("Update Failed");

        }

    };

    return (

        <Layout>

            <div className="container mt-4">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div className="card shadow">

                            <div className="card-header bg-primary text-white">

                                <h3 className="mb-0">
                                    Edit Consent
                                </h3>

                            </div>

                            <div className="card-body">

                                <form onSubmit={updateData}>

                                    {/* Patient ID */}

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Patient ID
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={consent.patientId}
                                            disabled
                                        />

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

                                    <div className="text-center">

                                        <button
                                            type="submit"
                                            className="btn btn-success me-3"
                                        >
                                            Update Consent
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

export default EditConsent;
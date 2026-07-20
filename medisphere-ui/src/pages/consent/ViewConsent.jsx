import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getConsentByPatientId } from "../../services/consentService";

function ViewConsent() {

    const { patientId } = useParams();

    const navigate = useNavigate();

    const [consent, setConsent] = useState({});

    useEffect(() => {

        loadConsent();

    }, []);

    const loadConsent = async () => {

        try {

            const response = await getConsentByPatientId(patientId);

            setConsent(response.data);

        } catch (error) {

            console.log(error);

            alert("Unable to load Consent");

        }

    };

    return (

        <Layout>

            <div className="container mt-4">

                <div className="card shadow">

                    <div className="card-header bg-primary text-white">

                        <h3>Consent Details</h3>

                    </div>

                    <div className="card-body">

                        <table className="table table-bordered">

                            <tbody>

                                <tr>

                                    <th width="30%">
                                        Consent ID
                                    </th>

                                    <td>
                                        {consent.consentId}
                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Patient ID
                                    </th>

                                    <td>
                                        {consent.patientId}
                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Consent Type
                                    </th>

                                    <td>
                                        {consent.consenttype}
                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Status
                                    </th>

                                    <td>

                                        <span
                                            className={
                                                consent.status === "REVOKED"
                                                    ? "badge bg-danger"
                                                    : "badge bg-success"
                                            }
                                        >
                                            {consent.status}
                                        </span>

                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Granted Date
                                    </th>

                                    <td>
                                        {consent.granteddate}
                                    </td>

                                </tr>

                                <tr>

                                    <th>
                                        Expiry Date
                                    </th>

                                    <td>
                                        {consent.expirydate}
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/consent")}
                        >
                            Back
                        </button>

                    </div>

                </div>

            </div>

        </Layout>

    );

}

export default ViewConsent;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout"; // Change the path if needed

function ViewVitals() {

    const { id } = useParams();

    const [vitals, setVitals] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        getVitals();
    }, []);

    const getVitals = async () => {
        try {

            const res = await axios.get(
                `http://localhost:8080/vitals/${id}`
            );

            setVitals(res.data);

        } catch (error) {
            console.log(error);
            alert("Unable to load Vitals");
        }
    };

    if (!vitals)
        return (
            <Layout>
                <div className="container mt-4">
                    <h3>Loading...</h3>
                </div>
            </Layout>
        );

    return (

        <Layout>

            <div className="container mt-4">

                <div className="card shadow">

                    <div className="card-header bg-primary text-white">

                        <h3>Vitals Details</h3>

                    </div>

                    <div className="card-body">

                        <table className="table table-bordered">

                            <tbody>

                                <tr>
                                    <th width="30%">Vitals ID</th>
                                    <td>{vitals.vitalsId}</td>
                                </tr>

                                <tr>
                                    <th>Patient ID</th>
                                    <td>{vitals.patientId}</td>
                                </tr>

                                <tr>
                                    <th>Heart Rate (BPM)</th>
                                    <td>{vitals.heartbeat || vitals.bpm || vitals.pulserate || 0} bpm</td>
                                </tr>

                                <tr>
                                    <th>Blood Pressure</th>
                                    <td>{vitals.bloodpressure}</td>
                                </tr>

                                <tr>
                                    <th>Oxygen Level</th>
                                    <td>{vitals.oxygenlevel} %</td>
                                </tr>

                                <tr>
                                    <th>Blood Glucose</th>
                                    <td>{vitals.bloodglucose || vitals.bloodsuger || 0}</td>
                                </tr>

                                <tr>
                                    <th>Cholesterol</th>
                                    <td>{vitals.cholesterol}</td>
                                </tr>

                            </tbody>

                        </table>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/vitals")}
                        >
                            Back
                        </button>

                    </div>

                </div>

            </div>

        </Layout>

    );

}

export default ViewVitals;
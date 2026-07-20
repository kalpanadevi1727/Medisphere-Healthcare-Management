import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { getHealthTwinById } from "../../services/healthTwinService";

function ViewHealthTwin() {

    const { id } = useParams();

    const [healthTwin, setHealthTwin] = useState({});

    useEffect(() => {
        loadHealthTwin();
    }, []);

    const loadHealthTwin = async () => {

        try {

            const response = await getHealthTwinById(id);

            setHealthTwin(response.data);

        } catch (error) {

            console.log(error);

            alert("Unable to load Health Twin");

        }

    };

    return (

        <Layout>

            <div className="container mt-4">

                <div className="card shadow">

                    <div className="card-header bg-primary text-white">

                        <h3>Health Twin Details</h3>

                    </div>

                    <div className="card-body">

                        <table className="table table-bordered">

                            <tbody>

                                <tr>
                                    <th width="30%">Twin ID</th>
                                    <td>{healthTwin.twinId}</td>
                                </tr>

                                <tr>
                                    <th>Patient ID</th>
                                    <td>{healthTwin.patientId}</td>
                                </tr>

                                <tr>
                                    <th>Blood Group</th>
                                    <td>{healthTwin.bloodgroup}</td>
                                </tr>

                                <tr>
                                    <th>Height</th>
                                    <td>{healthTwin.height} cm</td>
                                </tr>

                                <tr>
                                    <th>Weight</th>
                                    <td>{healthTwin.weight} kg</td>
                                </tr>

                                <tr>
                                    <th>Temperature</th>
                                    <td>{healthTwin.temperature} °F</td>
                                </tr>

                                <tr>
                                    <th>Disease</th>
                                    <td>{healthTwin.disease}</td>
                                </tr>

                            </tbody>

                        </table>

                        <Link
                            to="/healthtwin"
                            className="btn btn-secondary"
                        >
                            Back
                        </Link>

                    </div>

                </div>

            </div>

        </Layout>

    );

}

export default ViewHealthTwin;
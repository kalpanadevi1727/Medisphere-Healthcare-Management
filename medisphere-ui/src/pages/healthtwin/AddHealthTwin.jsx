import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { saveHealthTwin } from "../../services/healthTwinService";
import keycloak from "../../auth/keycloak";

function AddHealthTwin() {

    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
            navigate("/healthtwin");
        }
    }, []);

    const [healthTwin, setHealthTwin] = useState({
        patientId: "",
        bloodgroup: "",
        height: "",
        weight: "",
        temperature: "",
        disease: ""
    });

    const handleChange = (e) => {
        setHealthTwin({
            ...healthTwin,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await saveHealthTwin(healthTwin);

            alert("Health Twin Added Successfully!");

            navigate("/healthtwin");

        } catch (error) {

            console.log(error);

            alert("Failed to Add Health Twin");

        }

    };

    return (

        <Layout>

            <div
                className="container-fluid py-5"
                style={{
                    minHeight: "100vh",
                    background:
                        "linear-gradient(135deg, #000000 0%, #434343 100%)"
                }}
            >

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div
                            className="card border-0 rounded-4"
                            style={{
                                boxShadow: "0 20px 45px rgba(0,0,0,0.15)"
                            }}
                        >

                            <div
                                className="card-header text-white rounded-top-4"
                                style={{
                                    background:
                                        "linear-gradient(90deg,#1565C0,#42A5F5)",
                                    padding: "25px"
                                }}
                            >

                                <h2 className="text-center fw-bold mb-0">
                                    💙 Add Health Twin
                                </h2>

                            </div>

                            <div className="card-body p-5">

                                <form onSubmit={handleSubmit}>

                                    <div className="mb-4">

                                        <label className="form-label fw-bold">
                                            Patient ID
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control form-control-lg rounded-3 shadow-sm"
                                            name="patientId"
                                            value={healthTwin.patientId}
                                            onChange={handleChange}
                                            placeholder="Enter Patient UUID"
                                            required
                                        />

                                    </div>

                                    <div className="row">

                                        <div className="col-md-6 mb-4">

                                            <label className="form-label fw-bold">
                                                Blood Group
                                            </label>

                                            <select
                                                className="form-select form-select-lg rounded-3 shadow-sm"
                                                name="bloodgroup"
                                                value={healthTwin.bloodgroup}
                                                onChange={handleChange}
                                                required
                                            >

                                                <option value="">
                                                    Select Blood Group
                                                </option>

                                                <option>A+</option>
                                                <option>A-</option>
                                                <option>B+</option>
                                                <option>B-</option>
                                                <option>AB+</option>
                                                <option>AB-</option>
                                                <option>O+</option>
                                                <option>O-</option>

                                            </select>

                                        </div>

                                        <div className="col-md-6 mb-4">

                                            <label className="form-label fw-bold">
                                                Disease
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control form-control-lg rounded-3 shadow-sm"
                                                name="disease"
                                                value={healthTwin.disease}
                                                onChange={handleChange}
                                                placeholder="Enter Disease"
                                                required
                                            />

                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-md-4 mb-4">

                                            <label className="form-label fw-bold">
                                                Height (cm)
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control form-control-lg rounded-3 shadow-sm"
                                                name="height"
                                                value={healthTwin.height}
                                                onChange={handleChange}
                                                placeholder="Height"
                                                required
                                            />

                                        </div>

                                        <div className="col-md-4 mb-4">

                                            <label className="form-label fw-bold">
                                                Weight (kg)
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control form-control-lg rounded-3 shadow-sm"
                                                name="weight"
                                                value={healthTwin.weight}
                                                onChange={handleChange}
                                                placeholder="Weight"
                                                required
                                            />

                                        </div>

                                        <div className="col-md-4 mb-4">

                                            <label className="form-label fw-bold">
                                                Temperature (°F)
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control form-control-lg rounded-3 shadow-sm"
                                                name="temperature"
                                                value={healthTwin.temperature}
                                                onChange={handleChange}
                                                placeholder="Temperature"
                                                required
                                            />

                                        </div>

                                    </div>

                                    <hr className="my-4" />

                                    <div className="text-center">

                                        <button
                                            type="submit"
                                            className="btn btn-lg text-white px-5 me-3"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg,#1976D2,#42A5F5)",
                                                border: "none",
                                                borderRadius: "12px"
                                            }}
                                        >
                                            💾 Save Health Twin
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-lg px-5"
                                            style={{
                                                borderRadius: "12px"
                                            }}
                                            onClick={() => navigate("/healthtwin")}
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

export default AddHealthTwin;
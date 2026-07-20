import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { saveVitals } from "../../services/vitalsService";
import keycloak from "../../auth/keycloak";

function AddVitals() {

    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
            navigate("/vitals");
        }
    }, []);

    const [vitals, setVitals] = useState({
        patientId: "",
        heartbeat: "",
        bloodpressure: "",
        oxygenlevel: "",
        bloodsuger: "",
        pulserate: "",
        bloodglucose: "",
        cholesterol: "",
        bpm: "",
        systolicbp: ""
    });

    const handleChange = (e) => {
        setVitals({
            ...vitals,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            let systolic = 120;
            if (vitals.bloodpressure && vitals.bloodpressure.includes('/')) {
                const parts = vitals.bloodpressure.split('/');
                systolic = parseInt(parts[0].trim()) || 120;
            } else if (vitals.bloodpressure) {
                systolic = parseInt(vitals.bloodpressure) || 120;
            }

            const payload = {
                patientId: vitals.patientId,
                heartbeat: vitals.heartbeat ? Number(vitals.heartbeat) : 0,
                bloodpressure: vitals.bloodpressure,
                oxygenlevel: vitals.oxygenlevel ? Number(vitals.oxygenlevel) : 0,
                bloodsuger: vitals.bloodglucose ? Number(vitals.bloodglucose) : 0,
                pulserate: vitals.heartbeat ? Number(vitals.heartbeat) : 0,
                bloodglucose: vitals.bloodglucose ? Number(vitals.bloodglucose) : 0,
                cholesterol: vitals.cholesterol ? Number(vitals.cholesterol) : 0,
                bpm: vitals.heartbeat ? Number(vitals.heartbeat) : 0,
                systolicbp: systolic
            };

            await saveVitals(payload);

            alert("Vitals Added Successfully!");

            navigate("/vitals");

        } catch (error) {

            console.log(error);

            alert("Failed to Add Vitals");

        }

    };

    return (

        <Layout>

            <div
                className="container-fluid py-5"
                style={{
                    minHeight: "100vh",
                    background:
                        "linear-gradient(135deg,#000000 0%,#434343 100%)"
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
                                    ❤️ Add Vitals
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
                                            value={vitals.patientId}
                                            onChange={handleChange}
                                            placeholder="Enter Patient UUID"
                                            required
                                        />

                                    </div>                                     <div className="row">

                                         <div className="col-md-6 mb-4">

                                             <label className="form-label fw-bold">
                                                 Heart Rate (BPM)
                                             </label>

                                             <input
                                                 type="number"
                                                 className="form-control form-control-lg rounded-3 shadow-sm"
                                                 name="heartbeat"
                                                 value={vitals.heartbeat}
                                                 onChange={handleChange}
                                                 placeholder="e.g. 72"
                                                 required
                                             />

                                         </div>

                                         <div className="col-md-6 mb-4">

                                             <label className="form-label fw-bold">
                                                 Blood Pressure (Systolic/Diastolic)
                                             </label>

                                             <input
                                                 type="text"
                                                 className="form-control form-control-lg rounded-3 shadow-sm"
                                                 name="bloodpressure"
                                                 value={vitals.bloodpressure}
                                                 onChange={handleChange}
                                                 placeholder="e.g. 120/80"
                                                 required
                                             />

                                         </div>

                                     </div>

                                     <div className="row">

                                         <div className="col-md-4 mb-4">

                                             <label className="form-label fw-bold">
                                                 Oxygen Level (%)
                                             </label>

                                             <input
                                                 type="number"
                                                 className="form-control form-control-lg rounded-3 shadow-sm"
                                                 name="oxygenlevel"
                                                 value={vitals.oxygenlevel}
                                                 onChange={handleChange}
                                                 placeholder="e.g. 98"
                                                 required
                                             />

                                         </div>

                                         <div className="col-md-4 mb-4">

                                             <label className="form-label fw-bold">
                                                 Blood Glucose
                                             </label>

                                             <input
                                                 type="number"
                                                 step="0.1"
                                                 className="form-control form-control-lg rounded-3 shadow-sm"
                                                 name="bloodglucose"
                                                 value={vitals.bloodglucose}
                                                 onChange={handleChange}
                                                 placeholder="e.g. 5.5 or 99"
                                                 required
                                             />

                                         </div>

                                         <div className="col-md-4 mb-4">

                                             <label className="form-label fw-bold">
                                                 Cholesterol
                                             </label>

                                             <input
                                                 type="number"
                                                 className="form-control form-control-lg rounded-3 shadow-sm"
                                                 name="cholesterol"
                                                 value={vitals.cholesterol}
                                                 onChange={handleChange}
                                                 placeholder="e.g. 190"
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
                                            💾 Save Vitals
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-lg px-5"
                                            style={{
                                                borderRadius: "12px"
                                            }}
                                            onClick={() => navigate("/vitals")}
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

export default AddVitals;
import { useState, useRef } from "react";
import Layout from "../../components/Layout";
import { saveVitals } from "../../services/vitalsService";

function PatientMonitor() {

    const timerRef = useRef(null);

    const [running, setRunning] = useState(false);

    const [vitals, setVitals] = useState({
        patientId: "",
        heartbeat: 80,
        bloodpressure: "120/80",
        oxygenlevel: 98,
        bloodsuger: 110,
        pulserate: 80
    });

    const handleChange = (e) => {

        setVitals({
            ...vitals,
            [e.target.name]: e.target.value
        });

    };

    const generateVitals = () => {

        setVitals(prev => {

            const heart = Number(prev.heartbeat) + Math.floor(Math.random() * 5 - 2);
            const oxygen = Number(prev.oxygenlevel) + Math.floor(Math.random() * 3 - 1);
            const sugar = Number(prev.bloodsuger) + Math.floor(Math.random() * 5 - 2);
            const pulse = Number(prev.pulserate) + Math.floor(Math.random() * 5 - 2);

            const systolic = 120 + Math.floor(Math.random() * 5 - 2);
            const diastolic = 80 + Math.floor(Math.random() * 5 - 2);

            return {
                ...prev,
                heartbeat: heart,
                oxygenlevel: oxygen,
                bloodsuger: sugar,
                pulserate: pulse,
                bloodpressure: `${systolic}/${diastolic}`
            };

        });

    };

    const startMonitoring = () => {

        if (running) return;

        setRunning(true);

        timerRef.current = setInterval(async () => {

            generateVitals();

            try {

                await saveVitals(vitals);

                console.log("Vitals Sent");

            } catch (err) {

                console.log(err);

            }

        }, 5000);

    };

    const stopMonitoring = () => {

        clearInterval(timerRef.current);

        setRunning(false);

    };

    return (

        <Layout>

            <div className="container py-5">

                <div className="card shadow-lg p-4">

                    <h2 className="text-center mb-4">
                        📱 Patient Monitor
                    </h2>

                    <div className="mb-3">

                        <label>Patient ID</label>

                        <input
                            className="form-control"
                            name="patientId"
                            value={vitals.patientId}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label>Heart Rate</label>

                            <input
                                className="form-control"
                                name="heartbeat"
                                value={vitals.heartbeat}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="col-md-6 mb-3">

                            <label>Blood Pressure</label>

                            <input
                                className="form-control"
                                name="bloodpressure"
                                value={vitals.bloodpressure}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="col-md-4 mb-3">

                            <label>Oxygen</label>

                            <input
                                className="form-control"
                                name="oxygenlevel"
                                value={vitals.oxygenlevel}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="col-md-4 mb-3">

                            <label>Blood Sugar</label>

                            <input
                                className="form-control"
                                name="bloodsuger"
                                value={vitals.bloodsuger}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="col-md-4 mb-3">

                            <label>Pulse Rate</label>

                            <input
                                className="form-control"
                                name="pulserate"
                                value={vitals.pulserate}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="text-center mt-4">

                        <button
                            className="btn btn-success me-3"
                            onClick={startMonitoring}
                        >
                            ▶ Start Monitoring
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={stopMonitoring}
                        >
                            ■ Stop Monitoring
                        </button>

                    </div>

                </div>

            </div>

        </Layout>

    );

}

export default PatientMonitor;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import keycloak from "../../auth/keycloak";

import {
  getVitalsById,
  updateVitals,
} from "../../services/vitalsService";

function EditVitals() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
      navigate("/vitals");
    } else {
      loadVitals();
    }
  }, []);

  const loadVitals = async () => {
    try {
      const cleanId = (id || "").trim().replace(/\s+/g, "-");
      const response = await getVitalsById(cleanId);
      const data = response.data;

      setVitals({
        patientId: data.patientId || "",
        heartbeat: data.heartbeat || data.bpm || data.pulserate || "",
        bloodpressure: data.bloodpressure || "",
        oxygenlevel: data.oxygenlevel ?? "",
        bloodsuger: data.bloodsuger ?? "",
        pulserate: data.pulserate ?? "",
        bloodglucose: data.bloodglucose || data.bloodsuger || "",
        cholesterol: data.cholesterol ?? "",
        bpm: data.bpm ?? "",
        systolicbp: data.systolicbp ?? "",
      });
    } catch (error) {
      console.log(error);
      alert("Unable to load vitals");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setVitals((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const cleanId = (id || "").trim().replace(/\s+/g, "-");
      await updateVitals(cleanId, {
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
      });

      alert("Vitals Updated Successfully");
      navigate("/vitals");
    } catch (error) {
      console.log(error);
      console.log(error.response);
      alert("Update Failed");
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            <div className="card shadow-lg border-0 rounded-4">

              <div
                className="card-header text-center text-white"
                style={{
                  background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
                }}
              >
                <h2 className="mb-0">Edit Vitals</h2>
              </div>

              <div className="card-body p-4">

                <form onSubmit={handleSubmit}>

                  {/* Patient ID */}

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Patient ID
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={vitals.patientId}
                      disabled
                    />
                  </div>

                  {/* Heart Rate */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Heart Rate (BPM)
                    </label>
                    <input
                      type="number"
                      name="heartbeat"
                      className="form-control form-control-lg"
                      value={vitals.heartbeat}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter Heart Rate"
                      required
                    />
                  </div>

                  {/* Blood Pressure */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Blood Pressure (Systolic/Diastolic)
                    </label>
                    <input
                      type="text"
                      name="bloodpressure"
                      className="form-control form-control-lg"
                      value={vitals.bloodpressure}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      placeholder="Example: 120/80"
                      required
                    />
                  </div>

                  {/* Oxygen */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Oxygen Level (%)
                    </label>
                    <input
                      type="number"
                      name="oxygenlevel"
                      className="form-control form-control-lg"
                      value={vitals.oxygenlevel}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter Oxygen Level"
                      required
                    />
                  </div>

                  {/* Blood Glucose */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Blood Glucose
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="bloodglucose"
                      className="form-control form-control-lg"
                      value={vitals.bloodglucose}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter Blood Glucose (e.g. 5.5 or 99)"
                      required
                    />
                  </div>

                  {/* Cholesterol */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Cholesterol
                    </label>
                    <input
                      type="number"
                      name="cholesterol"
                      className="form-control form-control-lg"
                      value={vitals.cholesterol}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter Cholesterol (e.g. 190)"
                      required
                    />
                  </div>

                  <div className="text-center">

                    <button
                      type="submit"
                      className="btn btn-primary px-4 me-3"
                    >
                      Update Vitals
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary px-4"
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

export default EditVitals;
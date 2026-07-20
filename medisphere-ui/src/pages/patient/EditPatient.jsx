import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";

import {
  getPatientById,
  updatePatient
} from "../../services/patientService";
import keycloak from "../../auth/keycloak";

function EditPatient() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [patient, setPatient] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    email: "",
    phoneno: "",
    address: ""
  });

  useEffect(() => {
    if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
      navigate("/patient");
    } else {
      loadPatient();
    }
  }, []);

  const loadPatient = async () => {

    try {

      const response = await getPatientById(id);

      setPatient(response.data);

    } catch (error) {

      console.log(error);

      alert("Unable to load patient");

    }

  };

  const handleChange = (e) => {

    setPatient({

      ...patient,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updatePatient(id, patient);

      alert("Patient Updated Successfully");

      navigate("/patient");

    } catch (error) {

      console.log(error);

      alert("Update Failed");

    }

  };

  return (

    <Layout>

      <div className="container py-4">

        <div className="row justify-content-center">

          <div className="col-lg-9">

            <div className="card shadow-lg border-0 rounded-4">

              <div
                className="card-header text-white text-center py-3 rounded-top-4"
                style={{
                  background: "linear-gradient(90deg,#2563eb,#1d4ed8)"
                }}
              >
                <h2 className="mb-0 fw-bold">
                  Edit Patient
                </h2>
              </div>

              <div className="card-body p-4">

                <form onSubmit={handleSubmit}>

                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        First Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="firstname"
                        value={patient.firstname}
                        onChange={handleChange}
                        placeholder="Enter First Name"
                        required
                      />

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Last Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="lastname"
                        value={patient.lastname}
                        onChange={handleChange}
                        placeholder="Enter Last Name"
                        required
                      />

                    </div>

                  </div>

                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Gender
                      </label>

                      <select
                        className="form-select form-select-lg"
                        name="gender"
                        value={patient.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="dob"
                        value={patient.dob}
                        onChange={handleChange}
                        required
                      />

                    </div>

                  </div>

                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control form-control-lg"
                        name="email"
                        value={patient.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                        required
                      />

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="phoneno"
                        value={patient.phoneno}
                        onChange={handleChange}
                        placeholder="Enter Phone Number"
                        required
                      />

                    </div>

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <textarea
                      className="form-control form-control-lg"
                      rows="4"
                      name="address"
                      value={patient.address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                      required
                    />

                  </div>

                  <div className="text-center">

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5 me-3"
                    >
                      Update Patient
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-lg px-5"
                      onClick={() => navigate("/patient")}
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

export default EditPatient;
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  getPatients,
  deletePatient
} from "../../services/patientService";
import { Link, useNavigate } from "react-router-dom";
import keycloak from "../../auth/keycloak";
import { getAllHealthTwins } from "../../services/healthTwinService";

function PatientList() {

  const isAdmin = keycloak.hasRealmRole("ADMIN");
  const isPatient = keycloak.hasRealmRole("PATIENT");
  const userEmail = keycloak.tokenParsed?.email;

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [healthTwins, setHealthTwins] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {

    try {

      const response = await getPatients();
      setPatients(response.data);
      
      const twinsRes = await getAllHealthTwins();
      setHealthTwins(twinsRes.data || []);

    } catch (error) {

      console.error(error);

      alert("Failed to load patients");

    }

  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {

      await deletePatient(id);

      alert("Patient Deleted Successfully");

      loadPatients();

    } catch (error) {

      console.error(error);

      alert("Delete Failed");

    }

  };

  const filteredPatients = patients.filter((patient) => {
    // Apply doctor specialty filtering based on health twin disease
    const isDoctor = keycloak.hasRealmRole("DOCTOR") && !isAdmin;
    if (isDoctor) {
        const docUserStr = sessionStorage.getItem("doctor_portal_user");
        let docUser = null;
        if (docUserStr) {
            try { docUser = JSON.parse(docUserStr); } catch (e) {}
        }
        const specialty = docUser ? docUser.role : null;
        
        const twin = healthTwins.find(t => t.patientId === patient.patientId);
        const disease = twin ? twin.disease : null;
        
        if (specialty === "Cardiologist") {
            if (disease !== "Cardiovascular Disease") return false;
        } else if (specialty === "Diabetologist") {
            if (disease !== "Diabetes") return false;
        }
    }

    if (isPatient && !isAdmin) {
      const selectedPatientStr = sessionStorage.getItem("patient_portal_user");
      let selectedPatientId = null;
      if (selectedPatientStr) {
        try {
          selectedPatientId = JSON.parse(selectedPatientStr).patientId;
        } catch (e) {}
      }
      const addedPatientIds = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
      const allowedPatientIds = [selectedPatientId, ...addedPatientIds].filter(Boolean);
      return allowedPatientIds.includes(patient.patientId);
    }

    const fullname =
      `${patient.firstname} ${patient.lastname}`.toLowerCase();

    return (
      fullname.includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase())
    );

  });

  return (

    <Layout>

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 style={{ color: "#f7f8f8" }}>Patient Management</h2>

        {(isAdmin || isPatient) && (
          <Link
            to="/patient/add"
            className="btn btn-success"
          >
            + Add Patient
          </Link>
        )}

      </div>

      {(!isPatient || isAdmin) && (
        <div className="mb-3">

          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>
      )}

      <table className="table table-bordered table-hover">

        <thead className="table-dark">

          <tr>

            <th>ID</th>

            <th>First Name</th>

            <th>Last Name</th>

            <th>Gender</th>

            <th>Email</th>

            <th>Phone</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {filteredPatients.length === 0 ? (

            <tr>

              <td
                colSpan="7"
                className="text-center"
              >
                No Patients Found
              </td>

            </tr>

          ) : (

            filteredPatients.map((patient) => (

              <tr key={patient.patientId}>

                <td>{patient.patientId}</td>

                <td>{patient.firstname}</td>

                <td>{patient.lastname}</td>

                <td>{patient.gender}</td>

                <td>{patient.email}</td>

                <td>{patient.phoneno}</td>

                <td>

                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() =>
                      navigate(`/patient/view/${patient.patientId}`)
                    }
                  >
                    View
                  </button>

                  {(isAdmin || isPatient) && (
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        navigate(`/patient/edit/${patient.patientId}`)
                      }
                    >
                      Edit
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(patient.patientId)
                      }
                    >
                      Delete
                    </button>
                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </Layout>

  );

}

export default PatientList;
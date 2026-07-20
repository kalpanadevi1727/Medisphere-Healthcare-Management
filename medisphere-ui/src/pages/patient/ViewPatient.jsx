import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getPatientById } from "../../services/patientService";

function ViewPatient() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  useEffect(() => {
    loadPatient();
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

  if (!patient) {

    return (

      <Layout>

        <h4>Loading...</h4>

      </Layout>

    );

  }

  return (

    <Layout>

      <h2
  className="mb-4 fw-bold"
  style={{ color: "#2563eb" }}
>
  Patient Details
</h2>
      <table className="table table-bordered">

        <tbody>

          <tr>
            <th>Patient ID</th>
            <td>{patient.patientId}</td>
          </tr>

          <tr>
            <th>First Name</th>
            <td>{patient.firstname}</td>
          </tr>

          <tr>
            <th>Last Name</th>
            <td>{patient.lastname}</td>
          </tr>

          <tr>
            <th>Gender</th>
            <td>{patient.gender}</td>
          </tr>

          <tr>
            <th>Date of Birth</th>
            <td>{patient.dob}</td>
          </tr>

          <tr>
            <th>Email</th>
            <td>{patient.email}</td>
          </tr>

          <tr>
            <th>Phone</th>
            <td>{patient.phoneno}</td>
          </tr>

          <tr>
            <th>Address</th>
            <td>{patient.address}</td>
          </tr>

        </tbody>

      </table>



      <div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

    </Layout>


  );

}

export default ViewPatient;
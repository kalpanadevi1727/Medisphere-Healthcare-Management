import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import HumanModel from "../components/HumanModel";

import {
  FaUsers,
  FaHeartbeat,
  FaHospital
} from "react-icons/fa";

import {
  getPatientCount,
  getTwinCount,
  getFhirCount
} from "../services/dashboardService";

function Dashboard() {

  const [patientCount, setPatientCount] = useState(0);
  const [twinCount, setTwinCount] = useState(0);
  const [fhirCount, setFhirCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    setLoading(true);

    try {
      const patientResponse = await getPatientCount();
      setPatientCount(patientResponse.data.length);
    } catch (err) {
      console.log(err);
    }

    try {
      const twinResponse = await getTwinCount();
      setTwinCount(twinResponse.data.length);
    } catch (err) {
      console.log(err);
    }

    try {
      const fhirResponse = await getFhirCount();
      setFhirCount(fhirResponse.data.length);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary"></div>
        </div>
      </Layout>
    );
  }

  return (

    <Layout>

      <div className="container-fluid">

        <h2
          className="fw-bold mb-4"
          style={{ color: "#f7f8f8" }}
        >
          Patient 360 Dashboard
        </h2>

        {/* Dashboard Cards */}

        <div className="row g-4">

          <div className="col-lg-4">
            <DashboardCard
              title="Total Patients"
              value={patientCount}
              icon={<FaUsers />}
            />
          </div>

          <div className="col-lg-4">
            <DashboardCard
              title="Health Twins"
              value={twinCount}
              icon={<FaHeartbeat />}
            />
          </div>

          <div className="col-lg-4">
            <DashboardCard
              title="FHIR Resources"
              value={fhirCount}
              icon={<FaHospital />}
            />
          </div>

        </div>

        {/* Human Model */}

        <div
          className="mt-4"
          style={{
            width: "100%",
            height: "720px",
            background: "#0b0b0b",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 0 30px rgba(0,0,0,0.4)"
          }}
        >

          <div
            style={{
              position: "absolute",
              margin: "20px",
              zIndex: 100,
              color: "white"
            }}
          >
            <h3>Digital Human Twin</h3>
            <p style={{ color: "#bdbdbd" }}>
              Interactive 3D Patient Model
            </p>
          </div>

          <HumanModel />

        </div>

      </div>

    </Layout>

  );
}

export default Dashboard;
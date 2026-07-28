import {
    FaHome,
    FaUserInjured,
    FaHeartbeat,
    FaStethoscope,
    FaHospital,
    FaFileSignature,
    FaChartLine,
    FaTv
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import keycloak from "../auth/keycloak";

function Sidebar() {
    const isDoctor = keycloak.hasRealmRole("DOCTOR");
    const isAdmin = keycloak.hasRealmRole("ADMIN");

    const menuStyle = ({ isActive }) => ({
        backgroundColor: isActive ? "#2563eb" : "transparent",
        color: "#ffffff",
        textDecoration: "none",
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        fontSize: "17px",
        fontWeight: "500",
        borderRadius: "10px",
        margin: "6px 12px",
        transition: "0.3s"
    });

    return (

        <div
            style={{
                width: "250px",
                minHeight: "100vh",
                background: "#1f2937",
                color: "white",
                boxShadow: "3px 0 10px rgba(0,0,0,0.3)"
            }}
        >

            <div
                className="text-center py-4"
                style={{
                    borderBottom: "1px solid #374151"
                }}
            >
                <h3 className="fw-bold">
                    MediSphere
                </h3>
            </div>

            <div className="mt-3">

                <NavLink to="/" style={menuStyle}>
                    <FaHome className="me-3" />
                    Dashboard
                </NavLink>

                <NavLink to="/patient" style={menuStyle}>
                    <FaUserInjured className="me-3" />
                    Patients
                </NavLink>

                <NavLink to="/healthtwin" style={menuStyle}>
                    <FaHeartbeat className="me-3" />
                    Health Twin
                </NavLink>

                <NavLink to="/vitals" style={menuStyle}>
                    <FaStethoscope className="me-3" />
                    Vitals
                </NavLink>

                <NavLink to="/fhir" style={menuStyle}>
                    <FaHospital className="me-3" />
                    Reports
                </NavLink>

                <NavLink to="/consent" style={menuStyle}>
                    <FaFileSignature className="me-3" />
                    Consent
                </NavLink>

                <NavLink to="/prediction" style={menuStyle}>
                    <FaChartLine className="me-3" />
                    Prediction
                </NavLink>

                {(isDoctor || isAdmin) && (
                    <NavLink to="/patient-monitor" style={menuStyle}>
                        <FaTv className="me-3" />
                        Patient Monitor
                    </NavLink>
                )}

            </div>

        </div>

    );
}

export default Sidebar;
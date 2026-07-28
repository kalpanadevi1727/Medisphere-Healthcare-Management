import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import keycloak from "../auth/keycloak";

function Layout({ children }) {
  const isDoctor = keycloak.hasRealmRole("DOCTOR");
  const isPatient = keycloak.hasRealmRole("PATIENT");
  const isDarkPortal = isDoctor || isPatient;

  return (
    <>
      <Navbar />

      <div className="d-flex">

        <Sidebar />

        <div
          style={{
            flex: 1,
            backgroundColor: isDarkPortal ? "#000000" : "#111827",
            minHeight: "100vh",
            padding: "25px",
          }}
        >
          {children}
        </div>

      </div>
    </>
  );
}

export default Layout;
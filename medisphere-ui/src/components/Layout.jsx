import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <>
      <Navbar />

      <div className="d-flex">

        <Sidebar />

        <div
          style={{
            flex: 1,
            backgroundColor: "#111827",
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
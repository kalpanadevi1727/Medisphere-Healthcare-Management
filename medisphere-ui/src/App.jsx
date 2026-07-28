import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/patient/PatientList";
import AddPatient from "./pages/patient/AddPatient";
import ViewPatient from "./pages/patient/ViewPatient";
import EditPatient from "./pages/patient/EditPatient";
import HealthTwinList from "./pages/healthtwin/HealthTwinList";
import AddHealthTwin from "./pages/healthtwin/AddHealthTwin";
import EditHealthTwin from "./pages/healthtwin/EditHealthTwin";
import ViewHealthTwin from "./pages/healthtwin/ViewHealthTwin";
import AddVitals from "./pages/vitals/AddVitals";
import VitalsList from "./pages/vitals/VitalsList";
import ViewVitals from "./pages/vitals/ViewVitals";
import ConsentList from "./pages/consent/ConsentList";
import AddConsent from "./pages/consent/AddConsent";
import ViewConsent from "./pages/consent/ViewConsent";
import EditConsent from "./pages/consent/EditConsent";
import FhirList from "./pages/fhir/FhirList";
import ViewFhir from "./pages/fhir/ViewFhir";
import PatientMonitor from "./pages/patientmonitor/PatientMonitor";
import EditVitals from "./pages/vitals/EditVitals";
import PredictionPage from "./pages/prediction/PredictionPage";
import PortalGate from "./components/PortalGate";

function App() {

    return (

        <BrowserRouter>

            <PortalGate>

                <Routes>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/patient"
                        element={<PatientList />}
                    />

                    <Route
                        path="/patient/add"
                        element={<AddPatient />}
                    />
                    <Route path="/patient/view/:id" element={<ViewPatient />} />
                    <Route path="/patient/edit/:id" element={<EditPatient />} />
                    <Route path="/healthtwin" element={<HealthTwinList />} />
                    <Route path="/healthtwin/add" element={<AddHealthTwin />} />
                    <Route path="/healthtwin/edit/:id" element={<EditHealthTwin />} />
                    <Route path="/healthtwin/view/:id" element={<ViewHealthTwin />} />
                    <Route path="/vitals" element={<VitalsList />} />
                    <Route path="/vitals/add" element={<AddVitals />} />
                    <Route path="/vitals/view/:id" element={<ViewVitals />} />
                    <Route path="/fhir" element={<FhirList />} />
                    <Route path="/fhir/view/:id" element={<ViewFhir />} />
                    <Route path="/consent" element={<ConsentList />} />
                    <Route path="/patient-monitor" element={<PatientMonitor />} />
                    <Route path="/prediction" element={<PredictionPage />} />
                    <Route
                        path="/vitals/edit/:id"
                        element={<EditVitals />}
                    />

                    <Route path="/consent/add" element={<AddConsent />} />

                    <Route path="/consent/view/:patientId" element={<ViewConsent />} />

                    <Route path="/consent/edit/:patientId" element={<EditConsent />} />
                </Routes>

            </PortalGate>

        </BrowserRouter>

    );

}

export default App;
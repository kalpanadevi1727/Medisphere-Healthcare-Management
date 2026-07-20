import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import keycloak from "./auth/keycloak";

keycloak
    .init({
        onLoad: "login-required",
        checkLoginIframe: false
    })
    .then(() => {

        ReactDOM.createRoot(document.getElementById("root")).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );

    })
    .catch(console.error);
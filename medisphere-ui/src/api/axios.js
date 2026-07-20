import axios from "axios";
import keycloak from "../auth/keycloak";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(async (config) => {

    if (keycloak.authenticated) {

        try {

            await keycloak.updateToken(30);

            config.headers.Authorization =
                `Bearer ${keycloak.token}`;

        } catch (error) {

            console.log("Token Refresh Failed");

        }

    }

    return config;

});

export default api;
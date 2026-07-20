import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8180",
    realm: "medisphere",
    clientId: "gateway-client"
});

export default keycloak;
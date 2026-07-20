import keycloak from "../auth/keycloak";

function Navbar() {

    return (

        <nav className="navbar navbar-dark bg-primary px-4">

            <h4 className="text-white">
                MediSphere
            </h4>

            <div>

                <span className="text-white me-3">

                    Welcome,

                    {keycloak.tokenParsed?.preferred_username}

                </span>

                <button
                    className="btn btn-light"
                    onClick={() => {
                        sessionStorage.clear();
                        keycloak.logout();
                    }}
                >
                    Logout
                </button>

            </div>

        </nav>

    );

}

export default Navbar;
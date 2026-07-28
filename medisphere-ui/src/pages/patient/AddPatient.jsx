import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { addPatient } from "../../services/patientService";
import keycloak from "../../auth/keycloak";


function AddPatient() {

    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.hasRealmRole("ADMIN") && !keycloak.hasRealmRole("PATIENT")) {
            navigate("/patient");
        }
    }, []);


    const [patient,setPatient]=useState({

    firstname:"",
    lastname:"",
    email:"",
    phoneno:"",
    gender:"",
    dob:"",
    address:""

});


    const handleChange = (e) => {

        setPatient({

            ...patient,
            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await addPatient(patient);

            if (response && response.data && response.data.patientId) {
                const addedList = JSON.parse(sessionStorage.getItem("session_added_patients") || "[]");
                addedList.push(response.data.patientId);
                sessionStorage.setItem("session_added_patients", JSON.stringify(addedList));

                // Auto-login/associate profile if they logged in as a new patient
                const selectedPatientStr = sessionStorage.getItem("patient_portal_user");
                if (selectedPatientStr) {
                    try {
                        const parsed = JSON.parse(selectedPatientStr);
                        if (parsed.patientId === "ADD_PATIENT") {
                            sessionStorage.setItem("patient_portal_user", JSON.stringify(response.data));
                        }
                    } catch (e) {}
                }
            }

            alert("Patient Added Successfully!");
            navigate("/patient");
        }
        catch(error) {
            console.log(error);
            alert("Failed to Add Patient");
        }
    };



    return (

        <Layout>


            <div className="container py-5">


                <div className="row justify-content-center">


                    <div className="col-lg-8">


                        <div
                            className="card shadow-lg border-0 rounded-4"
                            style={{background:"#ffffff"}}
                        >



                            <div
                                className="card-header text-white rounded-top-4"
                                style={{
                                    background:"linear-gradient(90deg,#0d6efd,#0dcaf0)"
                                }}
                            >

                                <h2 className="mb-0 text-center">
                                    Add Patient
                                </h2>

                            </div>




                            <div className="card-body p-4">



                                <form onSubmit={handleSubmit}>



                                    <div className="row">



                                        <div className="col-md-6 mb-3">


                                            <label className="form-label fw-bold">
                                                Patient Name
                                            </label>


                                            <input

                                                type="text"

                                                className="form-control form-control-lg"

                                                name="firstname"

                                                value={patient.firstname}

                                                onChange={handleChange}

                                                placeholder="Enter Patient Name"

                                                required

                                            />


                                            </div>
                                            <div className="col-md-6 mb-3">

                                                <label className="form-label fw-bold">
                                                    Last Name
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    name="lastname"
                                                    value={patient.lastname}
                                                    onChange={handleChange}
                                                    placeholder="Enter Last Name"
                                                    required
                                                />

                                            </div>






                                        <div className="col-md-6 mb-3">


                                            <label className="form-label fw-bold">
                                                Email
                                            </label>


                                            <input

                                                type="email"

                                                className="form-control form-control-lg"

                                                name="email"

                                                value={patient.email}

                                                onChange={handleChange}

                                                placeholder="Enter Email"

                                                required

                                            />


                                        </div>



                                    </div>







                                    <div className="row">



                                        <div className="col-md-6 mb-3">


                                            <label className="form-label fw-bold">
                                                Phone Number
                                            </label>


                                            <input

                                                type="number"

                                                className="form-control form-control-lg"

                                                name="phoneno"

                                                value={patient.phoneno}

                                                onChange={handleChange}

                                                placeholder="Enter Phone Number"

                                                required

                                            />


                                        </div>







                                        <div className="col-md-6 mb-3">


                                            <label className="form-label fw-bold">
                                                Gender
                                            </label>


                                            <select

                                                className="form-select form-select-lg"

                                                name="gender"

                                                value={patient.gender}

                                                onChange={handleChange}

                                                required

                                            >

                                                <option value="">
                                                    Select Gender
                                                </option>

                                                <option>
                                                    Male
                                                </option>

                                                <option>
                                                    Female
                                                </option>

                                                <option>
                                                    Other
                                                </option>


                                            </select>


                                        </div>



                                    </div>








                                    <div className="row">



                                        <div className="col-md-6 mb-3">


                                            <label className="form-label fw-bold">
                                                Date Of Birth
                                            </label>


                                            <input

                                                type="date"

                                                className="form-control form-control-lg"

                                                name="dob"

                                                value={patient.dob}

                                                onChange={handleChange}

                                                required

                                            />


                                        </div>




                                    </div>








                                    <div className="mb-3">


                                        <label className="form-label fw-bold">
                                            Address
                                        </label>


                                        <textarea

                                            className="form-control form-control-lg"

                                            name="address"

                                            rows="3"

                                            value={patient.address}

                                            onChange={handleChange}

                                            placeholder="Enter Address"

                                            required

                                        />


                                    </div>








                                    <div className="d-flex justify-content-center mt-4">



                                        <button

                                            type="submit"

                                            className="btn btn-primary btn-lg me-3 px-5"
                                            onClick={() => navigate("/patient")}
                                        >

                                            Save

                                        </button>






                                        <button

                                            type="button"

                                            className="btn btn-secondary btn-lg px-5"

                                            onClick={() => navigate("/patient")}

                                        >

                                            Cancel

                                        </button>




                                    </div>



                                </form>



                            </div>



                        </div>



                    </div>



                </div>



            </div>



        </Layout>

    );

}


export default AddPatient;
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./admin.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Admin = () => {
    const router = useRouter();
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [date, setDate] = useState(new Date());
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        const fetchSpecialties = async () => {
            const response = await axios.get(
                `http://localhost:8080/specialties`
            );
            console.log(response.data.specialties);
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        };

        const fetchPhysicians = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/admins/pending-validations`
                );
                console.log(response.data.physicians_pending_validation);
                setDoctors(response.data.physicians_pending_validation);
            } catch (error) {
                console.log(error);
            }
        };

        fetchPhysicians();
    }, []);

    const handleApprovePhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `http://localhost:8080/admins/approve-physician/${physician.id}`
            );
            console.log(response.data);
            alert("Profesional aprobado");
            router.push("/admin");
        } catch (error) {
            console.log(error);
        }
    };

    const handleDenyPhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `http://localhost:8080/admins/deny-physician/${physician.id}`
            );
            console.log(response.data);
            alert("Profesional denegado");
            router.push("/admin");
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogoClick = () => {
        router.push("/admin");
    };

    return (
        <div className={styles.admin}>
            <header className={styles.header} onClick={handleLogoClick}>
                <Image
                    src="/logo.png"
                    alt="Logo de la empresa"
                    className={styles.logo}
                    width={200}
                    height={200}
                />
            </header>

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales pendientes de aprobación
                    </div>
                    <div className={styles["pending-approvals"]}>
                        {doctors.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Profesional:{" "}
                                            {doctor.name +
                                                " " +
                                                doctor.last_name}
                                        </p>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>
                                            Correo electrónico: {doctor.email}
                                        </p>
                                        <p>Matricula: {doctor.matricula}</p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
                                            <button
                                                className={
                                                    styles["approve-button"]
                                                }
                                                onClick={() =>
                                                    handleApprovePhysician(
                                                        doctor
                                                    )
                                                }
                                            >
                                                Aprobar
                                            </button>

                                            <button
                                                className={
                                                    styles["deny-button"]
                                                }
                                                onClick={() =>
                                                    handleDenyPhysician(doctor)
                                                }
                                            >
                                                Denegar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // If there are no pending doctor approvals, display the message
                            <div className={styles["subtitle"]}>
                                No hay aprobaciones pendientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className={styles["page-footer"]}>
                <p>Derechos de autor © 2023 KMK</p>
            </footer>
        </div>
    );
};

export default Admin;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./dashboard-physician.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";

registerLocale("es", es);

const Dashboard = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState({
        id: null,
        specialty: "",
        doctor: "",
        date: new Date(),
    });

    const userCheck = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/users/role/`
            );

            if (response.status == 200) {
                if (response.data.roles.includes("admin")) {
                    router.replace("/dashboard-admin");
                } else if (response.data.roles.includes("physician")) {
                    router.replace("/dashboard-physician");
                } else if (response.data.roles.includes("patient")) {
                    router.replace("/dashboard-patient");
                } else {
                    router.replace("/");
                }
            } else {
                console.log("Error");
                router.replace("/");
            }
        } catch (error) {
            console.log(error.response.data.detail);
            switch (error.response.data.detail) {
                case "User must be logged in":
                    router.push("/");
                    break;
                case "User has already logged in":
                    router.push("/dashboard-redirect");
                    break;
            }
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/appointments`
            );
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditAppointment = (appointment) => {
        console.log(isEditModalOpen);
        setIsEditModalOpen(true);
        setEditingAppointment({
            id: appointment.id,
            specialty: appointment.specialty,
            doctor: appointment.doctor,
            date: new Date(appointment.date),
        });
        fetchAppointments();
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSaveAppointment = () => {
        // Lógica para guardar los cambios de la cita en tu sistema
        // Esto puede variar según cómo esté implementada tu lógica de backend
        // Una vez guardados los cambios, cierra el modal
        // y actualiza la lista de citas o realiza cualquier otra acción necesaria
        setIsEditModalOpen(false);
        alert("Turno modificado exitosamente");
        fetchAppointments();
    };

    const handleDeleteAppointment = async (appointmentId) => {
        console.log(appointmentId);
        try {
            await axios.delete(
                `http://localhost:8080/appointments/${appointmentId}`
            );
            alert("Turno eliminado exitosamente");
            fetchAppointments();
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogoClick = () => {
        router.push("/dashboard");
    };
    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        userCheck();
        fetchAppointments();
        const intervalId = setInterval(() => {
            fetchAppointments();
        }, 5 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Modal de edición */}
            {isEditModalOpen && (
                <Modal
                    isOpen={isEditModalOpen}
                    onRequestClose={handleCloseEditModal}
                    style={customStyles}
                    contentLabel='Example Modal'
                >
                    {/* Campos de edición de especialidad, médico y fecha */}

                    <div className={styles.form}>
                        <div className={styles["title"]}>Editar Cita</div>

                        {/* Selector de fechas */}
                        <label htmlFor='fecha'>Fechas disponibles:</label>

                        <DatePicker
                            locale='es'
                            //dateFormat="dd-MM-yyyy HH:mm"
                            selected={date}
                            onChange={(date) => {
                                setDate(date);
                                console.log(date);
                            }}
                            timeCaption='Hora'
                            timeIntervals={30}
                            showPopperArrow={false}
                            showTimeSelect
                            inline
                        />
                    </div>

                    {/* Botones de Guardar y Cerrar */}
                    <button
                        className={styles["stantard-button"]}
                        onClick={handleSaveAppointment}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles["stantard-button"]}
                        onClick={handleCloseEditModal}
                    >
                        Cerrar
                    </button>
                </Modal>
            )}
            <header className={styles.header}>
                <Image
                    src='/logo.png'
                    alt='Logo de la empresa'
                    className={styles.logo}
                    width={200}
                    height={200}
                    onClick={handleLogoClick}
                />
                <Image
                    src='/logout-icon.png'
                    alt='CerrarSesion'
                    className={styles["logout-icon"]}
                    width={200}
                    height={200}
                    onClick={() => {
                        localStorage.removeItem("token");
                        axios.delete;
                        router.push("/");
                    }}
                />

                <div className={styles["tab-bar"]}>
                    <div className={styles.tab} onClick={handleLogoClick}>
                        Turnos
                    </div>
                    <div className={styles.tab_disabled}>Mi Ficha</div>
                </div>
            </header>

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>Mis Proximos Turnos</div>
                    <div className={styles["appointments-section"]}>
                        {appointments.length > 0 ? (
                            // If there are appointments, map through them and display each appointment
                            <div>
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Paciente:{" "}
                                            {appointment.patient.first_name +
                                                " " +
                                                appointment.patient.last_name}
                                        </p>
                                        <p>
                                            Fecha y hora:{" "}
                                            {new Date(
                                                appointment.date * 1000
                                            ).toLocaleString("es-AR")}
                                        </p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
                                            <button
                                                className={
                                                    styles["edit-button"]
                                                }
                                                onClick={() =>
                                                    handleEditAppointment(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Modificar
                                            </button>

                                            <button
                                                className={
                                                    styles["delete-button"]
                                                }
                                                onClick={() =>
                                                    handleDeleteAppointment(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // If there are no appointments, display the message
                            <div className={styles["subtitle"]}>
                                No hay turnos pendientes
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

export default Dashboard;

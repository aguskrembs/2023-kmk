"use client";

import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

import ConfirmationModal from "../../components/ConfirmationModal";
import { usePhysician } from "../physicianContext";
import { AppointmentClosureModal } from "./AppointmentClosureModal";

export const ApprovedAppointmentsCard = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { appointments, fetchAppointments, fetchPendingAppointments, handleDeleteAppointment } = usePhysician();
	const [isAddObservationModalOpen, setIsAddObervationModalOpen] = useState(false);
	const { setAppointmentToClose } = usePhysician();
	const [showModal, setShowModal] = useState(false);
	const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);

	const handleOpenAppointmentClosureModal = (appointment) => {
		setAppointmentToClose(appointment);
		setIsAddObervationModalOpen(true);
	};

	const handleDeleteClick = (appointmentId) => {
		setAppointmentIdToDelete(appointmentId);
		setShowModal(true);
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		fetchAppointments()
			.then(() => setIsLoading(false))
			.catch(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<>
			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<div className={styles.form}>
					<div className={styles["title"]}>Mis Proximos Turnos</div>
					<Image
						src="/refresh_icon.png"
						alt="Refrescar"
						className={styles["refresh-icon"]}
						width={200}
						height={200}
						onClick={() => {
							fetchAppointments(true);
							fetchPendingAppointments();
						}}
					/>
					<div className={styles["appointments-section"]}>
						{appointments.length > 0 ? (
							<div>
								{appointments.map((appointment) => (
									<div key={appointment.id} className={styles["appointment"]}>
										{isAddObservationModalOpen && (
											<AppointmentClosureModal
												isAddObservationModalOpen={isAddObservationModalOpen}
												setIsAddObervationModalOpen={setIsAddObervationModalOpen}
												appointment={appointment}
											></AppointmentClosureModal>
										)}
										<div className={styles["subtitle"]}>Paciente: {appointment.patient.first_name + " " + appointment.patient.last_name}</div>
										<p>
											Fecha y hora:
											{new Date(appointment.date * 1000).toLocaleString("es-AR", { hour12: false })}
										</p>
										<div className={styles["appointment-buttons-container"]}>
											<button
												className={styles["standard-button"]}
												onClick={() => {
													handleOpenAppointmentClosureModal(appointment);
												}}
											>
												Finalizar Turno
											</button>
											<Link
												href={{
													pathname: "/medical-records?patientId",
													query: appointment.patient.id,
												}}
												as={`medical-records?patientId=${appointment.patient.id}`}
											>
												<button className={styles["standard-button"]}>Ver Historia Clinica</button>
											</Link>

											<button className={styles["delete-button"]} onClick={() => handleDeleteClick(appointment.id)}>
												Cancelar
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className={styles["subtitle"]}>No hay turnos pendientes</div>
						)}
					</div>
					<ConfirmationModal
						isOpen={showModal}
						closeModal={() => setShowModal(false)}
						confirmAction={() => handleDeleteAppointment(appointmentIdToDelete, setShowModal)}
						message="¿Estás seguro de que deseas cancelar este turno?"
					/>
				</div>
			)}
		</>
	);
};

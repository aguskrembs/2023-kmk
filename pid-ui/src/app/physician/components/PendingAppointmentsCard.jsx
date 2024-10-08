"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import { usePhysician } from "../physicianContext";

export const PendingAppointmentsCard = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [showPendingModal, setPendingShowModal] = useState(false);
	const [appointmentIdToDeny, setAppointmentIdToDeny] = useState(null);

	const {
		pendingAppointments,
		fetchPendingAppointments,
		handleApproveAppointment,
		handleDenyAppointment,
	} = usePhysician();

	const handleDenyClick = (appointmentId) => {
		setAppointmentIdToDeny(appointmentId);
		setPendingShowModal(true);
	};

	useEffect(() => {
		fetchPendingAppointments()
			.then(() => setIsLoading(false))
			.catch((error) => {
				console.log(error);
				setIsLoading(false);
				toast.error("Error al obtener los datos del usuario");
			});
	}, []);

	return (
		<>
			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<div className={styles.form}>
					<div className={styles["title"]}>
						Turnos solicitados sin confirmar
					</div>
					<Image
						src="/refresh_icon.png"
						alt="Notificaciones"
						className={styles["refresh-icon"]}
						width={200}
						height={200}
						onClick={() => {
							toast.info("Actualizando turnos...");
							fetchPendingAppointments(true);
						}}
					/>
					<div className={styles["appointments-section"]}>
						{pendingAppointments.length > 0 ? (
							<div>
								{pendingAppointments.map((appointment) => (
									<div
										key={appointment.id}
										className={styles["appointment"]}
									>
										<div className={styles["subtitle"]}>
											Paciente:{" "}
											{appointment.patient.first_name +
												" " +
												appointment.patient.last_name}
										</div>
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
													styles["approve-button"]
												}
												onClick={() =>
													handleApproveAppointment(
														appointment.id
													)
												}
											>
												Confirmar{" "}
											</button>

											<button
												className={
													styles["delete-button"]
												}
												onClick={() =>
													handleDenyClick(
														appointment.id
													)
												}
											>
												Rechazar
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className={styles["subtitle"]}>
								No hay turnos pendientes
							</div>
						)}
					</div>
					<ConfirmationModal
						isOpen={showPendingModal}
						closeModal={() => setPendingShowModal(false)}
						confirmAction={() =>
							handleDenyAppointment(
								appointmentIdToDeny,
								setPendingShowModal
							)
						}
						message="¿Estás seguro de que deseas rechazar este turno?"
					/>
				</div>
			)}
		</>
	);
};

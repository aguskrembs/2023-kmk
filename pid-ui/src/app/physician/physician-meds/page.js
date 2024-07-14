"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../../components/header";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";

const PhysicianPendingAppointments = () => {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [showPendingModal, setPendingShowModal] = useState(false);
	const [appointmentIdToDeny, setAppointmentIdToDeny] = useState(null);

	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const fetchPendingAppointments = async () => {
		try {
			const response = await axios.get(
				`${apiURL}physicians/pending-appointments`
			);
			response.data.appointments == undefined
				? setPendingAppointments([])
				: setPendingAppointments(response.data.appointments);
		} catch (error) {
			toast.error("Error al obtener los turnos");
			console.log(error);
		}
	};

	const handleApproveAppointment = async (appointmentId) => {
		console.log(appointmentId);
		toast.info("Aprobando turno...");
		try {
			await axios.post(
				`${apiURL}physicians/approve-appointment/${appointmentId}`
			);
			toast.success("Turno aprobado exitosamente");
			fetchPendingAppointments();
		} catch (error) {
			console.log(error);
		}
	};

	const handleDenyClick = (appointmentId) => {
		setAppointmentIdToDeny(appointmentId);
		setPendingShowModal(true);
	};

	const handleDenyAppointment = async () => {
		setPendingShowModal(false);
		toast.info("Rechazando turno...");
		try {
			await axios.delete(`${apiURL}appointments/${appointmentIdToDeny}`, {
				httpsAgent: agent,
			});
			toast.success("Turno rechazado exitosamente");
			fetchPendingAppointments();
		} catch (error) {
			console.log(error);
			toast.error("Error al rechazar turno");
		}
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		fetchPendingAppointments()
			.then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
			.catch(() => {
				setIsLoading(false); // Asegúrate de marcar como cargado en caso de error
				toast.error("Error al obtener los datos del usuario");
			});
	}, []);

	return (
		<div className={styles.dashboard}>
			<PhysicianTabBar highlight={"TurnosPorAprobar"} />

			<Header role="physician" />

			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<>
					<div className={styles["tab-content"]}>
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
									fetchPendingAppointments();
								}}
							/>
							<div className={styles["appointments-section"]}>
								{pendingAppointments.length > 0 ? (
									// If there are appointments, map through them and display each appointment
									<div>
										{/* ... */}
										{pendingAppointments.map(
											(appointment) => (
												<div
													key={appointment.id}
													className={
														styles["appointment"]
													}
												>
													<div
														className={
															styles["subtitle"]
														}
													>
														Paciente:{" "}
														{appointment.patient
															.first_name +
															" " +
															appointment.patient
																.last_name}
													</div>
													<p>
														Fecha y hora:{" "}
														{new Date(
															appointment.date *
																1000
														).toLocaleString(
															"es-AR"
														)}
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
																styles[
																	"approve-button"
																]
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
																styles[
																	"delete-button"
																]
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
											)
										)}
									</div>
								) : (
									// If there are no appointments, display the message
									<div className={styles["subtitle"]}>
										No hay turnos pendientes
									</div>
								)}
								{/* ... */}
							</div>
							{/* Modal de confirmación */}
							<ConfirmationModal
								isOpen={showPendingModal}
								closeModal={() => setPendingShowModal(false)}
								confirmAction={handleDenyAppointment}
								message="¿Estás seguro de que deseas rechazar este turno?"
							/>
						</div>
					</div>

					<Footer />
				</>
			)}
		</div>
	);
};

export default PhysicianPendingAppointments;

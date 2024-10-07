"use client";

import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import https from "https";
import ConfirmationModal from "../../components/ConfirmationModal";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { usePhysician } from "../physicianContext";
import {
	fetchAppointments,
	handleDeleteAppointment,
} from "@/app/physician/utils";

export const ApprovedAppointmentsCard = () => {
	const [isLoading, setIsLoading] = useState(true);
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const { appointments, setAppointments } = usePhysician();
	const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
		useState(false);
	const [startTime, setStartTime] = useState("");
	const [newObservationContent, setNewObservationContent] = useState("");
	const [appointmentAttended, setAppointmentAttended] = useState(true);
	const [appointmentToClose, setAppointmentToClose] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
	const [disabledCloseAppointmentButton, setDisabledCloseAppointmentButton] =
		useState(false);

	const [reviews, setReviews] = useState({
		puntuality: {
			name: "Puntualidad",
			rating: -1,
		},
		cleanliness: {
			name: "Limpieza",
			rating: -1,
		},
		attendance: {
			name: "Asistencia",
			rating: -1,
		},
		treat: {
			name: "Trato",
			rating: -1,
		},
		communication: {
			name: "Comunicacion",
			rating: -1,
		},
	});

	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const handleOpenAppointmentClosureModal = (appointment) => {
		setIsAddObervationModalOpen(true);
		setAppointmentToClose(appointment);
	};

	const handleAppointmentClosure = async () => {
		setDisabledCloseAppointmentButton(true);
		console.log(appointmentToClose.id);
		console.log(appointmentAttended);
		console.log(startTime);
		let hour = startTime.split(":")[0];
		let minutes = startTime.split(":")[1];
		let date = new Date(appointmentToClose.date * 1000);
		date.setHours(hour);
		date.setMinutes(minutes);
		console.log((date.getTime() / 1000).toString());

		try {
			const response = await axios.put(
				`${apiURL}appointments/close-appointment/${appointmentToClose.id}`,
				{
					attended: appointmentAttended,
					start_time: (date.getTime() / 1000).toString(),
				},
				{
					httpsAgent: agent,
				}
			);
		} catch (error) {
			toast.error("Error al cerrar el turno");
			console.error(error);
		}

		try {
			const response = await axios.post(
				`${apiURL}records/update`,
				{
					appointment_id: appointmentToClose.id,
					attended: appointmentAttended.toString(),
					real_start_time: (date.getTime() / 1000).toString(),
					observation: newObservationContent,
				},
				{
					httpsAgent: agent,
				}
			);
			toast.info("Turno cerrado exitosamente");
			fetchAppointments(setAppointments);
			setIsAddObervationModalOpen(false);
		} catch (error) {
			toast.error("Error al agregar la observación");
			console.error(error);
		}
		try {
			let reviewsToSend = {};
			Object.keys(reviews).forEach((review) => {
				if (reviews[review].rating >= 0)
					reviewsToSend[review] = reviews[review].rating;
			});
			console.log(reviewsToSend);
			const response = await axios.post(
				`${apiURL}users/add-score`,
				{
					appointment_id: appointmentToClose.id,
					...reviewsToSend,
				},
				{
					httpsAgent: agent,
				}
			);
			toast.info("Puntaje cargado exitosamente");
		} catch (error) {
			toast.error("Error al agregar la puntaje");
			console.error(error);
		}
		setDisabledCloseAppointmentButton(false);
	};

	const handleDeleteClick = (appointmentId) => {
		setAppointmentIdToDelete(appointmentId);
		setShowModal(true);
	};

	// const MODAL_STYLES = {
	// 	top: "50%",
	// 	left: "50%",
	// 	right: "auto",
	// 	bottom: "auto",
	// 	marginRight: "-50%",
	// 	transform: "translate(-50%, -50%)",
	// 	width: "80%",
	// 	marginTop: "6rem",
	// };

	// const OVERLAY_STYLE = {
	// 	position: "fixed",
	// 	display: "flex",
	// 	justifyContent: "center",
	// 	top: "200px",
	// 	left: "0",
	// 	width: "100%",
	// 	height: "100%",
	// 	backgroundColor: "rgba(0,0,0, .8)",
	// 	zIndex: "1000",
	// 	overflowY: "auto",
	// 	marginTop: "6rem",
	// };

	const handleCloseEditModal = () => {
		setIsAddObervationModalOpen(false);
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		fetchAppointments(setAppointments)
			.then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
			.catch(() => {
				setIsLoading(false); // Asegúrate de marcar como cargado en caso de error
			});
	}, []);

	return (
		<>
			{isAddObservationModalOpen && (
				<Modal
					ariaHideApp={false}
					isOpen={isAddObservationModalOpen}
					onRequestClose={handleCloseEditModal}
					// style={customStyles}
				>
					<div
						className={styles["new-record-section"]}
						onSubmit={handleAppointmentClosure}
					>
						<div className={styles["title"]}>Gestion del Turno</div>
						<div className={styles["appointment"]}>
							<div className={styles["subtitle"]}>
								El paciente fue atendido?
							</div>
							<select
								className={styles["select"]}
								name="attended"
								id="attended"
								onChange={(e) => {
									console.log(e.target.value);
									setAppointmentAttended(e.target.value);
								}}
							>
								<option value={true}>Si</option>
								<option value={false}>No</option>
							</select>

							<div className={styles["subtitle"]}>
								Horario real de atencion:{" "}
							</div>

							<input
								type="time"
								id="time"
								name="time"
								onChange={(date) => {
									setStartTime(date.target.value.toString());
									console.log(date.target.value.toString());
								}}
								disabled={appointmentAttended == "false"}
								required
								className={`${
									appointmentAttended == "false"
										? styles["disabled-input"]
										: ""
								}`}
							/>

							<div className={styles["subtitle"]}>
								Observaciones
							</div>

							<textarea
								id="observation"
								value={newObservationContent}
								onChange={(e) => {
									console.log(e.target.value);
									setNewObservationContent(e.target.value);
								}}
								placeholder="Escribe una nueva observación"
								required
								className={`${styles["observation-input"]} ${
									appointmentAttended === "false"
										? styles["disabled-input"]
										: ""
								}`}
								wrap="soft"
								disabled={appointmentAttended == "false"}
							/>
						</div>

						<div
							key={reviews.key}
							className={styles["reviews-container"]}
						>
							{Object.keys(reviews).length > 0 ? (
								<>
									{Object.keys(reviews).map((review) => (
										<div
											key={review}
											className={styles["review"]}
										>
											<div
												className={
													styles[
														"review-cards-container"
													]
												}
											>
												<div
													className={
														styles["review-card"]
													}
												>
													<div
														className={
															styles[
																"review-card-title"
															]
														}
													>
														{reviews[review].name}
													</div>
													<div
														className={
															styles[
																"review-card-content"
															]
														}
													>
														<select
															onChange={(e) =>
																setReviews({
																	...reviews,
																	[review]: {
																		name: reviews[
																			review
																		].name,
																		rating: Number(
																			e
																				.target
																				.value
																		),
																	},
																})
															}
														>
															<option value={-1}>
																N/A
															</option>
															<option value={0}>
																Muy Malo
															</option>
															<option value={1}>
																Malo
															</option>
															<option value={2}>
																Neutro
															</option>
															<option value={3}>
																Bueno
															</option>
															<option value={4}>
																Muy Bueno
															</option>
															<option value={5}>
																Excelente
															</option>
														</select>
													</div>
												</div>
											</div>
										</div>
									))}
								</>
							) : (
								// If there are no reviews, display the message
								<div className={styles["subtitle"]}>
									No hay reviews
								</div>
							)}
						</div>

						<button
							className={`${styles["edit-button"]} ${
								!newObservationContent ||
								!startTime ||
								disabledCloseAppointmentButton
									? styles["disabled-button"]
									: ""
							}`}
							onClick={handleAppointmentClosure}
							disabled={
								!newObservationContent ||
								!startTime ||
								disabledCloseAppointmentButton
							}
						>
							Agregar
						</button>
					</div>
				</Modal>
			)}
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
							fetchAppointments(setAppointments, true);
						}}
					/>
					<div className={styles["appointments-section"]}>
						{appointments.length > 0 ? (
							<div>
								{appointments.map((appointment) => (
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
											Fecha y hora:
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
													styles["standard-button"]
												}
												onClick={() => {
													handleOpenAppointmentClosureModal(
														appointment
													);
												}}
											>
												Finalizar Turno
											</button>
											<Link
												href={{
													pathname:
														"/medical-records?patientId",
													query: appointment.patient
														.id,
												}}
												as={`medical-records?patientId=${appointment.patient.id}`}
											>
												<button
													className={
														styles[
															"standard-button"
														]
													}
												>
													Ver Historia Clinica
												</button>
											</Link>

											<button
												className={
													styles["delete-button"]
												}
												onClick={() =>
													handleDeleteClick(
														appointment.id
													)
												}
											>
												Cancelar
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
						isOpen={showModal}
						closeModal={() => setShowModal(false)}
						confirmAction={() =>
							handleDeleteAppointment(
								appointmentIdToDelete,
								setAppointments,
								setShowModal
							)
						}
						message="¿Estás seguro de que deseas cancelar este turno?"
					/>
				</div>
			)}
		</>
	);
};

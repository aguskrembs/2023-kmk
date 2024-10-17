import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "../../styles/styles.module.css";
import https from "https";
import axios from "axios";
import { toast } from "react-toastify";
import { usePhysician } from "../physicianContext";

export const AppointmentClosureModal = ({ isAddObservationModalOpen, setIsAddObervationModalOpen }) => {
	const { appointmentToClose, fetchAppointments, meds, setMeds, fetchMeds } = usePhysician();
	const [startTime, setStartTime] = useState("");
	const [newObservationContent, setNewObservationContent] = useState("");
	const [appointmentAttended, setAppointmentAttended] = useState(true);
	const [disabledCloseAppointmentButton, setDisabledCloseAppointmentButton] = useState(false);
	const [prescribedMedicationId, setPrescribedMedicationId] = useState("");
	const [prescriptionDetail, setPrescriptionDetail] = useState("");
	const [reviews, setReviews] = useState({
		puntuality: { name: "Puntualidad", rating: -1 },
		cleanliness: { name: "Higiene", rating: -1 },
		attendance: { name: "Asistencia", rating: -1 },
		treat: { name: "Trato", rating: -1 },
		communication: { name: "Comunicación", rating: -1 },
	});

	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	// Verifica si el formulario puede cerrarse
	const isAppointmentClosable = () => {
		if (!appointmentAttended) return true; // Si no asistió, se puede cerrar

		// Si asistió, se requiere hora, observación y que todos los ratings sean válidos
		const allReviewsCompleted = Object.values(reviews).every((review) => review.rating >= 0);
		return startTime && newObservationContent && allReviewsCompleted;
	};

	const handleCloseEditModal = () => {
		setIsAddObervationModalOpen(false);
	};

	const handleAppointmentClosure = async () => {
		setDisabledCloseAppointmentButton(true);
		let hour = startTime.split(":")[0];
		let minutes = startTime.split(":")[1];
		let date = new Date(appointmentToClose.date * 1000);
		date.setHours(hour);
		date.setMinutes(minutes);

		console.log("###CIERRE DEL TURNO");
		console.log(appointmentToClose);
		console.log(startTime);
		console.log(newObservationContent);
		console.log(prescribedMedicationId);
		console.log(prescriptionDetail);
		console.log(reviews);

		try {
			// Cierra el turno
			await axios.put(
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
			// Añade la observación
			await axios.post(
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
			fetchAppointments();
			handleCloseEditModal();
		} catch (error) {
			toast.error("Error al agregar la observación");
			console.error(error);
		}

		if (prescribedMedicationId !== "") {
			try {
				//Añade la receta, si es que existe
				await axios.post(
					`${apiURL}prescriptions/create-prescription`,
					{
						appointment_id: appointmentToClose.id,
						patient_id: appointmentToClose.patient.id,
						med_id: prescribedMedicationId,
						prescription_detail: prescriptionDetail,
					},
					{
						httpsAgent: agent,
					}
				);
			} catch (error) {
				toast.error("Error al crear la receta");
				console.error(error);
			}
		}

		try {
			// Añade la puntuación
			let reviewsToSend = {};
			Object.keys(reviews).forEach((review) => {
				if (reviews[review].rating >= 0) reviewsToSend[review] = reviews[review].rating;
			});

			await axios.post(
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
			toast.error("Error al agregar el puntaje");
			console.error(error);
		}
		setDisabledCloseAppointmentButton(false);
	};

	useEffect(() => {
		fetchMeds().catch((error) => {
			console.error(error);
			setIsLoading(false);
			toast.error("Error al obtener los medicamentos disponibles");
		});
	}, []);
	return (
		<Modal
			ariaHideApp={false}
			isOpen={isAddObservationModalOpen}
			onRequestClose={handleCloseEditModal}
			style={{
				overlay: {
					position: "fixed",
					zIndex: 1020,
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(255, 255, 255, 0.75)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				},
			}}
		>
			<div className={styles["new-record-section"]}>
				<div className={styles["title"]}>Gestión del Turno</div>

				<div className={styles["appointment"]}>
					<div className={styles["subtitle"]}>¿El paciente fue atendido?</div>
					<select className={styles["select"]} value={appointmentAttended} onChange={(e) => setAppointmentAttended(e.target.value === "true")}>
						<option value={true}>Sí</option>
						<option value={false}>No</option>
					</select>

					{appointmentAttended && (
						<>
							<div className={styles["subtitle"]}>Horario real de atención:</div>
							<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={styles["time-input"]} />

							<div className={styles["subtitle"]}>Observaciones</div>
							<textarea
								value={newObservationContent}
								onChange={(e) => setNewObservationContent(e.target.value)}
								placeholder="Escribe una nueva observación"
								required
								className={styles["observation-input"]}
							/>

							{/* Campos para ingresar la receta */}
							<div className={styles["subtitle"]}>Medicamento Recetado</div>
							<select value={prescribedMedicationId} onChange={(e) => setPrescribedMedicationId(e.target.value)} required className={styles["select"]}>
								<option value="">Seleccione un medicamento</option>
								{meds.map((med) => (
									<option key={med.id} value={med.id}>
										{med.name} {med.dose}
									</option>
								))}
							</select>

							<div className={styles["subtitle"]}>Indicación de Consumo</div>
							<textarea
								value={prescriptionDetail}
								onChange={(e) => setPrescriptionDetail(e.target.value)}
								placeholder="Ingrese las instrucciones"
								required
								className={styles["observation-input"]}
							/>

							<div className={styles["subtitle"]}>Puntuaciones</div>
							<div key={reviews.key} className={styles["reviews-container"]}>
								{Object.keys(reviews).length > 0 ? (
									<>
										{Object.keys(reviews).map((review) => (
											<div key={review} className={styles["review"]}>
												<div className={styles["review-cards-container"]}>
													<div className={styles["review-card"]}>
														<div className={styles["review-card-title"]}>{reviews[review].name}</div>
														<div className={styles["review-card-content"]}>
															<select
																onChange={(e) =>
																	setReviews({
																		...reviews,
																		[review]: {
																			name: reviews[review].name,
																			rating: Number(e.target.value),
																		},
																	})
																}
															>
																<option value={-1}>N/A</option>
																<option value={0}>Muy Malo</option>
																<option value={1}>Malo</option>
																<option value={2}>Neutro</option>
																<option value={3}>Bueno</option>
																<option value={4}>Muy Bueno</option>
																<option value={5}>Excelente</option>
															</select>
														</div>
													</div>
												</div>
											</div>
										))}
									</>
								) : (
									// If there are no reviews, display the message
									<div className={styles["subtitle"]}>No hay reviews</div>
								)}
							</div>
						</>
					)}
				</div>

				<button
					className={isAppointmentClosable() ? styles["edit-button"] : styles["disabled-button"]}
					onClick={handleAppointmentClosure}
					disabled={!isAppointmentClosable() || disabledCloseAppointmentButton}
				>
					Cerrar Turno
				</button>
			</div>
		</Modal>
	);
};

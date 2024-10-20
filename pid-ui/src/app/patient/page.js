"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../styles/styles.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

registerLocale("es", es);

const DashboardPatient = () => {
	const [isLoading, setIsLoading] = useState(true);
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const router = useRouter();
	const [appointments, setAppointments] = useState([]);
	const [doctors, setDoctors] = useState([]);
	const [specialties, setSpecialties] = useState([]);
	const [selectedSpecialty, setSelectedSpecialty] = useState("");
	const [selectedDoctor, setSelectedDoctor] = useState("");
	const [physiciansAgenda, setPhysiciansAgenda] = useState({});
	const [date, setDate] = useState(new Date());
	const [dateToEdit, setDateToEdit] = useState(new Date());
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
	const [editingAppointment, setEditingAppointment] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
	const [disabledAppointmentButton, setDisabledAppointmentButton] = useState(false);

	const [physicianScores, setPhysicianScores] = useState([]);
	const [appointmentScores, setAppointmentScores] = useState([]);

	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const checkPendingReviews = async () => {
		try {
			const response = await axios.get(`${apiURL}users/patient-pending-scores`, {
				httpsAgent: agent,
			});
			console.log(response.data);
			if (response.data.pending_scores.length > 0) {
				router.push("/patient/pending-reviews");
			}
		} catch (error) {
			toast.error("Error al obtener las reseñas pendientes");
			console.error(error);
		}
	};

	const getPhysicianScores = async (id) => {
		try {
			const response = await axios.get(`${apiURL}users/score/${id}`, {
				httpsAgent: agent,
			});
			console.log(response.data.score_metrics);

			let tempReviews = [
				{ id: 1, type: "Puntualidad", rating: 0 },
				{ id: 2, type: "Atencion", rating: 0 },
				{ id: 3, type: "Higiene", rating: 0 },
				{ id: 4, type: "Disponibilidad", rating: 0 },
				{ id: 5, type: "Precio", rating: 0 },
				{ id: 6, type: "Comunicacion", rating: 0 },
			];

			tempReviews[0].rating = response.data.score_metrics.puntuality;
			tempReviews[1].rating = response.data.score_metrics.attention;
			tempReviews[2].rating = response.data.score_metrics.cleanliness;
			tempReviews[3].rating = response.data.score_metrics.availability;
			tempReviews[4].rating = response.data.score_metrics.price;
			tempReviews[5].rating = response.data.score_metrics.communication;

			if (tempReviews[0].rating + tempReviews[1].rating + tempReviews[2].rating + tempReviews[3].rating + tempReviews[4].rating + tempReviews[5].rating == 0) {
				setPhysicianScores([]);
			} else {
				setPhysicianScores(tempReviews);
			}
		} catch (error) {
			toast.error("Error al obtener los puntajes");
			console.error(error);
		}
	};

	const getAppointmentScores = async (id) => {
		try {
			const response = await axios.get(`${apiURL}users/score/${id}`, {
				httpsAgent: agent,
			});
			console.log(response.data.score_metrics);

			let tempReviews = [
				{ id: 1, type: "Puntualidad", rating: 5 },
				{ id: 2, type: "Atencion", rating: 4.5 },
				{ id: 3, type: "Higiene", rating: 4.5 },
				{ id: 4, type: "Disponibilidad", rating: 3 },
				{ id: 5, type: "Precio", rating: 4.5 },
				{ id: 6, type: "Comunicacion", rating: 2.5 },
			];

			tempReviews[0].rating = response.data.score_metrics.puntuality;
			tempReviews[1].rating = response.data.score_metrics.attention;
			tempReviews[2].rating = response.data.score_metrics.cleanliness;
			tempReviews[3].rating = response.data.score_metrics.availability;
			tempReviews[4].rating = response.data.score_metrics.price;
			tempReviews[5].rating = response.data.score_metrics.communication;

			if (tempReviews[0].rating + tempReviews[1].rating + tempReviews[2].rating + tempReviews[3].rating + tempReviews[4].rating + tempReviews[5].rating == 0) {
				setPhysicianScores([]);
			} else {
				setAppointmentScores(tempReviews);
			}
		} catch (error) {
			toast.error("Error al obtener los puntajes");
			console.error(error);
		}
	};

	const fetchAppointments = async () => {
		try {
			const response = await axios.get(`${apiURL}appointments/`, {
				httpsAgent: agent,
			});
			response.data.appointments == undefined ? setAppointments([]) : setAppointments(response.data.appointments);
		} catch (error) {
			toast.error("Error al cargar turnos");
			console.error(error);
		}
	};

	const fetchSpecialties = async () => {
		try {
			const response = await axios.get(`${apiURL}specialties`, {
				httpsAgent: agent,
			});
			response.data.specialties == undefined ? setSpecialties([]) : setSpecialties(response.data.specialties);
		} catch (error) {
			toast.error("Error al cargar especialidades");
			console.error(error);
		}
	};

	const fetchPhysicians = async (specialty) => {
		try {
			if (specialty) {
				const response = await axios.get(`${apiURL}physicians/specialty/${specialty}`, {
					httpsAgent: agent,
				});
				response.data.physicians == undefined ? setDoctors([]) : setDoctors(response.data.physicians);
			} else {
				setDoctors([]);
				setPhysiciansAgenda({});
			}
		} catch (error) {
			toast.error("Error al cargar médicos");
			console.error(error);
		}
	};

	const handleOpenEditModal = async (appointment) => {
		setIsEditModalOpen(true);
		setEditingAppointment({
			id: appointment.id,
			specialty: appointment.physician.specialty,
			doctor: appointment.physician,
			date: appointment.date,
			patient: appointment.patient,
			agenda: appointment.physician.agenda,
		});
	};

	const handleSaveAppointment = async () => {
		console.log(dateToEdit);
		console.log(editingAppointment);

		try {
			await axios.put(
				`${apiURL}appointments/${editingAppointment.id}`,
				{
					date: Math.round(dateToEdit.getTime() / 1000),
				},
				{
					httpsAgent: agent,
				}
			);
			fetchAppointments();
			setIsEditModalOpen(false);
			toast.info("Turno modificado exitosamente. Aguarde aprobación del mismo");
		} catch (error) {
			console.error(error);
			toast.error("Error al modificar turno");
		}
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
	};

	const handleOpenRatingModal = (doctorId) => {
		getAppointmentScores(doctorId);
		setIsRatingModalOpen(true);

		console.log(doctorId);
		//Logica de fecth review para el doctorID pasado por parametro
	};

	const handleCloseRatingModal = () => {
		setAppointmentScores([]);
		setIsRatingModalOpen(false);
	};

	const saveAgenda = (doctorId) => {
		if (doctorId) {
			console.log(doctors.filter((doctor) => doctor.id == doctorId)[0].agenda);
			setPhysiciansAgenda(doctors.filter((doctor) => doctor.id == doctorId)[0].agenda);
			getPhysicianScores(doctorId);
		} else {
			setPhysiciansAgenda({});
		}
	};

	const handleDeleteClick = (appointmentId) => {
		setAppointmentIdToDelete(appointmentId);
		setShowModal(true);
	};

	const handleDeleteAppointment = async () => {
		setShowModal(false);
		toast.info("Eliminando turno...");
		try {
			await axios.delete(`${apiURL}appointments/${appointmentIdToDelete}`, {
				httpsAgent: agent,
			});
			toast.success("Turno eliminado exitosamente");
			fetchAppointments();
			setAppointmentIdToDelete(null); // Limpiar el ID del turno después de eliminar
		} catch (error) {
			console.error(error);
			toast.error("Error al eliminar turno");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setDisabledAppointmentButton(true);
		checkPendingReviews();
		try {
			toast.info("Solicitando turno...");
			const response = await axios.post(
				`${apiURL}appointments/`,
				{
					physician_id: selectedDoctor,
					date: Math.round(date.getTime() / 1000),
				},
				{
					httpsAgent: agent,
				}
			);
			toast.success("Turno solicitado. Aguarde aprobacion del mismo");
			setSelectedDoctor("");
			setDate(new Date());
			setSelectedSpecialty("");
			setPhysiciansAgenda({});
			fetchAppointments();
		} catch (error) {
			console.error(error);
			toast.error("Error al solicitar turno");
		}
		setDisabledAppointmentButton(false);
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		checkPendingReviews()
			.then(() => {
				fetchSpecialties();
				fetchAppointments();
			})
			.then(() => setIsLoading(false));
	}, []);

	return (
		<div className={styles.dashboard}>
			{/* Modal de edición */}
			{isEditModalOpen && (
				<Modal
					ariaHideApp={false}
					isOpen={isEditModalOpen}
					onRequestClose={handleCloseEditModal}
					style={{
						content: {
							top: "50%",
							left: "50%",
							right: "auto",
							bottom: "auto",
							marginRight: "-50%",
							transform: "translate(-50%, -50%)",
						},
					}}
					contentLabel="Example Modal"
				>
					<div className={styles.form}>
						<div className={styles["title"]}>Editar Cita</div>

						{/* Selector de fechas */}
						<label htmlFor="fecha">Fechas disponibles:</label>

						<DatePicker
							locale="es"
							selected={dateToEdit}
							onChange={(date) => setDateToEdit(date)}
							timeCaption="Hora"
							timeIntervals={30}
							showPopperArrow={false}
							showTimeSelect
							inline
							filterDate={(date) => {
								if (editingAppointment.doctor?.agenda?.working_days) {
									return editingAppointment.doctor.agenda.working_days.includes(date.getDay());
								}
								return false;
							}}
							minDate={new Date()}
							filterTime={(time) => {
								if (
									editingAppointment.doctor?.agenda?.appointments &&
									!editingAppointment.doctor.agenda.appointments.includes(Math.round(time.getTime() / 1000)) &&
									editingAppointment.doctor.agenda.working_hours
								) {
									let workingHour = editingAppointment.doctor.agenda.working_hours.find((workingHour) => workingHour.day_of_week === dateToEdit.getDay());

									// Verificamos que workingHour no sea undefined antes de acceder a sus propiedades
									if (workingHour) {
										let parsedTime = time.getHours() + time.getMinutes() / 60;
										return workingHour.start_time <= parsedTime && workingHour.finish_time > parsedTime;
									}
								}
								return false;
							}}
						/>
					</div>

					{/* Botones de Guardar y Cerrar */}
					<button className={styles["standard-button"]} onClick={() => handleSaveAppointment()}>
						Guardar
					</button>
					<button
						className={styles["standard-button"]}
						onClick={() => {
							handleCloseEditModal();
							console.log(editingAppointment);
						}}
					>
						Cerrar
					</button>
				</Modal>
			)}

			{/* Modal de ratings */}
			{isRatingModalOpen && (
				<Modal
					ariaHideApp={false}
					isOpen={isRatingModalOpen}
					onRequestClose={handleCloseRatingModal}
					style={{
						overlay: {
							zIndex: 1020,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(255, 255, 255, 0.75)",
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
						},
						content: {
							position: "relative",
							maxWidth: "60%",
							width: "100%",
							maxHeight: "120vh",
							overflowY: "auto",
							borderRadius: "8px",
							padding: "20px",
							background: "#fff",
						},
					}}
					contentLabel="Example Modal"
				>
					<div key={appointmentScores.key} className={styles["reviews-container"]}>
						{appointmentScores.length > 0 ? (
							<>
								{appointmentScores.map((review) => (
									<div key={review.id} className={styles["review"]}>
										<div className={styles["review-cards-container"]}>
											<div className={styles["review-card"]}>
												<div className={styles["review-card-title"]}>{review.type}</div>
												<div className={styles["review-card-content"]}>{review.rating}</div>
											</div>
										</div>
									</div>
								))}
							</>
						) : (
							// If there are no reviews, display the message
							<label>No hay reviews</label>
						)}
					</div>

					<button className={styles["standard-button"]} onClick={() => handleCloseRatingModal()}>
						Cerrar
					</button>
				</Modal>
			)}

			<TabBar highlight="Turnos" />

			<Header role="patient" />

			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<>
					<div className={styles["tab-content"]}>
						<div className={styles.form}>
							<div className={styles["title"]}>Mis Proximos Turnos</div>
							<Image
								src="/refresh_icon.png"
								alt="Notificaciones"
								className={styles["refresh-icon"]}
								width={200}
								height={200}
								onClick={() => {
									fetchAppointments();
									toast.info("Actualizando turnos...");
								}}
							/>
							<div className={styles["appointments-section"]}>
								{appointments.length > 0 ? (
									// If there are appointments, map through them and display each appointment
									<div>
										{/* ... */}
										{appointments.map((appointment) => (
											<div key={appointment.id} className={styles["appointment"]}>
												<div className={styles["subtitle"]}>{appointment.physician.specialty}</div>
												<p>
													Profesional: {appointment.physician.first_name + " " + appointment.physician.last_name}
													<a
														onClick={() => {
															handleOpenRatingModal(appointment.physician.id);
														}}
														style={{
															textDecoration: "none",
															color: "blue",
														}}
													>
														{"    "} (Ver Puntuacion)
													</a>
												</p>

												<p>Fecha y hora: {new Date(appointment.date * 1000).toLocaleString("es-AR", { hour12: false })}</p>
												<div className={styles["appointment-buttons-container"]}>
													<button className={styles["edit-button"]} onClick={() => handleOpenEditModal(appointment)}>
														Modificar
													</button>
													<button className={styles["delete-button"]} onClick={() => handleDeleteClick(appointment.id)}>
														Cancelar
													</button>
												</div>
											</div>
										))}
									</div>
								) : (
									// If there are no appointments, display the message
									<div className={styles["subtitle"]}>No hay turnos pendientes</div>
								)}
								{/* ... */}
							</div>
							{/* Modal de confirmación */}
							<ConfirmationModal
								isOpen={showModal}
								closeModal={() => setShowModal(false)}
								confirmAction={handleDeleteAppointment}
								message="¿Estás seguro de que deseas cancelar este turno?"
							/>
						</div>

						{/* Formulario de selección de especialidad y doctor */}
						<form className={styles.form} onSubmit={handleSubmit}>
							<div className={styles["title"]}>Solicitar un nuevo turno</div>

							{/* Selector de especialidades */}
							<div className={styles["subtitle"]}>Seleccione una especialidad</div>
							<select
								id="specialty"
								value={selectedSpecialty}
								required
								onChange={(e) => {
									setSelectedSpecialty(e.target.value);
									fetchPhysicians(e.target.value);
								}}
							>
								<option value="">Especialidad</option>
								{specialties.map((specialty) => (
									<option key={specialty} value={specialty}>
										{specialty.charAt(0).toUpperCase() + specialty.slice(1)}
									</option>
								))}
							</select>

							{/* Selector de médicos */}
							<div className={styles["subtitle"]}>Seleccione un médico</div>
							<select
								id="doctor"
								value={selectedDoctor}
								required
								onChange={(e) => {
									setSelectedDoctor(e.target.value);
									saveAgenda(e.target.value);
								}}
								disabled={!selectedSpecialty}
							>
								<option value="">Médico</option>
								{doctors.map((doctor) => (
									<option key={doctor.id} value={doctor.id} agenda={doctor.agenda}>
										{doctor.first_name} {doctor.last_name}
									</option>
								))}
							</select>

							<div className={styles["subtitle"]}>
								Puntuaciones del médico
								<Tooltip
									title="Las puntuaciones muestran la opinion de los usuarios acerca de los medicos. La puntuacion mas baja es 0 (muy malo) y la mas alta es 5 (excelente). En caso de que el medico no haya sido puntuado en una categoria aun, se mostrara que dicha seccion no tiene reviews."
									placement="right"
								>
									<IconButton>
										<InfoIcon />
									</IconButton>
								</Tooltip>
							</div>

							<div key={physicianScores.key} className={styles["reviews-container"]}>
								{physicianScores.length > 0 ? (
									<>
										{physicianScores.map((review) => (
											<div key={review.id} className={styles["review"]}>
												<div className={styles["review-cards-container"]}>
													<div className={styles["review-card"]}>
														<div className={styles["review-card-title"]}>{review.type}</div>
														<div className={styles["review-card-content"]}>{parseFloat(review.rating).toFixed(1)}</div>{" "}
													</div>
												</div>
											</div>
										))}
									</>
								) : (
									// If there are no reviews, display the message
									<div
										style={{
											fontSize: "20px",
											paddingLeft: "1rem",
											marginBottom: "1rem",
										}}
									>
										No hay reviews
									</div>
								)}
							</div>

							{/* Selector de fechas */}
							<div className={styles["subtitle"]}>Seleccione una fecha</div>
							<div className={styles["physician-info-container"]}>
								<div className={styles["datepicker-container"]}>
									<DatePicker
										locale="es"
										selected={date}
										onChange={(date) => {
											setDate(date);
										}}
										timeCaption="Hora"
										timeIntervals={30}
										showPopperArrow={false}
										showTimeSelect
										inline
										filterDate={(date) => {
											if (physiciansAgenda.working_days) {
												return physiciansAgenda.working_days.includes(date.getDay());
											}
											return false;
										}}
										minDate={new Date()}
										filterTime={(time) => {
											if (
												physiciansAgenda.appointments &&
												!physiciansAgenda.appointments.includes(Math.round(time.getTime() / 1000)) &&
												physiciansAgenda.working_hours &&
												time >= new Date()
											) {
												let workingHour = physiciansAgenda.working_hours.filter((workingHour) => workingHour.day_of_week === date.getDay())[0];
												let parsedTime = time.getHours() + time.getMinutes() / 60;
												return workingHour && workingHour.start_time && workingHour.finish_time && workingHour.start_time <= parsedTime && workingHour.finish_time > parsedTime;
											}
											return false;
										}}
									/>
								</div>
							</div>

							<button
								type="submit"
								className={`${styles["submit-button"]} ${!selectedDoctor || disabledAppointmentButton ? styles["disabled-button"] : ""}`}
								disabled={!selectedDoctor || disabledAppointmentButton}
							>
								Solicitar turno
							</button>
						</form>
					</div>
					<Footer />
				</>
			)}
		</div>
	);
};

export default DashboardPatient;

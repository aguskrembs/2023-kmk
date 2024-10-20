import React, { use, useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "@/app/styles/ReminderModal.module.css";
import axios from "axios";
import https from "https";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../../components/ConfirmationModal";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export const ReminderModal = ({ isOpen, closeModal, prescription, reminders, fetchReminders }) => {
	const [meds, setMeds] = useState([]);
	const [startTime, setStartTime] = useState("");
	const [freq, setFreq] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [reminderIdToDelete, setReminderIdToDelete] = useState("");
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	console.log(reminders);

	const clearTempData = () => {
		setStartTime("");
		setFreq("");
		fetchReminders();
	};

	const handleSendReminderClick = async () => {
		closeModal();
		try {
			await axios.post(
				`${apiURL}reminders`,
				{
					prescription_id: prescription.id,
					time_to_take: startTime,
					frequency_hours: freq,
				},
				{
					httpsAgent: agent,
				}
			);
			toast.success("Recordatorio creado exitosamente");
		} catch (error) {
			console.error(error);
			toast.error("Error al crear recordatorio");
		}
		clearTempData();
	};

	const handleDeleteClick = (reminderId) => {
		setShowModal(true);
		setReminderIdToDelete(reminderId);
	};

	const handleDeleteReminder = async () => {
		try {
			console.log(reminderIdToDelete);
			closeModal();
			setShowModal(false);
			await axios.delete(`${apiURL}reminders/${reminderIdToDelete}`, {
				httpsAgent: agent,
			});
			toast.success("Recordatorio eliminado exitosamente");
		} catch (error) {
			console.error(error);
			toast.error("Error al eliminar el recordatorio");
		}
		clearTempData();
	};

	const fetchMeds = async (showToast) => {
		try {
			const response = await axios.get(`${apiURL}medications`, {
				httpsAgent: agent,
			});
			const sortedMeds = response.data
				?.map((med) => ({
					...med,
					numericDose: parseFloat(med.dose.replace(/[^\d]/g, "")),
				}))
				.sort((a, b) => {
					const nameComparison = a.name.localeCompare(b.name);
					if (nameComparison !== 0) return nameComparison;
					return a.numericDose - b.numericDose;
				});

			setMeds(sortedMeds ?? []);
			showToast && toast.success("Medicamentos obtenidos exitosamente");
		} catch (error) {
			console.error(error);
		}
	};

	const medication = meds.find((med) => med.id === prescription?.med_id);

	useEffect(() => {
		fetchMeds().catch((error) => {
			console.error(error);
		});
	}, []);

	return (
		<>
			<ConfirmationModal isOpen={showModal} closeModal={() => setShowModal(false)} confirmAction={handleDeleteReminder} message="¿Estás seguro de que deseas eliminar este recordatorio?" />
			<Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Enviar Recordatorio" className={styles.modal} overlayClassName={styles.overlay} ariaHideApp={false}>
				<div className={styles["title"]}>Crear Recordatorio</div>
				<div className={styles["form-group"]}>
					<label htmlFor="reminder-med">
						Medicamento: {medication?.name} {medication?.dose}
					</label>
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="reminder-description">Posologia: {prescription?.prescription_detail}</label>
				</div>

				<div className={styles["form-group"]} style={{ paddingTop: "50px" }}>
					<label htmlFor="reminder-start">Recordatorios de esta receta:</label>
				</div>

				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 300 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Horario</TableCell>
								<TableCell align="left">Frecuencia</TableCell>
								<TableCell align="left">Eliminar</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{reminders.map((reminder) => {
								return (
									<TableRow key={reminder?.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
										<TableCell align="left">{reminder?.time_to_take}</TableCell>
										<TableCell align="left">{reminder?.frequency_hours} hs</TableCell>
										<TableCell align="left">
											<a onClick={() => handleDeleteClick(reminder.id)} style={{ color: "red", textDecoration: "underline", cursor: "pointer" }}>
												Eliminar
											</a>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>

				<div className={styles["form-group"]} style={{ paddingTop: "50px" }}>
					<label htmlFor="reminder-start">Horario de inicio:</label>
					<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={styles["time-input"]} />
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="reminder-frequency">Frecuencia (hs):</label>
					<input type="number" value={freq} onChange={(e) => setFreq(e.target.value)} required className={styles["time-input"]} />
				</div>

				<div className={styles["buttons-container"]}>
					<button
						onClick={() => {
							closeModal();
							clearTempData();
						}}
						className={styles["cancel-button"]}
					>
						Cancelar
					</button>
					<button onClick={handleSendReminderClick} className={styles["confirm-button"]}>
						Crear
					</button>
				</div>
			</Modal>
		</>
	);
};

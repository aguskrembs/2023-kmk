import React, { use, useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "@/app/styles/ReminderModal.module.css";
import axios from "axios";
import https from "https";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ReminderModal = ({ isOpen, closeModal, prescription }) => {
	const [meds, setMeds] = useState([]);
	const [startTime, setStartTime] = useState("");
	const [freq, setFreq] = useState("");
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const handleSendReminderClick = async () => {
		try {
			const response = await axios.post(
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
		} catch (error) {
			console.error(error);
		}
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
				<label htmlFor="reminder-start">Horario de inicio:</label>
				<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={styles["time-input"]} />
			</div>
			<div className={styles["form-group"]}>
				<label htmlFor="reminder-frequency">Frecuencia (hs):</label>
				<input type="number" value={freq} onChange={(e) => setFreq(e.target.value)} required className={styles["time-input"]} />
			</div>

			<div className={styles["buttons-container"]}>
				<button onClick={closeModal} className={styles["cancel-button"]}>
					Cancelar
				</button>
				<button onClick={handleSendReminderClick} className={styles["confirm-button"]}>
					Crear
				</button>
			</div>
		</Modal>
	);
};

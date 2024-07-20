import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "@/app/styles/AddMedModal.module.css";
import { usePhysician } from "../physicianContext";

export const AddMedModal = ({ isOpen, closeModal, confirmAction, med }) => {
	const { meds, setMeds } = usePhysician();
	const [medName, setMedName] = useState(med ? med.name : "");
	const [medDrug, setMedDrug] = useState(med ? med.drug : "");
	const [medDose, setMedDose] = useState(med ? med.dose : "");

	const handleAddMedClick = () => {
		if (medName && medDrug && medDose) {
			const med = {
				name:
					medName.trim().charAt(0).toUpperCase() +
					medName.trim().slice(1),
				drug:
					medDrug.trim().charAt(0).toUpperCase() +
					medDrug.trim().slice(1),
				dose:
					medDose.trim().charAt(0).toUpperCase() +
					medDose.trim().slice(1),
			};

			setMedName("");
			setMedDrug("");
			setMedDose("");

			confirmAction(med, setMeds, closeModal);
		} else {
			alert("Por favor, complete todos los campos");
		}
	};

	const handleUpdateMedClick = () => {
		if (medName && medDrug && medDose) {
			const updatedMed = {
				id: med.id,
				name: medName,
				drug: medDrug,
				dose: medDose,
			};

			setMedName("");
			setMedDrug("");
			setMedDose("");

			confirmAction(updatedMed, setMeds, closeModal);
		} else {
			alert("Por favor, complete todos los campos");
		}
	};

	useEffect(() => {
		if (med) {
			setMedName(med.name);
			setMedDrug(med.drug);
			setMedDose(med.dose);
		}
	}, [med]);

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={closeModal}
			contentLabel="Confirmación"
			className={styles.modal}
			overlayClassName={styles.overlay}
			ariaHideApp={false}
		>
			{med ? (
				<div className={styles["title"]}>Editar Medicamento</div>
			) : (
				<div className={styles["title"]}>Agregar Medicamento</div>
			)}
			<div className={styles["form-group"]}>
				<label htmlFor="med-name">Nombre del medicamento</label>
				<input
					type="text"
					id="med-name"
					value={medName}
					onChange={(e) => setMedName(e.target.value)}
					required
				/>
			</div>
			<div className={styles["form-group"]}>
				<label htmlFor="med-drug">Droga</label>
				<input
					type="text"
					id="med-drug"
					value={medDrug}
					onChange={(e) => setMedDrug(e.target.value)}
					required
				/>
			</div>
			<div className={styles["form-group"]}>
				<label htmlFor="med-dose">Presentacion</label>
				<input
					type="text"
					id="med-dose"
					value={medDose}
					onChange={(e) => setMedDose(e.target.value)}
					required
				/>
			</div>

			<div className={styles["buttons-container"]}>
				<button
					onClick={closeModal}
					className={styles["cancel-button"]}
				>
					Cancelar
				</button>
				<button
					onClick={med ? handleUpdateMedClick : handleAddMedClick}
					className={styles["confirm-button"]}
				>
					Confirmar
				</button>
			</div>
		</Modal>
	);
};

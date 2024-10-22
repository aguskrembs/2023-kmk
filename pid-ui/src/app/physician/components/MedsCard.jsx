"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import { usePhysician } from "../physicianContext";
import { AddMedModal } from "./AddMedModal";

export const MedsCard = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [showAddMedModal, setShowAddMedModal] = useState(false);
	const [showEditMedModal, setShowEditMedModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [medToDelete, setMedToDelete] = useState(null);
	const { physicianMeds, fetchMedsByPhysician, handleAddMed, handleUpdateMed, handleDeleteMed } = usePhysician();

	const handleAddMedClick = () => {
		setShowAddMedModal(true);
	};

	const handleUpdateMedClick = (med) => {
		setMedToDelete(med);
		setShowEditMedModal(true);
	};

	const handleDeleteMedClick = (med) => {
		setShowDeleteModal(true);
		setMedToDelete(med);
	};

	useEffect(() => {
		fetchMedsByPhysician()
			.then(() => setIsLoading(false))
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
				toast.error("Error al obtener los medicamentos del usuario");
			});
	}, []);

	return (
		<>
			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<div className={styles.form}>
					<div className={styles["title"]}>Mis medicamentos asociados</div>

					<Image
						src="/circle_plus_icon.png"
						alt="Agregar medicamento"
						className={styles["refresh-icon"]}
						style={{ marginRight: "5rem" }}
						width={200}
						height={200}
						onClick={handleAddMedClick}
					/>
					<Image
						src="/refresh_icon.png"
						alt="Notificaciones"
						className={styles["refresh-icon"]}
						width={200}
						height={200}
						onClick={() => {
							fetchMedsByPhysician(true);
						}}
					/>
					<div className={styles["appointments-section"]}>
						{physicianMeds.length > 0 ? (
							<div>
								{physicianMeds.map((med) => (
									<div key={med.id} className={styles["appointment"]}>
										<div className={styles["subtitle"]}>{med.name.charAt(0).toUpperCase() + med.name.slice(1)}</div>
										<p>Droga: {med.drug.charAt(0).toUpperCase() + med.drug.slice(1)}</p>
										<p>Presentación: {med.dose.charAt(0).toUpperCase() + med.dose.slice(1)}</p>
										<div className={styles["appointment-buttons-container"]}>
											<button className={styles["edit-button"]} onClick={() => handleUpdateMedClick(med)}>
												Editar
											</button>
											<button className={styles["delete-button"]} onClick={() => handleDeleteMedClick(med)}>
												Eliminar
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className={styles["subtitle"]}>No tienes medicamentos asociados</div>
						)}
					</div>
					<AddMedModal isOpen={showAddMedModal} closeModal={() => setShowAddMedModal(false)} confirmAction={handleAddMed} />
					<AddMedModal isOpen={showEditMedModal} closeModal={() => setShowEditMedModal(false)} confirmAction={handleUpdateMed} med={medToDelete} />
					<ConfirmationModal
						isOpen={showDeleteModal}
						closeModal={() => setShowDeleteModal(false)}
						message="¿Estás seguro que deseas eliminar este medicamento?"
						confirmAction={() => handleDeleteMed(medToDelete, setShowDeleteModal)}
					/>
				</div>
			)}
		</>
	);
};

"use client";

import React, { createContext, useState, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import https from "https";
const apiURL = process.env.NEXT_PUBLIC_API_URL;
const agent = new https.Agent({
	rejectUnauthorized: false,
});
const PhysiscianContext = createContext();

export const PhysicianProvider = ({ children }) => {
	const [appointments, setAppointments] = useState([]);
	const [appointmentToClose, setAppointmentToClose] = useState({});
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [meds, setMeds] = useState([]);
	const [physicianMeds, setPhysicianMeds] = useState([]);

	//CONFIRMED APPOINTMENTS
	const fetchAppointments = async (showToast) => {
		try {
			const response = await axios.get(`${apiURL}appointments/physician`, {
				httpsAgent: agent,
			});
			response.data.appointments == undefined ? setAppointments([]) : setAppointments(response.data.appointments);
			showToast && toast.success("Turnos obtenidos exitosamente");
		} catch (error) {
			toast.error("Error al obtener los turnos");
			console.error(error);
		}
	};

	const handleDeleteAppointment = async (appointmentIdToDelete, setShowModal) => {
		setShowModal(false);
		try {
			await axios.delete(`${apiURL}appointments/${appointmentIdToDelete}`, {
				httpsAgent: agent,
			});
			toast.success("Turno eliminado exitosamente");
			fetchAppointments();
		} catch (error) {
			console.error(error);
			toast.error("Error al eliminar turno");
		}
	};

	//PENDING APPOINTMENTS
	const fetchPendingAppointments = async (showToast) => {
		try {
			const response = await axios.get(`${apiURL}physicians/pending-appointments`, {
				httpsAgent: agent,
			});
			setPendingAppointments(response.data.appointments);
			showToast && toast.success("Turnos obtenidos exitosamente");
		} catch (error) {
			toast.error("Error al obtener los turnos");
			console.log(error);
		}
	};

	const handleApproveAppointment = async (appointmentId) => {
		console.log(appointmentId);
		try {
			await axios.post(`${apiURL}physicians/approve-appointment/${appointmentId}`);
			toast.success("Turno aprobado exitosamente");
			fetchPendingAppointments();
			fetchAppointments();
		} catch (error) {
			console.log(error);
		}
	};

	const handleDenyAppointment = async (appointmentIdToDeny, setPendingShowModal) => {
		setPendingShowModal(false);
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

	const fetchMeds = async (showToast) => {
		try {
			const response = await axios.get(`${apiURL}medications`, {
				httpsAgent: agent,
			});
			const sortedMeds = response.data
				?.map((med) => ({
					...med,
					numericDose: parseFloat(med.dose.replace(/[^\d]/g, "")), // Convertir dosis a número
				}))
				.sort((a, b) => {
					const nameComparison = a.name.localeCompare(b.name); // Ordenar por nombre
					if (nameComparison !== 0) return nameComparison; // Si son distintos nombres, devolver esa comparación
					return a.numericDose - b.numericDose; // Si los nombres son iguales, ordenar por dosis numérica
				});

			setMeds(sortedMeds ?? []);
			showToast && toast.success("Medicamentos obtenidos exitosamente");
		} catch (error) {
			console.error(error);
			toast.error("Error al obtener los medicamentos");
		}
	};

	//MEDICATIONS
	const fetchMedsByPhysician = async (showToast) => {
		try {
			const response = await axios.get(`${apiURL}medications/by-physician`, {
				httpsAgent: agent,
			});
			const sortedMeds = response.data
				?.map((med) => ({
					...med,
					numericDose: parseFloat(med.dose.replace(/[^\d]/g, "")), // Convertir dosis a número
				}))
				.sort((a, b) => {
					const nameComparison = a.name.localeCompare(b.name); // Ordenar por nombre
					if (nameComparison !== 0) return nameComparison; // Si son distintos nombres, devolver esa comparación
					return a.numericDose - b.numericDose; // Si los nombres son iguales, ordenar por dosis numérica
				});

			setPhysicianMeds(sortedMeds ?? []);
			showToast && toast.success("Medicamentos obtenidos exitosamente");
		} catch (error) {
			console.error(error);
			toast.error("Error al obtener los medicamentos");
		}
	};

	const handleAddMed = async (med, setShowAddModal) => {
		setShowAddModal(false);
		try {
			await axios.post(`${apiURL}medications/create-medication`, med, {
				httpsAgent: agent,
			});
			toast.success("Medicamento agregado exitosamente");
			fetchMedsByPhysician();
		} catch (error) {
			console.error(error);
			toast.info(error.response.data.detail);
		}
	};

	const handleUpdateMed = async (med, setShowEditModal) => {
		setShowEditModal(false);
		try {
			await axios.put(`${apiURL}medications/${med.id}`, med, {
				httpsAgent: agent,
			});
			toast.success("Medicamento editado exitosamente");
			fetchMedsByPhysician();
		} catch (error) {
			console.error(error);
			toast.error(error.response.data.detail);
		}
	};

	const handleDeleteMed = async (medToDelete, setShowDeleteModal) => {
		setShowDeleteModal(false);
		try {
			await axios.delete(`${apiURL}medications/${medToDelete.id}`, {
				httpsAgent: agent,
			});
			toast.success("Medicamento eliminado exitosamente");
			fetchMedsByPhysician();
		} catch (error) {
			console.error(error);
			toast.error(error.response.data.detail);
		}
	};

	return (
		<PhysiscianContext.Provider
			value={{
				appointments,
				setAppointments,
				appointmentToClose,
				setAppointmentToClose,
				pendingAppointments,
				setPendingAppointments,
				meds,
				setMeds,
				physicianMeds,
				setPhysicianMeds,
				fetchAppointments,
				handleDeleteAppointment,
				fetchPendingAppointments,
				handleApproveAppointment,
				handleDenyAppointment,
				fetchMeds,
				fetchMedsByPhysician,
				handleAddMed,
				handleUpdateMed,
				handleDeleteMed,
			}}
		>
			{children}
		</PhysiscianContext.Provider>
	);
};

export const usePhysician = () => useContext(PhysiscianContext);

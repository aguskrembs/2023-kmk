import { toast } from "react-toastify";
import axios from "axios";
import https from "https";
const apiURL = process.env.NEXT_PUBLIC_API_URL;
const agent = new https.Agent({
	rejectUnauthorized: false,
});
import { usePhysician } from "./physicianContext.js";
import { useEffect } from "react";

useEffect(() => {
	axios.defaults.headers.common = {
		Authorization: `bearer ${localStorage.getItem("token")}`,
	};
}, []);

//PENDING APPOINTMENTS
export const fetchPendingAppointments = async (
	setPendingAppointments,
	showToast
) => {
	try {
		const response = await axios.get(
			`${apiURL}physicians/pending-appointments`,
			{
				httpsAgent: agent,
			}
		);
		setPendingAppointments(response.data.appointments);
		showToast && toast.success("Turnos obtenidos exitosamente");
	} catch (error) {
		toast.error("Error al obtener los turnos");
		console.log(error);
	}
};

export const handleApproveAppointment = async (appointmentId) => {
	console.log(appointmentId);
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

export const handleDenyAppointment = async (
	appointmentIdToDeny,
	setPendingAppointments,
	setPendingShowModal
) => {
	setPendingShowModal(false);
	try {
		await axios.delete(`${apiURL}appointments/${appointmentIdToDeny}`, {
			httpsAgent: agent,
		});
		toast.success("Turno rechazado exitosamente");
		fetchPendingAppointments(setPendingAppointments);
	} catch (error) {
		console.log(error);
		toast.error("Error al rechazar turno");
	}
};

//CONFIRMED APPOINTMENTS
export const fetchAppointments = async (setAppointments, showToast) => {
	try {
		const response = await axios.get(`${apiURL}appointments/physician`, {
			httpsAgent: agent,
		});
		response.data.appointments == undefined
			? setAppointments([])
			: setAppointments(response.data.appointments);
		showToast && toast.success("Turnos obtenidos exitosamente");
	} catch (error) {
		toast.error("Error al obtener los turnos");
		console.error(error);
	}
};

export const handleDeleteAppointment = async (
	appointmentIdToDelete,
	setAppointments,
	setShowModal
) => {
	setShowModal(false);
	try {
		await axios.delete(`${apiURL}appointments/${appointmentIdToDelete}`, {
			httpsAgent: agent,
		});
		toast.success("Turno eliminado exitosamente");
		fetchAppointments(setAppointments);
	} catch (error) {
		console.error(error);
		toast.error("Error al eliminar turno");
	}
};

//MEDS
export const useMedications = () => {
	const { setMeds } = usePhysician();

	const fetchMeds = async (showToast) => {
		try {
			const response = await axios.get(
				`${apiURL}medications/medications`,
				{
					httpsAgent: agent,
				}
			);
			console.log(response);
			setMeds(response.data ?? []);
			showToast && toast.success("Medicamentos obtenidos exitosamente");
		} catch (error) {
			console.error(error);
			toast.error("Error al obtener los medicamentos");
		}
	};

	const handleAddMed = async (med, setShowAddModal) => {
		setShowAddModal(false);
		try {
			await axios.post(`${apiURL}medications/medications`, med, {
				httpsAgent: agent,
			});
			toast.success("Medicamento agregado exitosamente");
			fetchMeds();
		} catch (error) {
			console.error(error);
			toast.info(error.response.data.detail);
		}
	};

	const handleUpdateMed = async (med, setShowEditModal) => {
		setShowEditModal(false);
		try {
			await axios.put(`${apiURL}medications/medications/${med.id}`, med, {
				httpsAgent: agent,
			});
			toast.success("Medicamento editado exitosamente");
			fetchMeds();
		} catch (error) {
			console.error(error);
			toast.error(error.response.data.detail);
		}
	};

	const handleDeleteMed = async (medToDelete, setShowDeleteModal) => {
		setShowDeleteModal(false);
		try {
			await axios.delete(
				`${apiURL}medications/medications/${medToDelete.id}`,
				{
					httpsAgent: agent,
				}
			);
			toast.success("Medicamento eliminado exitosamente");
			fetchMeds();
		} catch (error) {
			console.error(error);
			toast.error(error.response.data.detail);
		}
	};

	return {
		fetchMeds,
		handleAddMed,
		handleUpdateMed,
		handleDeleteMed,
	};
};

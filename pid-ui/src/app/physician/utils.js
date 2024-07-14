import { toast } from "react-toastify";
import axios from "axios";
import https from "https";

const apiURL = process.env.NEXT_PUBLIC_API_URL;
const agent = new https.Agent({
	rejectUnauthorized: false,
});

axios.defaults.headers.common = {
	Authorization: `bearer ${localStorage.getItem("token")}`,
};

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

export const handleDenyAppointment = async (
	appointmentIdToDeny,
	setPendingAppointments,
	setPendingShowModal
) => {
	setPendingShowModal(false);
	toast.info("Rechazando turno...");
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
	toast.info("Eliminando turno...");
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

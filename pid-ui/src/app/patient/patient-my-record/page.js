"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/styles.module.css";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../../components/header";
import ConfirmationModal from "../../components/ConfirmationModal";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const MyRecord = () => {
	const [isLoading, setIsLoading] = useState(true);
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const [file, setFile] = useState([]); // File to be uploaded
	const [analysis, setAnalysis] = useState([]);
	const [record, setRecord] = useState({
		name: "",
		last_name: "",
		birth_date: "",
		gender: "",
		blood_type: "",
		id: "",
		observations: [],
	});
	const inputRef = useRef(null);
	const [showModal, setShowModal] = useState(false);
	const [selectedFile, setSelectedFile] = useState("");
	const [prescriptions, setPrescriptions] = useState([]);

	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const fetchRecord = async () => {
		try {
			const response = await axios.get(`${apiURL}records/get-my-record`, {
				httpsAgent: agent,
			});
			console.log(response);
			setRecord(response.data.record);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchPrescriptions = async () => {
		try {
			const response = await axios.get(`${apiURL}prescriptions/by-patient`);
			console.log(response);
			setPrescriptions(response.data);
		} catch (error) {
			console.error(error);
			toast.error("Error al obtener recetas");
		}
	};

	const fetchMyAnalysis = async () => {
		try {
			const response = await axios.get(`${apiURL}analysis`);
			setAnalysis(response.data);
			console.log(response);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDownload = (url) => {
		const link = document.createElement("a");
		link.download = url;

		link.href = url;

		link.click();
	};

	const handleDownloadPDF = async (prescriptionId) => {
		const token = localStorage.getItem("token");

		try {
			const response = await axios.get(`${apiURL}prescriptions/${prescriptionId}/pdf`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				responseType: "blob",
			});
			const pdfBlob = new Blob([response.data], { type: "application/pdf" });
			const url = window.URL.createObjectURL(pdfBlob);
			window.open(url, "_blank");
		} catch (error) {
			console.error("Error al descargar el PDF:", error);
			toast.error("Error al descargar el PDF");
		}
	};

	const handleDeleteClick = (file) => {
		setSelectedFile(file);
		setShowModal(true);
	};

	const handleDeleteFile = async () => {
		setShowModal(false);
		try {
			const response = await axios.delete(`${apiURL}analysis/${selectedFile}`);
			console.log(response);
			toast.success("Analisis eliminado con exito");
			fetchMyAnalysis();
		} catch (error) {
			console.error(error);
			toast.error("Error al eliminar analisis");
		}
	};

	const resetFileInput = () => {
		inputRef.current.value = null;
		setFile([]);
	};

	const onSubmit = async (e) => {
		toast.info("Subiendo analisis");
		const formData = new FormData();
		Array.from(e).forEach((file_to_upload) => formData.append("analysis", file_to_upload));
		try {
			const response = await axios.post(`${apiURL}analysis`, formData);
			console.log(response);
			toast.success("Analisis subido con exito");
			fetchMyAnalysis();
			resetFileInput();
		} catch (error) {
			console.error(error);
			toast.error("Error al subir analisis");
		}
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		fetchRecord();
		fetchMyAnalysis();
		fetchPrescriptions().then(() => setIsLoading(false));
	}, []);

	return (
		<div className={styles.dashboard}>
			<TabBar highlight="Ficha" />

			<Header role="patient" />

			{isLoading ? (
				<p>Cargando...</p>
			) : (
				<>
					<div className={styles["tab-content"]}>
						<div className={styles.form}>
							<div className={styles["title"]}>
								{record.name} {record.last_name}
							</div>
							<Image
								src="/refresh_icon.png"
								alt="Refrescar"
								className={styles["refresh-icon"]}
								width={200}
								height={200}
								onClick={() => {
									fetchRecord();
									fetchMyAnalysis();
								}}
							/>
							<div className={styles["subtitle"]}>Nac.: {record.birth_date}</div>
							<div className={styles["subtitle"]}>Genero: {record.gender}</div>
							<div className={styles["subtitle"]}>Grupo sanguíneo: {record.blood_type}</div>

							<TableContainer component={Paper}>
								<Table sx={{ minWidth: 650 }} aria-label="simple table">
									<TableHead>
										<TableRow>
											<TableCell>Fecha</TableCell>
											<TableCell align="left">Médico</TableCell>
											<TableCell align="left">Especialidad</TableCell>
											<TableCell align="left">Observacion</TableCell>
											<TableCell align="left">Receta</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{record.observations.map((observation) => {
											const prescription = prescriptions.find((p) => p.appointment_id === observation.appointment_id);
											return (
												<TableRow key={observation.appointment_id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
													<TableCell component="th" scope="row">
														{new Date(observation.appointment_date * 1000).toLocaleDateString("es-AR")}
													</TableCell>
													<TableCell align="left">{observation.physician}</TableCell>
													<TableCell align="left">{observation.specialty.charAt(0).toUpperCase() + observation.specialty.slice(1)}</TableCell>
													<TableCell align="left">{observation.observation}</TableCell>
													<TableCell align="left">
														{prescription && (
															<a onClick={() => handleDownloadPDF(prescription.id)} style={{ color: "blue", textDecoration: "underline" }}>
																Ver receta
															</a>
														)}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>

							<div className={styles["my-estudios-section"]}>
								<div className={styles["title"]}>Mis Estudios</div>

								<div className={styles["horizontal-scroll"]}>
									{analysis.length > 0 ? (
										analysis.map((uploaded_analysis) => {
											return (
												<a className={styles["estudio-card"]} key={uploaded_analysis.id}>
													<div
														onClick={() => {
															handleDownload(uploaded_analysis.url);
														}}
													>
														<div className={styles["estudio-name"]}>{uploaded_analysis.file_name.substring(0, 12) + "..."}</div>
														<Image
															src="/document.png"
															alt=""
															className={styles["document-icon"]}
															style={{
																alignSelf: "center",
																margin: "auto",
															}}
															width={100}
															height={100}
														/>
														<div
															className={styles["estudio-date"]}
															style={{
																alignSelf: "center",
																margin: "auto",
																display: "table",
																padding: "5px 0",
															}}
														>
															{new Date(uploaded_analysis.uploaded_at * 1000).toLocaleDateString("es-AR")}
														</div>
													</div>
													<Image
														src="/trash_icon.png"
														alt=""
														className={styles["document-icon"]}
														style={{
															alignSelf: "center",
														}}
														width={25}
														height={25}
														onClick={() => {
															handleDeleteClick(uploaded_analysis.id);
														}}
													/>
												</a>
											);
										})
									) : (
										<div
											style={{
												alignSelf: "center",
												margin: "auto",
												padding: "5px 0",
											}}
										>
											No hay analisis cargados
										</div>
									)}
									{/* ... */}
								</div>
								{/* Modal de confirmación */}
								<ConfirmationModal
									isOpen={showModal}
									closeModal={() => setShowModal(false)}
									confirmAction={handleDeleteFile}
									message="¿Estás seguro de que deseas eliminar este archivo?"
								/>

								<form className={styles["file-upload-form"]}>
									<label htmlFor="files" className={styles["upload-button"]} style={{ color: "#fff" }}>
										Cargar analisis
									</label>

									<input
										id="files"
										type="file"
										name="file"
										accept=".pdf"
										multiple={true}
										onChange={(e) => {
											onSubmit(e.target.files);
											setFile(e.target.files);
										}}
										onClick={(event) => {
											event.target.value = null;
										}}
										ref={inputRef}
										style={{ display: "none" }}
									/>
								</form>
							</div>
						</div>
					</div>

					<Footer />
				</>
			)}
		</div>
	);
};
export default MyRecord;

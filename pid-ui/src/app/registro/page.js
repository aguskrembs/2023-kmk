"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import https from "https";
import { HeaderSlim, Footer } from "../components/header";
import { toast } from "react-toastify";
import { validatePassword } from "./components/passwordValidator";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Registro = () => {
	const apiURL = process.env.NEXT_PUBLIC_API_URL;
	const [nombre, setNombre] = useState("");
	const [apellido, setApellido] = useState("");
	const [specialties, setSpecialties] = useState([]);
	const [especialidad, setEspecialidad] = useState("");
	const [numeroMatricula, setNumeroMatricula] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState("patient");
	const [birth_date, setBirthDate] = useState("");
	const [genders, setGenders] = useState([]);
	const [gender, setGender] = useState("");
	const [blood_types, setBloodTypes] = useState([]);
	const [blood_type, setBloodType] = useState("");
	const [loading, setLoading] = useState(false);
	const [disabledRegisterButton, setDisabledRegisterButton] = useState(false);
	const router = useRouter();
	const error = useMemo(
		() => password && validatePassword(password),
		[password]
	);
	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const fetchSpecialties = async () => {
		const response = await axios.get(`${apiURL}specialties`, {
			httpsAgent: agent,
		});
		response.data.specialties == undefined
			? setSpecialties([])
			: setSpecialties(response.data.specialties);
	};

	const fetchGenders = async () => {
		const response = await axios.get(`${apiURL}genders`, {
			httpsAgent: agent,
		});
		response.data.genders == undefined
			? setGenders([])
			: setGenders(response.data.genders);
	};

	const fetchBloodTypes = async () => {
		const response = await axios.get(`${apiURL}blood-types`, {
			httpsAgent: agent,
		});
		response.data.blood_types == undefined
			? setBloodTypes([])
			: setBloodTypes(response.data.blood_types);
	};

	const handleSubmit = async (e) => {
		localStorage.removeItem("token");
		axios.defaults.headers.common = {
			Authorization: `bearer`,
		};

		toast.info("Registrando...");
		e.preventDefault();
		setDisabledRegisterButton(true);

		let userData = {
			name: nombre,
			last_name: apellido,
			email: email,
			password: password,
			role: role,
		};

		if (role === "patient")
			userData = {
				...userData,
				gender: gender,
				blood_type: blood_type,
				birth_date: birth_date,
			};

		if (role === "physician")
			userData = {
				...userData,
				tuition: numeroMatricula,
				specialty: especialidad,
			};

		try {
			setLoading(true);
			const response = await axios.post(
				`${apiURL}users/register`,
				userData,
				{ httpsAgent: agent }
			);
			console.log(response);
			if ([200, 201].includes(response.status)) {
				toast.success("Registro exitoso. Redirigiendo...");
				await delay(5000);
				router.push("/");
			}
		} catch (error) {
			setDisabledRegisterButton(false);
			console.error(error);
			toast.error("Ha ocurrido un error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSpecialties();

		fetchGenders();

		fetchBloodTypes();
	}, []);

	return (
		<div className={styles["registro"]}>
			<HeaderSlim />

			<form className={styles["form"]} onSubmit={handleSubmit}>
				<div className={styles["title"]}>Registro</div>
				<div className={styles["subtitle"]}>
					Ingrese sus datos para comenzar
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="userType">Tipo de Usuario</label>
					<select
						id="role"
						value={role}
						onChange={(e) => setRole(e.target.value)}
						required
					>
						<option value="patient">Paciente</option>
						<option value="physician">Médico</option>
					</select>
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="nombre">Nombre</label>
					<input
						type="text"
						id="nombre"
						value={nombre}
						onChange={(e) => setNombre(e.target.value)}
						required
					/>
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="apellido">Apellido</label>
					<input
						type="text"
						id="apellido"
						value={apellido}
						onChange={(e) => setApellido(e.target.value)}
						required
					/>
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="email">Correo Electrónico</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				{role === "physician" && (
					<>
						<div className={styles["form-group"]}>
							<label htmlFor="numeroMatricula">
								Número de Matrícula
							</label>
							<input
								type="text"
								id="numeroMatricula"
								value={numeroMatricula}
								onChange={(e) =>
									setNumeroMatricula(e.target.value)
								}
								required
							/>
						</div>
						<div className={styles["form-group"]}>
							<label htmlFor="specialty">Especialidad:</label>
							<select
								id="specialty"
								value={especialidad}
								required
								onChange={(e) => {
									setEspecialidad(e.target.value);
								}}
							>
								<option value="">
									Selecciona una especialidad
								</option>
								{specialties.map((specialty) => (
									<option key={specialty} value={specialty}>
										{specialty.charAt(0).toUpperCase() +
											specialty.slice(1)}
									</option>
								))}
							</select>
						</div>
					</>
				)}
				{role === "patient" && (
					<>
						<div className={styles["form-group"]}>
							<label htmlFor="birth_date">
								Fecha de Nacimiento
							</label>
							<input
								type="date"
								id="birth_date"
								value={birth_date}
								onChange={(e) => setBirthDate(e.target.value)}
								required
							/>
						</div>
						<div className={styles["form-group"]}>
							<label htmlFor="gender">Género:</label>
							<select
								id="gender"
								value={gender}
								required
								onChange={(e) => {
									setGender(e.target.value);
								}}
							>
								<option value="">Selecciona tu género</option>
								{genders.map((gender) => (
									<option key={gender} value={gender}>
										{gender}
									</option>
								))}
							</select>
						</div>
						<div className={styles["form-group"]}>
							<label htmlFor="blood_type">Grupo sanguíneo:</label>
							<select
								id="blood_type"
								value={blood_type}
								required
								onChange={(e) => {
									setBloodType(e.target.value);
								}}
							>
								<option value="">
									Selecciona tu grupo sanguíneo
								</option>
								{blood_types.map((blood_type) => (
									<option key={blood_type} value={blood_type}>
										{blood_type}
									</option>
								))}
							</select>
						</div>
					</>
				)}
				<div className={styles["form-group"]}>
					<label htmlFor="password">Contraseña</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						required
					/>
				</div>
				<div className={styles["form-group"]}>
					<label htmlFor="confirmPassword">Repetir Contraseña</label>
					<input
						type="password"
						id="confirmPassword"
						value={confirmPassword}
						onChange={(e) => {
							setConfirmPassword(e.target.value);
						}}
						required
					/>
				</div>
				{error && (
					<div className={styles["error-message"]}>{error}</div>
				)}
				{password !== confirmPassword && (
					<div className={styles["error-message"]}>
						Las contraseñas no coinciden.
					</div>
				)}
				<button
					type="submit"
					className={`${
						password !== confirmPassword ||
						error ||
						loading ||
						disabledRegisterButton
							? styles["disabled-button"]
							: styles["button"]
					}`}
					disabled={password !== confirmPassword || error || loading}
				>
					Registrarse
				</button>
			</form>
			<div className={styles["sign-in-link"]}>
				<Link legacyBehavior href="/">
					<a>¿Ya tienes una cuenta? Inicia Sesión</a>
				</Link>
			</div>
			<Footer />
		</div>
	);
};

export default Registro;

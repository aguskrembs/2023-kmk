"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import validator from "validator";
import { HeaderSlim, Footer } from "../components/header";

const Registro = () => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [specialties, setSpecialties] = useState([]);
    const [especialidad, setEspecialidad] = useState("");
    const [numeroMatricula, setNumeroMatricula] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState("patient");
    const [birth_date, setBirthDate] = useState("");
    const [genders, setGenders] = useState([]);
    const [gender, setGender] = useState("");
    const [blood_types, setBloodTypes] = useState([]);
    const [blood_type, setBloodType] = useState("");
    const router = useRouter();

    const validate = (value) => {
        if (
            validator.isStrongPassword(value, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0,
            })
        ) {
            setError("");
        } else {
            setError(
                "La contraseña no es lo suficientemente fuerte: debe incluir al menos 8 caracteres, 1 minúscula, 1 mayúscula y 1 número"
            );
        }
    };

    useEffect(() => {
        const fetchSpecialties = async () => {
            const response = await axios.get(
                `http://localhost:8080/specialties`
            );
            console.log(response.data.specialties);
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        };

        fetchSpecialties();
    }, []);

    useEffect(() => {
        const fetchGenders = async () => {
            const response = await axios.get(`http://localhost:8080/genders`);
            console.log(response.data.genders);
            response.data.genders == undefined
                ? setGenders([])
                : setGenders(response.data.genders);
        };

        fetchGenders();
    }, []);

    useEffect(() => {
        const fetchBloodTypes = async () => {
            const response = await axios.get(
                `http://localhost:8080/blood-types`
            );
            console.log(response.data.blood_types);
            response.data.blood_types == undefined
                ? setBloodTypes([])
                : setBloodTypes(response.data.blood_types);
        };

        fetchBloodTypes();
    }, []);

    const handleLogoClick = () => {
        router.push("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let userData = {
            name: nombre,
            last_name: apellido,
            email,
            password,
            role,
            gender,
            blood_type,
            birth_date,
        };

        if (role === "physician")
            userData = {
                ...userData,
                tuition: numeroMatricula,
                specialty: especialidad,
            };

        try {
            const response = await axios.post(
                `http://localhost:8080/users/register`,
                userData
            );
            console.log(response.data);
            if (response.data) {
                console.log("Registro exitoso");
                alert("Se ha registrado exitosamente");
                router.push("/");
            }
        } catch (error) {
            console.error(error);
            setError("Error al registrarse: " + error.response.data.detail);

            // Verificar si el elemento .error-message está presente en el DOM
            const errorMessageElement =
                document.querySelector(".error-message");
            if (errorMessageElement) {
                errorMessageElement.style.visibility = "visible"; // Muestra el mensaje de error
            }
            console.error(error);
        }
    };

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
                                        {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                <div className={styles["form-group"]}>
                    <label htmlFor="birth_date">Fecha de Nacimiento</label>
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
                        <option value="">Selecciona tu grupo sanguíneo</option>
                        {blood_types.map((blood_type) => (
                            <option key={blood_type} value={blood_type}>
                                {blood_type}
                            </option>
                        ))}
                    </select>
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
                <div className={styles["form-group"]}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            validate(e.target.value);
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
                            validate(e.target.value);
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
                    className={`${styles["button"]} ${
                        password !== confirmPassword || error
                            ? styles["disabled-button"]
                            : ""
                    }`}
                    disabled={password !== confirmPassword || error}
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
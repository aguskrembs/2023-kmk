"use client";

import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto"; // NO BORRAR
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../../components/header";
import { toast } from "react-toastify";

const PhysicianPendingAppointments = () => {
	const [metrics, setMetrics] = useState({});

	const apiURL = process.env.NEXT_PUBLIC_API_URL;

	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	const fetchMetrics = async () => {
		try {
			const response = await axios.get(`${apiURL}dashboard/physician`, {
				httpsAgent: agent,
			});
			response.data.dashboard_metrics == undefined
				? setMetrics({})
				: setMetrics(response.data.dashboard_metrics);
		} catch (error) {
			console.error(error);
			toast.error("Error al cargar las métricas");
		}
	};

	useEffect(() => {
		axios.defaults.headers.common = {
			Authorization: `bearer ${localStorage.getItem("token")}`,
		};
		fetchMetrics();
	}, []);

	return (
		<div className={styles.dashboard}>
			<PhysicianTabBar highlight={"Metricas"} />

			<Header role="physician" />

			<div className={styles["tab-content"]}></div>

			{metrics.all_appointments ? (
				<div>
					<div className={styles["title"]}>Turnos por mes</div>
					<div>
						<Bar
							data={{
								labels: Object.keys(metrics.all_appointments),
								datasets: [
									{
										label: "Cantidad de turnos",
										data: Object.values(
											metrics.all_appointments
										),
										backgroundColor: ["red"],
										borderWidth: 0,
									},
								],
							}}
							height={300}
							width={500}
							options={{
								maintainAspectRatio: false,
							}}
						/>
					</div>
				</div>
			) : null}

			{metrics.updated_appointments ? (
				<div>
					<div className={styles["title"]}>
						Turnos cambiados por mes
					</div>
					<div>
						<Bar
							data={{
								labels: Object.keys(
									metrics.updated_appointments
								),
								datasets: [
									{
										label: "Cantidad de turnos cambiados",
										data: Object.values(
											metrics.updated_appointments
										),
										backgroundColor: ["red"],
										borderWidth: 0,
									},
								],
							}}
							height={300}
							width={500}
							options={{
								maintainAspectRatio: false,
							}}
						/>
					</div>
				</div>
			) : null}

			<Footer />
		</div>
	);
};

export default PhysicianPendingAppointments;

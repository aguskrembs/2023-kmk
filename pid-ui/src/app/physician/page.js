import React from "react";
import styles from "../styles/styles.module.css";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import { PhysicianProvider } from "./physicianContext";
import { PendingAppointmentsCard } from "./components/PendingAppointmentsCard";
import { ApprovedAppointmentsCard } from "./components/ApprovedAppointmentsCard";

const PhysicianAgenda = () => {
	return (
		<PhysicianProvider>
			<div className={styles.dashboard}>
				<PhysicianTabBar highlight={"TurnosDelDia"} />

				<Header role="physician" />

				<div className={styles["tab-content"]}>
					<ApprovedAppointmentsCard />
					<PendingAppointmentsCard />
				</div>

				<Footer />
			</div>
		</PhysicianProvider>
	);
};

export default PhysicianAgenda;

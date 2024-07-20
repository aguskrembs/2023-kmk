import React from "react";
import styles from "@/app/styles/styles.module.css";
import { Header, Footer, PhysicianTabBar } from "@/app/components/header";
import { PhysicianProvider } from "../physicianContext";
import { MedsCard } from "../components/MedsCard";

const PhysicianAgenda = () => {
	return (
		<PhysicianProvider>
			<div className={styles.dashboard}>
				<PhysicianTabBar highlight={"Medicamentos"} />

				<Header role="physician" />

				<div className={styles["tab-content"]}>
					<MedsCard />
				</div>

				<Footer />
			</div>
		</PhysicianProvider>
	);
};

export default PhysicianAgenda;

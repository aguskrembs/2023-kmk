"use client";

import React, { createContext, useState, useContext } from "react";

const PhysiscianContext = createContext();

export const PhysicianProvider = ({ children }) => {
	const [appointments, setAppointments] = useState([]);
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [meds, setMeds] = useState([
		{ id: 1, name: "Ibupirac", drug: "Ibuprofeno", presentation: "200mg" },
		{ id: 2, name: "Tafirol", drug: "Paracetamol", presentation: "500mg" },
		{ id: 3, name: "Amoxidal", drug: "Amoxicilina", presentation: "500mg" },
		{ id: 4, name: "Clonagin", drug: "Clonazepam", presentation: "5mg" },
	]);

	return (
		<PhysiscianContext.Provider
			value={{
				appointments,
				setAppointments,
				pendingAppointments,
				setPendingAppointments,
				meds,
				setMeds,
			}}
		>
			{children}
		</PhysiscianContext.Provider>
	);
};

export const usePhysician = () => useContext(PhysiscianContext);

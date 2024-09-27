"use client";

import React, { createContext, useState, useContext } from "react";

const PhysiscianContext = createContext();

export const PhysicianProvider = ({ children }) => {
	const [appointments, setAppointments] = useState([]);
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [meds, setMeds] = useState([]);

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

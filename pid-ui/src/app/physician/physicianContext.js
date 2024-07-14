"use client";

import React, { createContext, useState, useContext } from "react";

const PhysiscianContext = createContext();

export const PhysicianProvider = ({ children }) => {
	const [appointments, setAppointments] = useState([]);
	const [pendingAppointments, setPendingAppointments] = useState([]);

	return (
		<PhysiscianContext.Provider
			value={{
				appointments,
				setAppointments,
				pendingAppointments,
				setPendingAppointments,
			}}
		>
			{children}
		</PhysiscianContext.Provider>
	);
};

export const usePhysician = () => useContext(PhysiscianContext);

import validator from "validator";

export const validatePassword = (value) =>
	validator.isStrongPassword(value, {
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 0,
	})
		? ""
		: "La contraseña no es lo suficientemente fuerte: debe incluir al menos 8 caracteres, 1 minúscula, 1 mayúscula y 1 número";

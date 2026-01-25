/**
 * Valida un número de DNI
 * @param dni El número de DNI a validar
 */
export const DNI_REGEX = /^[0-9]{8}$/;

/**
 * Valida un número de RUC
 * @param ruc El número de RUC a validar
 */
export const RUC_REGEX = /^(10|20)[0-9]{9}$/;

/**
 * Valida un número de carnet extranjero
 * @param carnet El número de carnet extranjero a validar
 */
export const CARNET_EXTRANJERO1_REGEX = /^[PEpe][0-9]{8}$/i;

/**
 * Valida un número de carnet extranjero
 * @param carnet El número de carnet extranjero a validar
 */
export const CARNET_EXTRANJERO2_REGEX = /^[A-Za-z]{1,2}[0-9]{6,9}$/;

/**
 * Valida una contraseña
 * @param password La contraseña a validar
 */
export const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Valida un color en formato hexadecimal, RGB o HSL
 * @param color El color a validar
 */
export const COLOR_REGEX =
	/^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(rgb|hsl)a?\(\s*((\d{1,3}%?\s*,\s*){2}\d{1,3}%?|\d{1,3}%?\s+\d{1,3}%?\s+\d{1,3}%?)(\s*,\s*[01]?\.?\d+)?\s*\))$/;

/**
 * Valida un SVG
 * @param svg El SVG a validar
 */
export const SVG_REGEX = /<\s*svg\b/i;

/**
 * Valida un número positivo
 * @param number El número a validar
 */
export const POSIVES_NUMERIC_REGEX = /^\d+$/;

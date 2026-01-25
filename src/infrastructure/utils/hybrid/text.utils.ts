/**
 * Elimina el contenido HTML de una cadena
 * @param value La cadena que contiene HTML
 * @returns La cadena sin HTML
 */
export function removeTextHTML(value: string) {
	return value.replace(/(<([^>]+)>)/gi, "");
}

/**
 * Normaliza un texto para hacerlo compatible con nombres de archivo:
 * - Elimina tildes y caracteres diacríticos
 * - Reemplaza espacios con guiones
 * - Elimina caracteres especiales no permitidos
 * - Convierte a minúsculas (opcional)
 *
 * @param texto El texto a normalizar
 * @param convertirMinusculas Si se convierte todo a minúsculas (true por defecto)
 * @returns El texto normalizado
 */
export function slugify(texto: string, convertirMinusculas = true): string {
	// Paso 1: Eliminar tildes y diacríticos
	let normalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	// Paso 2: Reemplazar espacios y guiones bajos con un solo guion
	normalizado = normalizado.replace(/[\s_]+/g, "-");
	// Paso 3: Eliminar caracteres especiales no permitidos (excepto guiones y puntos)
	normalizado = normalizado.replace(/[^a-zA-Z0-9\-.]/g, "");
	// Paso 4: Eliminar múltiples guiones consecutivos
	normalizado = normalizado.replace(/-+/g, "-");
	// Paso 5: Eliminar guiones al inicio y final
	normalizado = normalizado.replace(/^-+|-+$/g, "");

	// Opcional: Convertir a minúsculas
	if (convertirMinusculas) {
		normalizado = normalizado.toLowerCase();
	}
	return normalizado;
}

/**
 * Convierte un número a romano
 * @param num El número a convertir
 */
export function numeroARomano(num: number): string {
	if (typeof num !== "number" || num < 1 || num > 3999) {
		throw new Error("El número debe estar entre 1 y 3999");
	}

	const valores: [number, string][] = [
		[1000, "M"],
		[900, "CM"],
		[500, "D"],
		[400, "CD"],
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"],
	];

	let romano = "";
	let resto = num;

	for (const [valor, simbolo] of valores) {
		while (resto >= valor) {
			romano += simbolo;
			resto -= valor;
		}
	}

	return romano;
}

export function capitalize(str: string) {
	if (typeof str !== "string" || str.length === 0) {
		return str; // Devuelve el valor original si no es string o está vacío
	}
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

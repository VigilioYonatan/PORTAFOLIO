export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.normalize("NFD") // Separa los acentos de las letras
		.replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
		.replace(/\s+/g, "-") // Reemplaza espacios con guiones
		.replace(/[^\w-]+/g, "") // Elimina caracteres no alfanuméricos
		.replace(/--+/g, "-") // Reemplaza múltiples guiones con uno solo
		.replace(/^-+/, "") // Elimina guiones al inicio
		.replace(/-+$/, ""); // Elimina guiones al final
}

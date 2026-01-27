/**
 * Sanitiza el input del usuario para prevenir Prompt Injection y otros ataques.
 * Remover caracteres de control, bloques de código excesivos, y etiquetas de instrucción.
 */
export function sanitizeInput(input: string): string {
	if (!input) return "";

	return (
		input
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
			.replace(/\[INST\]|\[\/INST\]/gi, "") // Remove common instruction tags
			.replace(/<\|im_start\|>|<\|im_end\|>/gi, "") // Remove special tokens
			.trim()
			.slice(0, 2000)
	); // Enforce max length
}

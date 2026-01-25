/**
 * Genera un retraso en la ejecución de una función
 * @param seg El número de segundos para el retraso
 * @returns Una promesa que se resuelve después del retraso
 */
export async function delay(seg = 10) {
	return new Promise((res) => setTimeout(() => res(true), seg * 1000));
}

/**
 * Genera un número aleatorio entre dos valores
 * @param start El valor mínimo
 * @param end El valor máximo
 * @returns Un número aleatorio entre start y end
 */
export function randomNumber(start: number, end: number) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
}

/**
 * Genera un ID único
 * @returns Un string que representa un ID único
 */
export function generateId() {
	return Math.random().toString(32) + Date.now().toString(32);
}

/**
 * Genera un ID aleatorio
 */
export function randomId() {
	return Math.random().toString(32) + Date.now().toString(32);
}

import dayjs from "@infrastructure/utils/hybrid";
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

interface UseCronometroProps {
	fechaInicio: Date;
	minutosTotales?: number;
}

function useCronometro({
	fechaInicio,
	minutosTotales = 60,
}: UseCronometroProps) {
	const estaActivo = useSignal(true);
	const intervaloRef = useRef<NodeJS.Timeout | null>(null);
	const tiempoTranscurrido = useSignal(0);

	// Función para calcular tiempo restante CORREGIDA
	function calcularTiempoRestante() {
		const ahora = dayjs();
		const fechaInicioDayjs = dayjs(fechaInicio);

		// Calcular diferencia en segundos directamente
		const segundosTranscurridos = ahora.diff(fechaInicioDayjs, "seconds");
		const segundosTotales = minutosTotales * 60;

		return Math.max(0, segundosTotales - segundosTranscurridos);
	}

	useEffect(() => {
		if (!estaActivo.value) return;

		// Inicializar con el tiempo actual
		tiempoTranscurrido.value = calcularTiempoRestante();

		intervaloRef.current = setInterval(() => {
			const tiempoRestante = calcularTiempoRestante();
			tiempoTranscurrido.value = tiempoRestante;

			if (tiempoRestante <= 0) {
				estaActivo.value = false;
				if (intervaloRef.current) {
					clearInterval(intervaloRef.current);
					intervaloRef.current = null;
				}
			}
		}, 1000);

		return () => {
			if (intervaloRef.current) {
				clearInterval(intervaloRef.current);
				intervaloRef.current = null;
			}
		};
	}, [estaActivo.value, fechaInicio, minutosTotales]);

	// Calcular porcentaje completado
	const porcentajeCompletado =
		tiempoTranscurrido.value > 0
			? ((minutosTotales * 60 - tiempoTranscurrido.value) /
					(minutosTotales * 60)) *
				100
			: 100;

	const estaCompletado = tiempoTranscurrido.value <= 0;

	return {
		tiempoTranscurrido: tiempoTranscurrido.value,
		porcentajeCompletado,
		estaActivo: estaActivo.value,
		estaCompletado,
		// Funciones para controlar el cronómetro
		pausar: () => {
			estaActivo.value = false;
			if (intervaloRef.current) {
				clearInterval(intervaloRef.current);
				intervaloRef.current = null;
			}
		},
		reanudar: () => {
			estaActivo.value = true;
		},
		reiniciar: () => {
			estaActivo.value = true;
			tiempoTranscurrido.value = minutosTotales * 60;
		},
	};
}
export function hasMinutesPassed(
	minutes: number,
	targetDate: Date | string,
): { passed: boolean; percent: number; minutesDifference: number } {
	// Convertir la fecha objetivo a objeto Dayjs
	const targetDayjs = dayjs(targetDate);

	// Obtener la fecha actual
	const now = dayjs();

	// Calcular la diferencia en minutos
	const minutesDifference = now.diff(targetDayjs, "minute");

	// Calcular porcentaje (0% si aún no empieza, 100% si ya pasó de largo)
	let percent = (minutesDifference / minutes) * 100;

	// Limitar entre 0% y 100%
	if (percent < 0) percent = 0;
	if (percent > 100) percent = 100;

	return {
		passed: minutesDifference >= minutes,
		percent,
		minutesDifference,
	};
}
export default useCronometro;

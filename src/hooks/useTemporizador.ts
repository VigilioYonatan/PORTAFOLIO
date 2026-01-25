import dayjs from "@infrastructure/utils/hybrid";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface TemporizadorRegresivoProps {
	initialTime: number;
}
/* initialTime: miliseconds  */
function useTemporizador({ initialTime }: TemporizadorRegresivoProps) {
	const timeLeft = useSignal<number>(initialTime);

	useEffect(() => {
		const interval = setInterval(() => {
			timeLeft.value = timeLeft.value - 1000;
		}, 1000);

		// Limpiar el intervalo cuando el componente se desmonte o el tiempo llegue a cero
		if (timeLeft.value <= 0) {
			clearInterval(interval);
		}

		// Devolver la función de limpieza para que se ejecute cuando el componente se desmonte
		return () => clearInterval(interval);
	}, [timeLeft]);

	const days = Math.floor(dayjs.duration(timeLeft.value).asDays());
	const hours = Math.floor(dayjs.duration(timeLeft.value).asHours()) % 24;
	const minutes = Math.floor(dayjs.duration(timeLeft.value).asMinutes()) % 60;
	const seconds = Math.floor(dayjs.duration(timeLeft.value).asSeconds()) % 60;

	return `${days > 0 && `${days} día${days > 1 ? "s" : ""} `}
            ${hours.toString().padStart(2, "0")}:
            ${minutes.toString().padStart(2, "0")}:
            ${seconds.toString().padStart(2, "0")}
    `;
}

export default useTemporizador;

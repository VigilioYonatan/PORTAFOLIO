import { useSignal } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";

export interface Tooltip {
	color: string;
	result: {
		date: Date;
		tooltip: JSX.Element | JSX.Element[];
	}[];
}

export interface CalendarProps {
	changeMonth?: boolean;
	showTitle?: boolean;
	language?: "es" | "en";
	onPickDate?: (day: string | number, month: number, year: number) => void;
	initialDate?: Date;
	finalDate?: Date;
	custom?: (
		day: string | number,
		month: number,
		year: number,
	) => JSX.Element | JSX.Element[];
	onNextMonth?: (year: number, month: number) => void;
	onPreviousMonth?: (year: number, month: number) => void;
	image?: string;
	tooltip?: Tooltip[];
	isLoading?: boolean;
}

export function useCalendar({
	initialDate = new Date(),
	language = "es",
	onPreviousMonth,
	onNextMonth,
	finalDate,
	onPickDate,
}: CalendarProps) {
	const date = useSignal<Date>(initialDate);

	const daysOfWeek: string[] =
		language === "es"
			? ["L", "M", "Mi", "J", "V", "S", "D"]
			: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	const months: string[] =
		language === "es"
			? [
					"Enero",
					"Febrero",
					"Marzo",
					"Abril",
					"Mayo",
					"Junio",
					"Julio",
					"Agosto",
					"Septiembre",
					"Octubre",
					"Noviembre",
					"Diciembre",
				]
			: [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December",
				];

	function previousMonth(): void {
		const newDate = new Date(
			date.value.getFullYear(),
			date.value.getMonth() - 1,
			1,
		);
		date.value = newDate;
		if (onPreviousMonth) {
			onPreviousMonth(date.value.getFullYear(), date.value.getMonth() - 1);
		}
	}

	function nextMonth(): void {
		const newDate = new Date(
			date.value.getFullYear(),
			date.value.getMonth() + 1,
			1,
		);
		if (finalDate && newDate > finalDate) return;
		date.value = newDate;
		if (onNextMonth) {
			onNextMonth(date.value.getFullYear(), date.value.getMonth() + 1);
		}
	}

	function chooseDay(day: number) {
		const newDate = new Date(
			date.value.getFullYear(),
			date.value.getMonth(),
			day,
		);
		if (finalDate && newDate > finalDate) return;
		date.value = newDate;
		if (onPickDate) {
			onPickDate(day, date.value.getMonth(), date.value.getFullYear());
		}
	}

	function renderDays(): (number | string)[] {
		const firstDayOfMonth: number = new Date(
			date.value.getFullYear(),
			date.value.getMonth(),
			1,
		).getDay();
		const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
		const daysInMonth: number = new Date(
			date.value.getFullYear(),
			date.value.getMonth() + 1,
			0,
		).getDate();
		const days: (number | string)[] = [];

		for (let i = 0; i < adjustedFirstDay; i++) {
			days.push("");
		}

		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}

		return days;
	}

	const isNextMonthDisabled = finalDate
		? new Date(date.value.getFullYear(), date.value.getMonth() + 1, 1) >
			finalDate
		: false;

	return {
		date: date.value,
		daysOfWeek,
		months,
		previousMonth,
		nextMonth,
		chooseDay,
		renderDays,
		isNextMonthDisabled,
	};
}

import { useSignal } from "@preact/signals";
import { useContext, useEffect, useRef } from "preact/hooks";
import {
	type FieldValues,
	type Path,
	type PathValue,
	type UseFormReturn,
} from "react-hook-form";
import { FormControlContext } from "../../form";
import type { FormColorProps } from "../types";

export type FormColorMode = "palette" | "picker";

export function useFormColor<T extends object>(props: FormColorProps<T>) {
	const { name, popupPosition = "bottom" } = props;
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);

	const isOpen = useSignal<boolean>(false);
	const customColor = useSignal<string>("#000000");
	const mode = useSignal<FormColorMode>("palette");
	const popupRef = useRef<HTMLDivElement>(null);

	const currentValue = watch(name);

	useEffect(() => {
		if (currentValue) {
			customColor.value = currentValue as unknown as string;
		}
	}, [currentValue]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				isOpen.value = false;
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleColorChange = (color: string) => {
		customColor.value = color;
		setValue(name, color as PathValue<T, Path<T>>, {
			shouldValidate: true,
		});
	};

	const getPopupPosition = () => {
		if (popupPosition === "right") {
			return { left: "100%", top: 0, marginLeft: "8px" };
		}
		return { top: "100%", left: 0, marginTop: "8px" };
	};

	const toggleOpen = () => {
		isOpen.value = !isOpen.value;
	};

	return {
		isOpen: isOpen.value,
		toggleOpen,
		customColor: customColor.value,
		mode: mode.value,
		setMode: (newMode: "palette" | "picker") => {
			mode.value = newMode;
		},
		popupRef,
		handleColorChange,
		getPopupPosition,
		register,
		watch,
		errors,
		currentValue,
	};
}

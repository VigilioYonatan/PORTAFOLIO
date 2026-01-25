import { sweetModal } from "@vigilio/sweet";
import {
	type FieldValues,
	type Path,
	type UseFormReturn,
} from "react-hook-form";

export function handlerError<T extends FieldValues>(
	form: UseFormReturn<T>,
	error: any,
	title = "Error",
) {
	if (error?.body) {
		form.setError(error.body as Path<T>, {
			message: error.message,
		});
	} else {
		sweetModal({
			icon: "danger",
			title,
			text: error.message || "An unexpected error occurred",
		});
	}
}

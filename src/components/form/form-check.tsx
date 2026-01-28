import { useContext } from "preact/hooks";
import type {
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { FormControlContext } from "./form-component";

export interface FormCheckProps<T extends object> {
	title: string;
	subtitle: string;
	name: Path<T>;
	options?: RegisterOptions<T, Path<T>>;
}
export function FormCheck<T extends object>({
	name,
	title,
	subtitle,
}: FormCheckProps<T>) {
	const { watch, setValue } =
		useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const value = watch(name as unknown as Path<T>);

	const nameId = `${name}-${Math.random().toString()}`;

	const toggleValue = () => {
		setValue(name as unknown as Path<T>, !value as PathValue<T, Path<T>>);
	};

	return (
		<div class="flex items-center justify-between p-4 border border-input rounded-[var(--radius-lg)] hover:border-primary/50 transition-colors bg-card">
			<label htmlFor={nameId} class="cursor-pointer flex-1">
				<p class="font-semibold text-foreground text-sm">{title}</p>
				{subtitle && (
					<p class="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
				)}
			</label>
			<input
				id={nameId}
				type="checkbox"
				name={name as string}
				checked={value}
				onChange={toggleValue}
				class="min-w-5 min-h-5 rounded-[var(--radius-sm)] cursor-pointer accent-primary border-input"
			/>
		</div>
	);
}

// export default FormCheck;

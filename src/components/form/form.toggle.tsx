import { sizeIcon } from "@infrastructure/utils/client";
import { type Signal } from "@preact/signals";
import { CircleHelp, Eye, EyeOff } from "lucide-preact";
import { useContext } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type {
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./form";

export interface FormToggleProps<T extends object>
	extends Omit<JSX.IntrinsicElements["input"], "type" | "name"> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	ico?: JSX.Element | JSX.Element[];
	isEye?: boolean;
	required?: boolean;
}

export function FormToggle<T extends object>({
	name,
	title,
	question,
	isEye = false,
	required = false,
	...rest
}: FormToggleProps<T>) {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const value = watch(name as unknown as Path<T>);

	const err = anidarPropiedades(errors, (name as string).split("."));
	const nameId = `${name}-${Math.random().toString()}`;

	const toggleValue = () => {
		setValue(name as unknown as Path<T>, !value as PathValue<T, Path<T>>);
	};

	return (
		<div class="w-full space-y-2">
			{title.length ? (
				<label
					class="block text-sm font-semibold text-foreground"
					htmlFor={nameId}
				>
					{title}
					{required ? <span class="text-primary">*</span> : ""}
				</label>
			) : null}
			<div class="flex items-center gap-2">
				<div class="w-full h-auto flex items-center gap-2 text-xs rounded-[var(--radius-lg)] overflow-hidden my-1">
					{isEye ? (
						<button
							type="button"
							onClick={toggleValue}
							class="p-2 focus:outline-none"
						>
							{value ? (
								<Eye {...sizeIcon.medium} class="text-primary" />
							) : (
								<EyeOff {...sizeIcon.medium} class="text-muted-foreground" />
							)}
						</button>
					) : (
						// Renderizar toggle por defecto
						<>
							<input
								type="checkbox"
								id={nameId}
								{...rest}
								checked={value}
								{...register(name as unknown as Path<T>)}
								class="hidden"
							/>
							<label
								htmlFor={nameId}
								class={`relative border border-border inline-flex items-center cursor-pointer w-16 h-8 rounded-[var(--radius-lg)] transition-all duration-300 ${
									value ? "bg-primary" : "bg-accent"
								}`}
							>
								<span
									class={`absolute block w-8 h-8 bg-white rounded-[var(--radius-lg)] transition-transform duration-300 transform ${
										value ? "translate-x-7" : "translate-x-0"
									}`}
								/>
							</label>
						</>
					)}
				</div>

				{question ? (
					<div class="relative group ">
						<div class="rounded-[var(--radius-lg)] shadow-lg p-1 bg-primary fill-primary-foreground">
							<CircleHelp {...sizeIcon.small} class="text-primary-foreground" />
						</div>
						<div class="shadow-xl text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1 text-center absolute rounded-[var(--radius-lg)] bg-popover z-10 font-semibold text-popover-foreground">
							{question}
						</div>
					</div>
				) : null}
			</div>

			{Object.keys(err).length ? (
				<p class="text-xs text-destructive">{err?.message}</p>
			) : null}
		</div>
	);
}

interface FormToggleCustomProps {
	title: string;
	value: Signal<boolean>;
	index?: number;
	onChange?: (value: boolean) => void;
	isEye?: boolean;
}
export function FormToggleCustom({
	title,
	value,
	index,
	onChange,
	isEye = false,
}: FormToggleCustomProps) {
	const nameId = `${title}-${index ?? Date.now().toString()}`;

	const toggleValue = () => {
		const newValue = !value.value;
		value.value = newValue;
		if (onChange) {
			onChange?.(newValue);
		}
	};

	return (
		<div class="w-full mb-2">
			<label
				class="text-sm text-foreground capitalize font-bold"
				htmlFor={nameId}
			>
				{title}
			</label>
			<div class="flex items-center gap-2">
				<div class="w-full h-10 flex items-center gap-2 text-xs rounded-[var(--radius-lg)] overflow-hidden text-foreground bg-muted my-1">
					{isEye ? (
						// Renderizar icono de ojo cuando isEye es true
						<button
							type="button"
							onClick={toggleValue}
							class="p-2 focus:outline-none"
							aria-label={value.value ? "Ocultar" : "Mostrar"}
						>
							{value.value ? (
								<Eye {...sizeIcon.medium} class="text-primary" />
							) : (
								<EyeOff {...sizeIcon.medium} class="text-muted-foreground" />
							)}
						</button>
					) : (
						// Renderizar toggle por defecto
						<>
							<input
								type="checkbox"
								id={nameId}
								checked={value.value}
								class="hidden"
								onChange={(e) => {
									value.value = (e.target as HTMLInputElement).checked;
									if (onChange) {
										onChange?.(value.value);
									}
								}}
							/>
							<label
								htmlFor={nameId}
								class={`relative inline-flex items-center cursor-pointer w-16 h-8 rounded-[var(--radius-lg)] transition-all duration-300 ${
									value.value ? "bg-primary" : "bg-muted"
								}`}
							>
								<span
									class={`absolute block w-8 h-8 bg-white rounded-[var(--radius-lg)] transition-transform duration-300 transform ${
										value.value ? "translate-x-8" : "translate-x-0"
									}`}
								/>
							</label>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default FormToggle;

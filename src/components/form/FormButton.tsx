import { cn, normalizarText, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { Search } from "lucide-preact";
import type { JSX } from "preact";
import { useContext } from "preact/hooks";
import type {
	FieldValues,
	Path,
	PathValue,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./Form";

export interface FormButtonProps<T extends object> {
	title: string;
	name: Path<T>;
	required?: boolean;
	values: { key: unknown; name?: string }[];
	showButtonSearch?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: false positive
	icon: (props: any, isSelected: boolean) => JSX.Element;
	containerClassName?: string;
}

export function FormButton<T extends object>({
	name,
	title,
	required,
	values,
	showButtonSearch,
	icon: Icon,
	containerClassName = "grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[300px] min-h-[40px]  p-2",
}: FormButtonProps<T>) {
	const {
		formState: { errors },
		setValue,
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const isOpenIconStore = useSignal<boolean>(false);
	const arrayButtons = useSignal(values);

	const err = anidarPropiedades(errors, (name as unknown as string).split("."));

	return (
		<div class="space-y-2 w-full">
			{title && (
				<label
					htmlFor={name as string}
					class="block text-sm font-bold text-foreground"
				>
					{title}
					{required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class={cn("relative ", containerClassName)}>
				{showButtonSearch && (
					<div class="absolute top-0 right-10 flex flex-row! gap-2 items-center p-2 group ">
						<button
							type="button"
							class="fill-primary opacity-60 hover:opacity-100 transition-all duration-200"
							onClick={() => {
								isOpenIconStore.value = true;
							}}
						>
							<Search {...sizeIcon.medium} />
						</button>

						<input
							type="text"
							class="outline-none hidden group-hover:block "
							onChange={(e) => {
								const value = (e.target as HTMLInputElement).value;
								arrayButtons.value = values.filter((icon) =>
									normalizarText(icon.name || "").includes(
										normalizarText(value),
									),
								);
							}}
							placeholder="Buscar..."
						/>
					</div>
				)}

				{arrayButtons.value.map((icon) => {
					const isSelected = watch(name) === icon.key; // <-- suponiendo que tienes un estado de selección
					return (
						<button
							key={String(icon.key)}
							type="button"
							class={cn(
								"flex flex-col items-center justify-center w-full h-16 rounded-[var(--radius-lg)] border text-center transition-all duration-200 p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
								isSelected
									? "border-primary bg-primary/10 shadow-sm"
									: "border-transparent bg-muted/30 hover:bg-muted hover:border-primary/30 hover:shadow-sm",
							)}
							onClick={() => {
								setValue(name, icon.key as PathValue<T, Path<T>>);
							}}
						>
							<Icon props={icon} isSelected={isSelected} />
						</button>
					);
				})}
			</div>

			{Object.keys(err).length ? (
				<p class="text-sm text-destructive flex items-center gap-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

// export default FormButton;

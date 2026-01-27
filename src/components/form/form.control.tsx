import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { CircleHelp } from "lucide-preact";
import type { JSX } from "preact";
import { useContext } from "preact/hooks";
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./Form";

export interface FormControlProps<T extends object>
	extends Omit<JSX.IntrinsicElements["input"], "type" | "name"> {
	title: string;
	name: Path<T>;
	type?: HTMLInputElement["type"];
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	ico?: JSX.Element | JSX.Element[];
}

export function FormControl<T extends object>({
	name,
	title,
	type = "text",
	question,
	options = {},
	ico,
	className,
	...rest
}: FormControlProps<T>) {
	const {
		register,
		formState: { errors },
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const hidden = useSignal<boolean>(true);
	const isFocused = useSignal<boolean>(false);

	const err = anidarPropiedades(errors, (name as unknown as string).split("."));
	const isPassword = type === "password";
	const inputType = isPassword && !hidden.value ? "text" : type;
	const nameId = `${name}-${Math.random().toString(32)}`;
	return (
		<div class="space-y-1.5 w-full">
			{title && (
				<label
					htmlFor={nameId as string}
					class="block text-sm font-semibold text-foreground"
				>
					{title}
					{rest.required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative flex gap-2">
				{ico && (
					<div
						class={cn(
							"absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground  rounded-l-(--radius-lg)  z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-foreground",
						)}
					>
						{ico}
					</div>
				)}
				<input
					class={cn(
						"w-full  py-2 border border-input rounded-(--radius-lg) text-foreground placeholder-muted-foreground",
						"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
						"transition-all duration-200",
						"backdrop-blur-sm",
						isFocused.value && "bg-accent/50",
						!!Object.keys(err).length &&
							"border-destructive! !focus:ring-destructive/20 !focus:border-destructive",
						rest.disabled && "cursor-not-allowed  bg-card-foreground",
						ico && "pl-12",
						ico ? "pr-6" : "px-4",
						className as string,
					)}
					id={nameId as string}
					type={inputType}
					autoComplete="off"
					onFocus={() => {
						isFocused.value = true;
					}}
					{...rest}
					{...register(name as unknown as Path<T>, options)}
					onBlur={() => {
						isFocused.value = false;
					}}
				/>
				{question && (
					<div class="relative group  self-center">
						<div class="rounded-full shadow-lg p-1 bg-primary fill-primary-foreground">
							<CircleHelp {...sizeIcon.small} class="text-primary-foreground" />
						</div>
						<div class="shadow-xl text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1  text-center absolute rounded-(--radius-lg) bg-popover   z-10 font-semibold text-popover-foreground">
							{question}
						</div>
					</div>
				)}
			</div>

			{Object.keys(err).length ? (
				<p class="text-sm text-destructive flex items-center gap-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

export default FormControl;

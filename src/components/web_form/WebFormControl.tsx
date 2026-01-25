import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { CircleHelp, Eye, EyeOff } from "lucide-preact";
import type { JSX } from "preact";
import { useContext } from "preact/hooks";
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from "./utils";
import { FormControlContext } from "./WebForm";

export interface WebFormControlProps<T extends object>
	extends Omit<JSX.IntrinsicElements["input"], "type" | "name"> {
	title?: string | JSX.Element | JSX.Element[];
	name: Path<T>;
	type?: HTMLInputElement["type"];
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	ico?: JSX.Element;
	"data-testid"?: string;
}

function WebFormControl<T extends object>({
	name,
	title,
	type = "text",
	question,
	options = {},
	className,
	ico,
	...rest
}: WebFormControlProps<T>) {
	const {
		register,
		formState: { errors },
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const hidden = useSignal<boolean>(true);
	const isFocused = useSignal<boolean>(false);

	function onChangeHidde() {
		hidden.value = !hidden.value;
	}

	const err = anidarPropiedades(errors, (name as unknown as string).split("."));
	const isPassword = type === "password";
	const inputType = isPassword && !hidden.value ? "text" : type;
	const nameId = `${name}-${Math.random().toString(32)}`;
	return (
		<div class="flex flex-col gap-1 w-full">
			{title && (
				<label htmlFor={nameId as string} class="text-sm font-bold">
					{title}
					{rest.required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative flex gap-1 items-center">
				{ico && (
					<div class="absolute left-4 z-10 text-zinc-500 transition-colors group-focus-within:text-primary">
						{ico}
					</div>
				)}
				<input
					class={cn(
						"border border-zinc-800 bg-zinc-900/40 text-sm rounded-none py-3 px-4 w-full text-foreground caret-primary placeholder:text-zinc-600 transition-all focus:bg-zinc-900/60 focus:ring-1 focus:ring-primary/40 focus:border-primary outline-none whitespace-nowrap overflow-hidden text-ellipsis",
						ico && "pl-11",
						isFocused.value && "bg-zinc-900 ring-2 ring-primary/20",
						!!Object.keys(err).length &&
							"border-destructive/50! focus:ring-destructive/20! focus:border-destructive!",
						rest.disabled && "opacity-50 cursor-not-allowed bg-muted/30",
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

				{isPassword && (
					<button
						type="button"
						onClick={onChangeHidde}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						{hidden.value ? (
							<EyeOff {...sizeIcon.small} />
						) : (
							<Eye {...sizeIcon.small} />
						)}
					</button>
				)}

				{question && (
					<div className="relative group self-center ml-2">
						<div className="rounded-full shadow-lg p-1 bg-primary fill-white">
							<CircleHelp class="w-[12px] h-[12px]" />
						</div>
						<div className="shadow-xl text-[10px] min-w-[150px] hidden group-hover:block -top-12 right-0 p-3 text-center absolute rounded-xl bg-zinc-900 border border-zinc-800 z-50 font-bold text-white whitespace-normal">
							{question}
						</div>
					</div>
				)}
			</div>

			{Object.keys(err).length ? (
				<p className="text-sm text-destructive flex items-center gap-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

export default WebFormControl;

import { cn } from "@infrastructure/utils/client";
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
import { anidarPropiedades } from "./utils";
import { FormControlContext } from "./web-form";

export interface WebFormAreaProps<T extends object>
	extends Omit<JSX.IntrinsicElements["textarea"], "name"> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	contentMaxLength?: number;
}

function WebFormArea<T extends object>({
	name,
	title,
	question,
	options = {},
	className,
	contentMaxLength,
	...rest
}: WebFormAreaProps<T>) {
	const {
		register,
		formState: { errors },
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const isFocused = useSignal<boolean>(false);

	const err = anidarPropiedades(errors, (name as unknown as string).split("."));
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
				<textarea
					class={cn(
						"border border-zinc-800 bg-zinc-900/50 text-sm rounded-xl py-3 px-4 w-full text-foreground caret-foreground placeholder:text-zinc-500 transition-all focus:bg-zinc-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]",
						isFocused.value && "bg-zinc-900 ring-2 ring-primary/20",
						!!Object.keys(err).length &&
							"border-destructive/50! focus:ring-destructive/20! focus:border-destructive!",
						rest.disabled && "opacity-50 cursor-not-allowed bg-muted/30",
						className as string,
					)}
					id={nameId as string}
					autoComplete="off"
					onFocus={(e) => {
						isFocused.value = true;
						rest.onFocus?.(e);
					}}
					{...rest}
					{...register(name as unknown as Path<T>, options)}
					onBlur={(e) => {
						isFocused.value = false;
						rest.onBlur?.(e);
					}}
				>
					{watch(name as unknown as Path<T>)}
				</textarea>

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

			<div class="flex justify-between">
				{Object.keys(err).length ? (
					<p className="text-sm text-destructive flex items-center gap-1">
						{err?.message}
					</p>
				) : (
					<div />
				)}
				{contentMaxLength && (
					<p class="text-xs text-muted-foreground ">
						{
							((watch(name as unknown as Path<T>) as string)?.length || 0) as
								| number
								| undefined
						}
						/{contentMaxLength}
					</p>
				)}
			</div>
		</div>
	);
}

export default WebFormArea;

import { anidarPropiedades } from "@components/web_form";
import { sizeIcon } from "@infrastructure/utils/client";
import { ChevronDown, CircleHelp } from "lucide-preact";
import { Card } from "../../../extras/card";
import { useFormColor } from "../hooks/use-form-color.hook";
import type { FormColorProps } from "../types";

const DEFAULT_COLORS = [
	"#FF5252",
	"#FF4081",
	"#E040FB",
	"#7C4DFF",
	"#536DFE",
	"#448AFF",
	"#40C4FF",
	"#18FFFF",
	"#64FFDA",
	"#69F0AE",
	"#B2FF59",
	"#EEFF41",
	"#FFFF00",
	"#FFD740",
	"#FFAB40",
	"#FF6E40",
	"#000000",
	"#525252",
	"#969696",
	"#FFFFFF",
];

export function FormColor<T extends object>({
	title,
	question,
	presetColors = DEFAULT_COLORS,
	placeholder = "Elige un color",
	required = false,
	...props
}: FormColorProps<T>) {
	const {
		isOpen,
		toggleOpen,
		customColor,
		mode,
		setMode,
		popupRef,
		handleColorChange,
		getPopupPosition,
		register,
		errors,
		currentValue,
	} = useFormColor({
		...props,
		title,
		question,
		presetColors,
		placeholder,
		required,
	});

	const err = anidarPropiedades(
		errors,
		(props.name as unknown as string).split("."),
	);
	const nameId = `${props.name}-${Math.random().toString()}`;

	return (
		<div class="relative inline-block w-full" ref={popupRef}>
			<div class="space-y-2 w-full">
				{title && (
					<label
						htmlFor={nameId as string}
						class="block text-sm font-semibold text-foreground"
					>
						{title}
						{required ? <span class="text-primary">*</span> : ""}
					</label>
				)}
				<div>
					{/* Botón principal */}
					<button
						type="button"
						onClick={toggleOpen}
						class="flex items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-input bg-background px-3 py-2 transition w-full hover:bg-accent/50 hover:border-primary/50"
					>
						<div class="flex items-center gap-2">
							<div
								class="w-6 h-6 rounded-[var(--radius-lg)]"
								style={{ backgroundColor: customColor }}
							/>
							<span class="text-sm">
								{currentValue ? currentValue : placeholder}
							</span>
						</div>
						<ChevronDown
							class={`${isOpen ? "rotate-180" : ""} text-foreground`}
							{...sizeIcon.small}
						/>
					</button>

					{/* Popup */}
					{isOpen && (
						<Card
							className="absolute z-50 w-72 rounded-[var(--radius-lg)] bg-popover border border-input p-4 shadow-xl"
							style={getPopupPosition()}
						>
							{/* Header */}
							<div class="flex justify-between items-center mb-3">
								<h3 class="text-sm font-medium text-foreground">
									Elige un color
								</h3>
								{question && (
									<div class="relative group">
										<button
											type="button"
											class="rounded-[var(--radius-lg)] shadow p-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
										>
											<CircleHelp {...sizeIcon.small} />
										</button>
										<div class="absolute -top-[40px] right-1 p-2 min-w-[160px] text-xs rounded-[var(--radius-lg)] bg-popover text-popover-foreground border border-input hidden group-hover:block z-10">
											{question}
										</div>
									</div>
								)}
							</div>

							{/* Toggle Paleta / Picker */}
							<div class="flex gap-2 mb-3">
								<button
									class={`px-2 py-1 text-xs rounded-[var(--radius-lg)] border transition-colors ${
										mode === "palette"
											? "bg-accent text-accent-foreground border-input"
											: "border-transparent text-muted-foreground hover:bg-accent/50"
									}`}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setMode("palette");
									}}
								>
									🎨 Paleta
								</button>
								<button
									class={`px-2 py-1 text-xs rounded-[var(--radius-lg)] border transition-colors ${
										mode === "picker"
											? "bg-accent text-accent-foreground border-input"
											: "border-transparent text-muted-foreground hover:bg-accent/50"
									}`}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setMode("picker");
									}}
								>
									🖌 Picker
								</button>
							</div>

							{/* Vista según modo */}
							{mode === "palette" ? (
								<div class="grid grid-cols-6 gap-2">
									{presetColors.map((color) => (
										<button
											key={color}
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleColorChange(color);
											}}
											style={{ backgroundColor: color }}
											class={`w-8 h-8 rounded-[var(--radius-lg)] transition hover:scale-110 border border-input/20 ${
												customColor === color
													? "ring-2 ring-primary ring-offset-2 ring-offset-background"
													: ""
											}`}
										/>
									))}
								</div>
							) : (
								<div class="flex justify-center mt-2">
									<input
										type="color"
										value={customColor}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) =>
											handleColorChange((e.target as HTMLInputElement).value)
										}
										class="w-full h-10 cursor-pointer rounded-[var(--radius-lg)] border border-input"
										aria-label="Color picker"
									/>
								</div>
							)}

							{/* Input oculto para React Hook Form */}
							<input
								type="hidden"
								{...register(props.name, props.options)}
								value={customColor}
							/>
						</Card>
					)}
				</div>
			</div>{" "}
			{Object.keys(err).length ? (
				<p class="text-xs text-destructive flex items-center gap-1 mt-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

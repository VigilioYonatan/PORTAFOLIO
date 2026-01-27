import Badge from "@components/extras/badge";
import Button from "@components/extras/button";
import { Card, CardContent } from "@components/extras/card";
import ImageEditor from "@components/extras/image-editor";
import Modal from "@components/extras/modal";
import { cn, sizeIcon } from "@infrastructure/utils/client";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { ImageIcon, Pencil, Upload, XIcon } from "lucide-preact";
import { anidarPropiedades } from "../..";
import { useFormFile } from "../hooks/use-form-file.hook";
import { formatFileSize, getFileTypeColor, getIcon } from "../libs";
import type { FormFileProps } from "../types";
import { ExistingFileCard } from "./existing-file-card.component";
import { FileInfo } from "./file-info.component";

export function FormFile<T extends object>(props: FormFileProps<T>) {
	const {
		multiple = false,
		title,
		showButtonClean = false,
		fileNormal = "big",
		height = 200,
		required = false,
		placeholder,
		showButonCopy,
		smallContent,
		entity, // Required for UPLOAD_CONFIG
		property, // Required for UPLOAD_CONFIG
		ico,
		...rest
	} = props;

	// Get config from UPLOAD_CONFIG automatically
	const uploadConfig =
		entity && property ? UPLOAD_CONFIG[entity]?.[property] : null;
	const accept = uploadConfig?.mime_types?.join(", ") || "*";
	const typesText = uploadConfig?.mime_types
		? typeTextExtensions(uploadConfig.mime_types as string[])
		: "jpg, png, webp, pdf";

	const {
		form,
		isDrag,
		fileInputRef,
		editingImage,
		showFileInfo,
		isUploading,
		fileList,
		clearFiles,
		handleRemove,
		handleRemoveExisting,
		onDrop,
		onFileSelect,
		nameCustom,
	} = useFormFile(props);

	// Obtener archivos existentes del formulario (FilesSchema[])
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	const existingFiles = (form.watch(props.name) as any) || [];
	const existingFilesArray: FilesSchema[] = Array.isArray(existingFiles)
		? existingFiles
		: [];

	// Agrupar variantes por nombre (para evitar duplicados visuales)
	const existingGroups = existingFilesArray.reduce((acc, file) => {
		const group = acc.find((g) => g[0].name === file.name);
		if (group) {
			group.push(file);
		} else {
			acc.push([file]);
		}
		return acc;
	}, [] as FilesSchema[][]);

	// Obtener error del form
	const error = anidarPropiedades(
		form.formState.errors,
		(props.name as string).split("."),
	);

	// --- RENDERIZADO: MODO PEQUEÑO (BOTÓN) ---
	if (fileNormal === "small") {
		return (
			<div className="flex items-center gap-2">
				<input
					id={nameCustom}
					ref={fileInputRef}
					type="file"
					hidden
					multiple={multiple}
					accept={accept}
					onChange={onFileSelect}
					{...rest}
				/>
				<Button
					type="button"
					variant="outline"
					className="relative flex items-center gap-2"
					onClick={() => !isUploading.value && fileInputRef.current?.click()}
					disabled={isUploading.value}
				>
					{smallContent || (
						<>
							{isUploading.value ? (
								<span
									className="animate-spin rounded-full border-b-2 border-current"
									style={{
										width: sizeIcon.small.width,
										height: sizeIcon.small.height,
									}}
								/>
							) : (
								<Upload {...sizeIcon.small} />
							)}
							<span>Subir</span>
						</>
					)}
					{fileList.value.length > 0 && (
						<span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
							{fileList.value.length}
						</span>
					)}
				</Button>
				{error && <p className="text-sm text-destructive">{error.message}</p>}
			</div>
		);
	}

	// --- RENDERIZADO: MODO NORMAL/GRANDE (CARD) ---
	return (
		<div className="w-full space-y-2">
			{/* 1. Header & Labels */}
			<div className="flex items-center justify-between">
				{title && (
					<label
						htmlFor={nameCustom}
						className="text-sm font-semibold text-foreground flex items-center gap-1"
					>
						<span className="flex items-center gap-1">
							{ico}
							{title}
						</span>
						{required && <span className="text-destructive">*</span>}
					</label>
				)}

				<div className="flex gap-2">
					{showButonCopy &&
						fileList.value.length > 0 &&
						fileList.value[0].file && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => {
									navigator.clipboard.writeText(
										URL.createObjectURL(fileList.value[0].file),
									);
								}}
								title="Copiar URL Blob (Preview)"
							>
								<ImageIcon {...sizeIcon.small} />
							</Button>
						)}
					{showButtonClean && fileList.value.length > 0 && (
						<Button
							type="button"
							size="sm"
							variant="ghost"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => {
								clearFiles();
								form.setValue(
									// biome-ignor lint/suspicious/noExplicitAny: false positive
									props.name,
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									null as any,
								);
							}}
						>
							<XIcon {...sizeIcon.small} className="mr-1" /> Limpiar
						</Button>
					)}
				</div>
			</div>

			{/* 2. Input Oculto */}
			<input
				id={nameCustom}
				ref={fileInputRef}
				type="file"
				hidden
				multiple={multiple}
				accept={accept}
				onChange={onFileSelect}
				{...rest}
			/>

			{/* 3. Zona de Drop (Card Principal) */}
			{/* 3. Zona de Drop (Card Principal) */}
			<div
				style={{ minHeight: height }}
				onClick={(e) => {
					// Evitar abrir el selector si hacemos clic en botones internos
					if ((e.target as HTMLElement).closest("button")) return;
					if (!isUploading.value) fileInputRef.current?.click();
				}}
				// biome-ignore lint/suspicious/noExplicitAny: false positive
				onDrop={onDrop as any} // Tipado de Preact/React
				onDragOver={(e) => {
					e.preventDefault();
					isDrag.value = true;
				}}
				onDragLeave={() => {
					isDrag.value = false;
				}}
			>
				<Card
					className={cn(
						"relative transition-all duration-200 overflow-hidden rounded-lg min-h-[inherit]", // Ensure rounded-lg matches inputs
						isDrag.value
							? "border-primary bg-primary/5 ring-2 ring-primary/20"
							: "border border-input hover:border-primary focus:border-primary", // Match input behavior (border, not border-2 dashed by default unless spec says so, but for consistency usually file drops are dashed. If user wants consistency with INPUT buttons, they might want solid. But let's keep dashed if standard for files, but match Colors.)
						"border-dashed border-2 border-input hover:bg-accent/50", // Standardize hover to accent like inputs focus
						error?.message ? "border-destructive! text-destructive" : "",
						"cursor-pointer bg-background",
					)}
				>
					<CardContent className="p-4 flex flex-col justify-center min-h-[inherit]">
						{/* A. ESTADO VACÍO (Si no hay uploads pendientes ni archivos existentes) */}
						{fileList.value.filter((f) => f.status !== "COMPLETED").length ===
							0 && existingGroups.length === 0 ? (
							<div className="flex flex-col items-center justify-center text-center py-6">
								<div className="mb-3 p-3 bg-muted rounded-full">
									{isUploading.value ? (
										<span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full block" />
									) : (
										<Upload {...sizeIcon.large} class="text-muted-foreground" />
									)}
								</div>
								<p className="text-sm font-medium text-foreground">
									{isDrag.value
										? "¡Suelta aquí!"
										: placeholder || "Haz clic o arrastra archivos"}
								</p>
								<p className="text-xs text-muted-foreground mt-1 px-4">
									{typesText}
								</p>
							</div>
						) : (
							/* B. LISTA DE ARCHIVOS (GRID) */
							<div
								className={cn(
									"grid gap-3",
									fileList.value.filter((f) => f.status !== "COMPLETED")
										.length +
										existingGroups.length >
										1
										? "grid-cols-1 md:grid-cols-2"
										: "grid-cols-1",
								)}
							>
								{/* Mostrar archivos EXISTENTES primero (FilesSchema) */}
								{existingGroups.map((group) => {
									// Elegir el archivo principal para mostrar (priorizar la variante MÁS GRANDE)
									const mainFile =
										group.find((f) => !f.dimension) || // Original sin dimensión
										group.sort(
											(a, b) => (b.dimension || 0) - (a.dimension || 0),
										)[0]; // O la más grande

									return (
										<ExistingFileCard
											key={mainFile.key}
											file={mainFile}
											onRemove={() => {
												handleRemoveExisting(group.map((f) => f.key));
											}}
										/>
									);
								})}

								{/* Mostrar archivos EN PROCESO DE SUBIDA (FileState) */}
								{fileList.value
									.filter((f) => f.status !== "COMPLETED")
									.map((fileState) => (
										<div
											key={fileState.id}
											class="group relative flex items-start gap-3 p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all pr-10"
											onClick={(e) => e.stopPropagation()}
										>
											{/* Botón Borrar (X arriba a la derecha) */}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-1 right-1 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-20 flex items-center justify-center p-0"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleRemove(fileState);
												}}
												title="Eliminar archivo"
											>
												<XIcon {...sizeIcon.small} />
											</Button>

											{/* Preview Thumbnail */}
											<div class="w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-border relative">
												{fileState.file.type.startsWith("image/") ? (
													<img
														src={URL.createObjectURL(fileState.file)}
														alt="preview"
														title={fileState.file.name}
														width={100}
														height={100}
														class="w-full h-full object-cover"
													/>
												) : (
													getIcon(fileState.file.type)
												)}

												{/* Overlay de acciones rápidas (Editor/Info) */}
												<div
													class={cn(
														"absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-lg",
														fileState.file.type.startsWith("image/") &&
															"cursor-pointer",
													)}
													onClick={(e) => {
														e.stopPropagation();
														if (fileState.file.type.startsWith("image/")) {
															editingImage.value = fileState.file;
														}
													}}
												>
													{fileState.file.type.startsWith("image/") && (
														<Button
															type="button"
															size="sm"
															variant="ghost"
															className="h-6 w-6 text-white hover:text-primary hover:bg-white/20"
															onClick={(e) => {
																e.stopPropagation();
																editingImage.value = fileState.file;
															}}
														>
															<Pencil {...sizeIcon.small} />
														</Button>
													)}
													<Button
														type="button"
														size="sm"
														variant="ghost"
														className="h-6 w-6 text-white hover:text-primary hover:bg-white/20"
														onClick={(e) => {
															e.stopPropagation();
															showFileInfo.value = fileState.file;
														}}
													>
														<Pencil {...sizeIcon.small} />
													</Button>
												</div>
											</div>

											{/* Info del Archivo */}
											<div class="flex-1 min-w-0 flex flex-col justify-center h-16">
												<p
													class="text-sm font-medium truncate pr-2"
													title={fileState.file.name}
												>
													{fileState.file.name}
												</p>

												<div class="flex items-center gap-2 mt-1">
													<Badge
														variant="outline"
														className={cn(
															"text-[10px] px-1 h-5",
															getFileTypeColor(fileState.file.type),
														)}
													>
														{fileState.file.type.split("/")[1]?.toUpperCase() ||
															"FILE"}
													</Badge>
													<span class="text-[10px] text-muted-foreground">
														{formatFileSize(fileState.file.size)}
													</span>
												</div>

												{/* STATUS BAR */}
												<div class="mt-1.5 flex items-center gap-2 h-4">
													{(fileState.status === "PENDING" ||
														fileState.status === "UPLOADING") && (
														<div class="flex-1">
															<div class="w-full bg-secondary rounded-full h-1.5 relative overflow-hidden">
																<div
																	class={cn(
																		"h-1.5 rounded-full transition-all duration-300",
																		fileState.status === "PENDING"
																			? "bg-muted-foreground"
																			: "bg-primary",
																	)}
																	style={{
																		width: `${fileState.progress}%`,
																	}}
																/>
															</div>
															<div class="flex justify-between items-center mt-0.5">
																<span class="text-[10px] text-muted-foreground">
																	{fileState.status === "PENDING"
																		? "En cola..."
																		: "Subiendo..."}
																</span>
																<span class="text-[10px] font-semibold text-primary">
																	{fileState.progress}%
																</span>
															</div>
														</div>
													)}

													{fileState.status === "COMPLETED" && (
														<div class="flex items-center gap-1 text-primary">
															<div class="h-1.5 w-1.5 rounded-full bg-primary" />
															<span class="text-[10px] font-bold">
																Completado
															</span>
														</div>
													)}
													{fileState.status === "ERROR" && (
														<span class="text-[10px] text-destructive font-bold">
															Error
														</span>
													)}
												</div>
											</div>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* 4. Mensaje de Error */}
			{error?.message && (
				<p class="mt-1 text-xs text-destructive font-medium flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
					<span class="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
					{/* biome-ignore lint/suspicious/noExplicitAny: false positive */}
					{error.message as any}
				</p>
			)}

			{/* --- MODALS --- */}

			{/* Editor de Imagen */}
			<Modal
				isOpen={!!editingImage.value}
				onClose={() => {
					editingImage.value = null;
				}}
				contentClassName="max-w-4xl w-full"
			>
				<div class="flex flex-col gap-4">
					<ImageEditor
						file={editingImage.value!}
						onClose={() => {
							editingImage.value = null;
						}}
						onSave={(editedFile: File) => {
							// Reemplazamos el archivo en la lista local y reiniciamos ID para re-render
							const updatedList = fileList.value.map((item) =>
								item.file === editingImage.value
									? {
											...item,
											file: editedFile,
											id: editedFile.name + Date.now(),
											status: "PENDING" as const,
										} // PENDING para que se pueda volver a subir si se desea
									: item,
							);
							// Nota: Si quieres subir automáticamente el editado, deberías llamar a uploadFiles([editedFile])
							fileList.value = updatedList;
							editingImage.value = null;
						}}
						title={
							<div className="flex items-center gap-2 text-xl font-bold mb-4">
								<ImageIcon {...sizeIcon.large} /> Editor de Imagen
							</div>
						}
					/>
				</div>
			</Modal>

			{/* Info del Archivo */}
			<Modal
				isOpen={!!showFileInfo.value}
				onClose={() => {
					showFileInfo.value = null;
				}}
				contentClassName="max-w-md"
			>
				<div class="flex flex-col gap-4">
					<FileInfo
						file={showFileInfo.value!}
						title={
							<div className="font-bold text-lg mb-4">Detalles del Archivo</div>
						}
					/>
				</div>
			</Modal>
		</div>
	);
}

export default FormFile;

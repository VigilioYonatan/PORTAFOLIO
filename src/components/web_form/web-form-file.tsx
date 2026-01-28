import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import {
	Calendar,
	CircleHelp,
	Download,
	File as FileIcon,
	HardDrive,
	Image as ImageIcon,
	Pencil,
	Trash2,
	Upload,
	Video,
	XIcon,
} from "lucide-preact";

import { useCallback, useContext, useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type {
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import Badge from "../extras/badge";
import Button from "../extras/button";
import { Card } from "../extras/card";
import Hr from "../extras/hr";
import ImageEditor from "../extras/image-editor";

import Modal from "../extras/modal";
import { anidarPropiedades } from "./utils";
import { FormControlContext } from "./web-form";

export interface WebFormFileProps<T extends object> {
	title: string;
	name: Path<T>;
	multiple?: boolean;
	accept?: string;
	typeFile?: "image" | "file" | "video" | "image-video" | { value: string };
	typesText?: string;
	options?: RegisterOptions<T, Path<T>>;
	showButonCopy?: boolean;
	showButtonClean?: boolean;
	fileNormal?: "big" | "normal" | "small";
	height?: number;
	smallContent?: JSX.Element | JSX.Element[];
	required?: boolean;
}

function WebFormFile<T extends object>({
	multiple = false,
	accept = "*",
	typeFile = "file",
	typesText = "jpg, png, webp ó jpeg",
	name,
	title,
	options,
	showButonCopy = false,
	showButtonClean = false,
	fileNormal = "big",
	height = 200,
	smallContent,
	required = false,
	...rest
}: WebFormFileProps<T>) {
	const form =
		useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const isDrag = useSignal<boolean>(false);
	const showFileInfo = useSignal<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const editingImage = useSignal<File | null>(null);
	const files = (form.watch(name as unknown as Path<T>) as File[]) || [];

	const onChange = useCallback(
		(droppedFiles: FileList) => {
			const validFiles = Array.from(droppedFiles);
			const value = multiple ? [...files, ...validFiles] : validFiles;

			form.setValue(
				name as unknown as Path<T>,
				value as PathValue<T, Path<T>>,
				{ shouldValidate: true },
			);
		},
		[name, multiple],
	);

	const removeFile = (fileParam: File) => {
		const filterFiles = files.filter((file) => file !== fileParam);
		form.setValue(
			name as unknown as Path<T>,
			filterFiles.length
				? (filterFiles as PathValue<T, Path<T>>)
				: (null as PathValue<T, Path<T>>),
			{ shouldValidate: true },
		);
	};

	const onDrop = (e: globalThis.DragEvent) => {
		e.preventDefault();
		const droppedFiles = e.dataTransfer?.files;
		if (droppedFiles) {
			onChange(droppedFiles);
		}
		isDrag.value = false;
	};

	const onDragOver = (e: globalThis.DragEvent) => {
		e.preventDefault();
		isDrag.value = true;
	};

	const onDragLeave = () => {
		isDrag.value = false;
	};

	const getFileIcon = (file: File) => {
		if (file.type.startsWith("image/"))
			return <ImageIcon {...sizeIcon.large} />;
		if (file.type.startsWith("video/")) return <Video {...sizeIcon.large} />;
		return <FileIcon {...sizeIcon.large} />;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const getFileTypeColor = (file: File) => {
		if (file.type.startsWith("image/")) return "bg-green-100 text-green-800";
		if (file.type.startsWith("video/")) return "bg-blue-100 text-blue-800";
		return "bg-gray-100 text-gray-800";
	};

	const err = anidarPropiedades(
		form.formState.errors,
		(name as string).split("."),
	);

	const nameCustom = `${name as string}-${Math.random().toString(32)}`;
	const control = form.register(name as unknown as Path<T>, {
		...options,
		onChange(e: Event) {
			const files = (e.target as HTMLInputElement).files;
			onChange(files! as unknown as FileList);
		},
		value: null as PathValue<T, Path<T>>,
	});
	form.register(name as unknown as Path<T>, {
		...options,
		value: null as PathValue<T, Path<T>>,
	});

	if (fileNormal === "small") {
		return (
			<div class="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="flex items-center gap-2"
					onClick={() => {
						fileInputRef.current?.click();
					}}
				>
					{smallContent ? (
						smallContent
					) : (
						<>
							{getFileIcon({ type: typeFile } as File)}
							Upload
						</>
					)}
					{files.length > 0 && (
						<span class="text-sm bg-gray-600  text-white rounded-full w-5 h-5 flex items-center justify-center absolute right-0 top-0">
							{files.length}
						</span>
					)}
				</Button>{" "}
				<input
					id={nameCustom}
					hidden
					type="file"
					multiple={multiple}
					accept={accept}
					{...control}
					ref={(e) => {
						fileInputRef!.current = e as HTMLInputElement;
						control.ref(e);
					}}
					{...rest}
				/>
				{Object.keys(err).length ? (
					<p class="text-sm text-destructive flex items-center gap-1">
						{err?.message}
					</p>
				) : null}
			</div>
		);
	}
	if (fileNormal === "normal") {
		return (
			<div class="flex flex-col gap-2 w-full">
				{title && (
					<label
						htmlFor={nameCustom as string}
						class="block text-sm font-bold text-foreground"
					>
						{title}
						{required ? <span class="text-primary">*</span> : ""}
					</label>
				)}
				<div class="flex items-center gap-2 bg-white">
					<label
						class="relative flex items-center  w-full cursor-pointer border border-gray-300 rounded-lg
                 bg-white hover:bg-gray-50 text-gray-700 text-sm
                 transition-all duration-200 overflow-hidden"
					>
						<input
							id={nameCustom}
							hidden
							type="file"
							multiple={multiple}
							accept={accept}
							{...control}
							ref={(e) => {
								fileInputRef!.current = e as HTMLInputElement;
								control.ref(e);
							}}
							{...rest}
							// onChange={handleChange}
							class="absolute inset-0 opacity-0 cursor-pointer"
						/>

						<div class="flex items-center justify-center gap-2 pointer-events-none">
							<span class="px-4 py-2.5 bg-primary flex tracking-wide items-center gap-2 text-white fill-white  text-sm font-semibold">
								<Upload {...sizeIcon.small} />
								Subir archivos
							</span>
							<span class="text-gray-500">
								{files.length === 0
									? "Ningún archivo seleccionado"
									: `${files.length} archivo${
											files.length > 1 ? "s" : ""
										} seleccionado${files.length > 1 ? "s" : ""}`}
							</span>
						</div>
					</label>
				</div>

				{files.length ? (
					<div className="flex flex-col gap-2">
						{files.map((file, i) => (
							<Badge
								key={`${file.name}${i}`}
								className="flex gap-2 fill-gray-500 hover:fill-primary hover:text-primary hover:border-primary hover:cursor-pointer justify-between items-center"
							>
								<div class="flex items-center gap-2">
									<Download {...sizeIcon.small} />
									<p className="font-medium">
										{file.name}{" "}
										<span className="text-xs text-gray-400">
											({formatFileSize(file.size)})
										</span>
									</p>
								</div>
								<Button
									variant="danger"
									onClick={() => {
										removeFile(file);
									}}
									type="button"
									size="sm"
									className="fill-white ml-4"
								>
									<Trash2 {...sizeIcon.small} />
								</Button>
							</Badge>
						))}
					</div>
				) : null}

				{Object.keys(err).length ? (
					<p className="text-sm text-destructive flex items-center gap-1">
						{err?.message}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex items-center justify-between space-y-2">
				<label
					htmlFor={nameCustom}
					class="text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{title}
					{required ? <span class="text-primary">*</span> : ""}
				</label>
				<div className="flex items-center gap-2">
					{showButonCopy && (
						<Button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText(URL.createObjectURL(files[0]));
							}}
							size="sm"
							className="mb-4"
						>
							<ImageIcon {...sizeIcon.small} />
						</Button>
					)}
					{showButtonClean && (
						<Button
							type="button"
							size="sm"
							onClick={() => {
								form.setValue(
									name as unknown as Path<T>,
									null as PathValue<T, Path<T>>,
								);
							}}
						>
							<XIcon {...sizeIcon.small} />
						</Button>
					)}
				</div>
			</div>

			<input
				id={nameCustom}
				hidden
				type="file"
				multiple={multiple}
				accept={accept}
				{...control}
				ref={(e) => {
					fileInputRef!.current = e as HTMLInputElement;
					control.ref(e);
				}}
				{...rest}
			/>

			{/* Drop Zone */}
			<Card
				class={cn(
					"transition-all duration-200",
					isDrag.value
						? "border-primary bg-primary/10"
						: "border-dashed border-gray-300",
					Object.keys(err).length ? "border-destructive!" : "",
				)}
				style={height ? { minHeight: `${height + 135}px` } : {}}
				onClick={() => fileInputRef.current?.click()}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
			>
				<Card.Content className="flex flex-col items-center justify-center space-y-4 p-8">
					{files.length ? (
						<div
							class={` ${
								files.length > 1
									? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
									: "grid grid-cols-1"
							} gap-4`}
						>
							{files.map((file, index) => (
								<Card
									key={index}
									onClick={(e) => e.stopPropagation()}
									className="relative group "
								>
									<Card.Content className="p-4 ">
										<div
											class="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden  w-full "
											style={{
												height: height ? `${height}px` : "100%",
											}}
										>
											{file.type.startsWith("image/") ? (
												<img
													src={URL.createObjectURL(file) || "/placeholder.svg"}
													alt={file.name}
													title={file.name}
													width={200}
													height={200}
													class="w-full h-full object-contain mx-auto"
												/>
											) : file.type.startsWith("video/") ? (
												<video
													src={URL.createObjectURL(file)}
													class="w-full h-full object-cover"
													controls={false}
													muted
													autoPlay
													loop
													playsInline
													preload="metadata"
												>
													<track
														kind="captions"
														src=""
														label="No Captions"
														default
													/>
												</video>
											) : (
												<div class="w-full h-full flex items-center justify-center">
													<FileIcon
														{...sizeIcon.xxxlarge}
														class="text-gray-400"
													/>
												</div>
											)}

											{/* Overlay with actions */}
											<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
												{file.type.startsWith("image/") && (
													<Button
														type="button"
														size="sm"
														variant="secondary"
														onClick={() => {
															editingImage.value = file;
														}}
													>
														<Pencil {...sizeIcon.small} class="fill-primary" />
													</Button>
												)}
												<Button
													type="button"
													size="sm"
													variant="secondary"
													onClick={() => {
														showFileInfo.value = file;
													}}
												>
													<CircleHelp
														{...sizeIcon.small}
														class="fill-primary"
													/>
												</Button>
												<Button
													type="button"
													size="sm"
													variant="danger"
													onClick={() => removeFile(file)}
												>
													<Trash2 {...sizeIcon.small} class="fill-white" />
												</Button>
											</div>
										</div>

										<div class="space-y-2">
											<p class="text-sm font-medium truncate" title={file.name}>
												{file.name}
											</p>
											<div class="flex items-center justify-between">
												<Badge className={getFileTypeColor(file)}>
													{file.type.split("/")[1]?.toUpperCase() || "FILE"}
												</Badge>
												<span class="text-xs text-gray-500">
													{formatFileSize(file.size)}
												</span>
											</div>
										</div>
									</Card.Content>
								</Card>
							))}
						</div>
					) : (
						<div class="text-center cursor-pointer ">
							<div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								{typeFile === "image" ? (
									<ImageIcon {...sizeIcon.xlarge} class="text-gray-400" />
								) : typeFile === "video" ? (
									<Video {...sizeIcon.xlarge} class="text-gray-400" />
								) : (
									<Upload {...sizeIcon.xlarge} class="text-gray-400" />
								)}
							</div>
							<span class="text-lg font-medium text-gray-900 mb-2 block text-center! ">
								{isDrag.value
									? "Suelta los archivos aquí"
									: typeFile === "image"
										? "Sube tus imágenes"
										: typeFile === "video"
											? "Sube tus videos"
											: "Sube tus archivos"}
							</span>
							<span class="text-gray-500 mb-4 block text-center!">
								Arrastra y suelta o haz clic para seleccionar
							</span>
							<p class="text-sm text-gray-400 text-center!">{typesText}</p>
						</div>
					)}
				</Card.Content>
			</Card>

			{Object.keys(err).length ? (
				<p class="text-sm text-destructive flex items-center gap-1">
					{err?.message}
				</p>
			) : null}

			{/* Image Editor Modal */}
			<Modal
				isOpen={!!editingImage.value}
				onClose={() => {
					editingImage.value = null;
				}}
				contentClassName="max-w-6xl w-full overflow-visible! self-start"
			>
				<div className="flex flex-col gap-4">
					<ImageEditor
						file={editingImage.value!}
						onSave={(editedFile) => {
							const updatedFiles = files.map((f) =>
								f === editingImage.value ? editedFile : f,
							);
							form.setValue(
								name as unknown as Path<T>,
								updatedFiles as PathValue<T, Path<T>>,
								{ shouldValidate: true },
							);
							editingImage.value = null;
						}}
						onClose={() => {
							editingImage.value = null;
						}}
						title={
							<div className="flex items-center gap-2 text-2xl font-bold">
								<ImageIcon {...sizeIcon.large} class="fill-white" />
								Editor de Imagen
							</div>
						}
					/>
				</div>
			</Modal>

			{/* File Info Modal */}
			<Modal
				isOpen={!!showFileInfo.value}
				onClose={() => {
					showFileInfo.value = null;
				}}
				contentClassName="max-w-2xl w-full"
			>
				<div className="flex flex-col gap-4">
					<FileInfo file={showFileInfo.value!} />
				</div>
			</Modal>
		</div>
	);
}
interface FileInfoProps {
	file: File;
}

interface ImageMetadata {
	width?: number;
	height?: number;
	aspectRatio?: string;
	colorDepth?: string;
}

function FileInfo({ file }: FileInfoProps) {
	const imageMetadata = useSignal<ImageMetadata>({});

	useEffect(() => {
		if (file.type.startsWith("image/")) {
			const img = new Image();
			img.onload = () => {
				const aspectRatio = (img.width / img.height).toFixed(2);
				imageMetadata.value = {
					width: img.width,
					height: img.height,
					aspectRatio: `${aspectRatio}:1`,
					colorDepth: "24-bit",
				};
			};
			img.src = URL.createObjectURL(file);
		}
	}, [file]);

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getFileTypeInfo = () => {
		const type = file.type;
		if (type.startsWith("image/")) {
			return {
				category: "Imagen",
				icon: <ImageIcon {...sizeIcon.medium} />,
				color: "bg-green-100 text-green-800",
			};
		}
		if (type.startsWith("video/")) {
			return {
				category: "Video",
				icon: <ImageIcon {...sizeIcon.medium} />,
				color: "bg-blue-100 text-blue-800",
			};
		}
		return {
			category: "Archivo",
			icon: <CircleHelp {...sizeIcon.medium} />,
			color: "bg-gray-100 text-gray-800",
		};
	};

	const fileTypeInfo = getFileTypeInfo();

	return (
		<Card className="w-full">
			<Card.Content className="space-y-6">
				{/* File Preview */}
				<div class="flex items-center gap-4">
					<div class="min-w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
						{file.type.startsWith("image/") ? (
							<img
								src={URL.createObjectURL(file) || "/placeholder.svg"}
								alt={file.name}
								title={file.name}
								width={100}
								height={100}
								class="w-full h-full object-cover"
							/>
						) : (
							fileTypeInfo.icon
						)}
					</div>
					<div class="flex-1">
						<h3 class="font-medium text-lg ">{file.name}</h3>
						<Badge className={fileTypeInfo.color}>
							{fileTypeInfo.category}
						</Badge>
					</div>
				</div>

				{/* Basic Info */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<HardDrive {...sizeIcon.small} class="fill-primary" />
							<span>Tamaño</span>
						</div>
						<p className="font-medium">{formatFileSize(file.size)}</p>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Calendar {...sizeIcon.small} class="fill-primary" />
							<span>Modificado</span>
						</div>
						<p className="font-medium">{formatDate(file.lastModified)}</p>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<CircleHelp {...sizeIcon.small} class="fill-primary" />
							<span>Tipo MIME</span>
						</div>
						<p className="font-medium">{file.type || "Desconocido"}</p>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<CircleHelp {...sizeIcon.small} class="fill-primary" />
							<span>Extensión</span>
						</div>
						<p className="font-medium">
							{file.name.split(".").pop()?.toUpperCase() || "N/A"}
						</p>
					</div>
				</div>

				{/* Image-specific metadata */}
				{file.type.startsWith("image/") && imageMetadata.value.width && (
					<>
						<Hr className="my-4" />{" "}
						<div className="">
							<h4 className="font-medium mb-3">Información de Imagen</h4>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<span className="text-sm text-gray-600">Dimensiones</span>
									<p className="font-medium">
										{imageMetadata.value.width} × {imageMetadata.value.height}{" "}
										px
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-sm text-gray-600">
										Relación de aspecto
									</span>
									<p className="font-medium">
										{imageMetadata.value.aspectRatio}
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-sm text-gray-600">
										Profundidad de color
									</span>
									<p className="font-medium">
										{imageMetadata.value.colorDepth}
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-sm text-gray-600">Megapíxeles</span>
									<p className="font-medium">
										{(
											(imageMetadata.value.width! *
												imageMetadata.value.height!) /
											1000000
										).toFixed(1)}{" "}
										MP
									</p>
								</div>
							</div>
						</div>
					</>
				)}
				<Hr className="my-4" />
				{/* File size breakdown */}
				<div className="">
					<h4 className="font-medium mb-3">Detalles de Tamaño</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Bytes:</span>
							<span className="font-mono">{file.size.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span>Kilobytes:</span>
							<span className="font-mono">
								{(file.size / 1024).toFixed(2)} KB
							</span>
						</div>
						<div className="flex justify-between">
							<span>Megabytes:</span>
							<span className="font-mono">
								{(file.size / (1024 * 1024)).toFixed(2)} MB
							</span>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card>
	);
}

export default WebFormFile;

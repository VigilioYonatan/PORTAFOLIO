import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import Hr from "@components/extras/hr";
import { sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { Calendar, HardDrive, Info } from "lucide-preact";
import { useEffect } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { formatDate, formatFileSize, getFileTypeInfo } from "../libs";
import type { ImageMetadata } from "../types";

export interface FileInfoProps {
	file: File;
	title?: JSX.Element | string;
}

export function FileInfo({ file, title }: FileInfoProps) {
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

	const fileTypeInfo = getFileTypeInfo(file.type);

	return (
		<div class="space-y-4">
			{title && (
				<div className="flex items-center gap-2 text-2xl font-bold">
					{title}
				</div>
			)}
			<Card class="w-full">
				<Card.Content class="space-y-6">
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
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<HardDrive {...sizeIcon.small} class="text-primary" />
								<span>Tamaño</span>
							</div>
							<p class="font-medium">{formatFileSize(file.size)}</p>
						</div>

						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Calendar {...sizeIcon.small} class="text-primary" />
								<span>Modificado</span>
							</div>
							<p class="font-medium">{formatDate(file.lastModified)}</p>
						</div>

						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Info {...sizeIcon.small} class="text-primary" />
								<span>Tipo MIME</span>
							</div>
							<p class="font-medium">{file.type || "Desconocido"}</p>
						</div>

						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Info {...sizeIcon.small} class="text-primary" />
								<span>Extensión</span>
							</div>
							<p class="font-medium">
								{file.name.split(".").pop()?.toUpperCase() || "N/A"}
							</p>
						</div>
					</div>

					{/* Image-specific metadata */}
					{file.type.startsWith("image/") && imageMetadata.value.width && (
						<>
							<Hr className="my-4" />{" "}
							<div class="">
								<h4 class="font-medium mb-3">Información de Imagen</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<span class="text-sm text-gray-600">Dimensiones</span>
										<p class="font-medium">
											{imageMetadata.value.width} × {imageMetadata.value.height}{" "}
											px
										</p>
									</div>

									<div class="space-y-2">
										<span class="text-sm text-gray-600">
											Relación de aspecto
										</span>
										<p class="font-medium">{imageMetadata.value.aspectRatio}</p>
									</div>

									<div class="space-y-2">
										<span class="text-sm text-gray-600">
											Profundidad de color
										</span>
										<p class="font-medium">{imageMetadata.value.colorDepth}</p>
									</div>

									<div class="space-y-2">
										<span class="text-sm text-gray-600">Megapíxeles</span>
										<p class="font-medium">
											{(
												(imageMetadata.value.width *
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
					<div class="">
						<h4 class="font-medium mb-3">Detalles de Tamaño</h4>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span>Bytes:</span>
								<span class="font-mono">{file.size.toLocaleString()}</span>
							</div>
							<div class="flex justify-between">
								<span>Kilobytes:</span>
								<span class="font-mono">
									{(file.size / 1024).toFixed(2)} KB
								</span>
							</div>
							<div class="flex justify-between">
								<span>Megabytes:</span>
								<span class="font-mono">
									{(file.size / (1024 * 1024)).toFixed(2)} MB
								</span>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card>
		</div>
	);
}

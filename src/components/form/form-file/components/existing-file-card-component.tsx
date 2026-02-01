import Badge from "@components/extras/badge";
import Button from "@components/extras/button";
import environments from "@infrastructure/config/client/environments.config";
import { cn, sizeIcon } from "@infrastructure/utils/client";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { XIcon } from "lucide-preact";
import { formatFileSize, getFileTypeColor, getIcon } from "../libs";
import { isImageFile } from "../libs/file-url";

interface ExistingFileCardProps {
	file: FilesSchema;
	onRemove: (key: string) => void;
	disableRemove?: boolean;
}

/**
 * Componente para mostrar archivos que ya están guardados (FilesSchema)
 */
export function ExistingFileCard({
	file,
	onRemove,
	disableRemove = false,
}: ExistingFileCardProps) {
	const isImage = isImageFile(file.mimetype);

	return (
		<div
			class="group relative flex items-start gap-3 p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all"
			onClick={(e) => e.stopPropagation()}
		>
			{/* Preview Thumbnail */}
			<div class="w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-border">
				{isImage ? (
					<img
						src={
							printFileWithDimension(
								[file],
								DIMENSION_IMAGE.xs,
								environments.STORAGE_CDN_URL,
							)[0]
						}
						alt={file.name}
						title={file.name}
						width={DIMENSION_IMAGE.xs}
						height={DIMENSION_IMAGE.xs}
						class="w-full h-full object-cover"
					/>
				) : (
					getIcon(file.mimetype)
				)}
			</div>

			{/* Info del Archivo */}
			<div class="flex-1 min-w-0 flex flex-col justify-center h-16">
				<p
					class="text-sm font-medium text-foreground truncate pr-6"
					title={file.name}
				>
					{file.name}
				</p>

				<div class="flex items-center gap-2 mt-1">
					<Badge
						variant="outline"
						className={cn(
							"text-[10px] px-1 h-5",
							getFileTypeColor(file.mimetype),
						)}
					>
						{file.mimetype.split("/")[1]?.toUpperCase() || "FILE"}
					</Badge>
					<span class="text-[10px] text-muted-foreground">
						{formatFileSize(file.size)}
					</span>
					{file.dimension && (
						<Badge variant="secondary" className="text-[10px] px-1 h-5">
							{file.dimension}px
						</Badge>
					)}
				</div>

				{/* Status: Guardado */}
				<div class="mt-1.5 flex items-center gap-2 h-4">
					<div class="flex items-center gap-1 text-blue-600 dark:text-blue-400">
						<div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
						<span class="text-[10px] font-medium">Guardado</span>
					</div>
				</div>
			</div>

			{/* Botón Borrar */}
			{!disableRemove && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute top-1 right-1 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-20 flex items-center justify-center p-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onRemove(file.key);
					}}
					title="Eliminar archivo existente"
				>
					<XIcon {...sizeIcon.small} />
				</Button>
			)}
		</div>
	);
}

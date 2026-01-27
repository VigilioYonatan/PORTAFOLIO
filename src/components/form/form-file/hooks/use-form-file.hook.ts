import { type FileState, useSmartUpload } from "@hooks/useSmartUpload";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { useContext, useRef } from "preact/hooks";
import type {
	FieldValues,
	Path,
	PathValue,
	UseFormReturn,
} from "react-hook-form";
import { FormControlContext } from "../../form";
import type { FormFileProps } from "../types";

export function useFormFile<T extends object>({
	multiple = false,
	entity,
	property,
	name,
}: Pick<FormFileProps<T>, "multiple" | "name" | "entity" | "property">) {
	// 1. Contexto del Formulario
	const form =
		useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);

	// 2. Estado Local UI
	const isDrag = useSignal<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Estado para Modals
	const editingImage = useSignal<File | null>(null);
	const showFileInfo = useSignal<File | null>(null);

	// 3. HOOK "SMART UPLOAD" (Integración Principal)
	// 3. HOOK "SMART UPLOAD" (Integración Principal)
	const { uploadFiles, fileList, isUploading, removeFileState, clearFiles } =
		useSmartUpload(entity, property);

	// ID único para el input
	const nameCustom = `${name as string}-${Math.random()
		.toString(36)
		.substring(7)}`;

	// --- MANEJADORES DE EVENTOS ---

	// A. Entrada de Archivos (Input o Drop)
	const handleFilesAdded = (incomingFiles: File[]) => {
		if (incomingFiles.length === 0) return;

		// Validación usando UPLOAD_CONFIG
		if (entity && property) {
			const config = UPLOAD_CONFIG[entity]?.[property];
			if (config) {
				const maxFiles = config.max_files || 1;
				const maxSize = config.max_size || Number.POSITIVE_INFINITY;
				const allowedTypes = config.mime_types || [];

				// Validar cantidad de archivos
				if (incomingFiles.length > maxFiles) {
					form.setError(name as unknown as Path<T>, {
						type: "manual",
						message: `Máximo ${maxFiles} archivo${maxFiles > 1 ? "s" : ""} permitido${maxFiles > 1 ? "s" : ""}`,
					});
					return;
				}

				// Validar cada archivo
				for (const file of incomingFiles) {
					// Validar tamaño
					if (file.size > maxSize) {
						form.setError(name as unknown as Path<T>, {
							type: "manual",
							message: `El archivo "${file.name}" excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`,
						});
						return;
					}

					// Validar tipo MIME
					if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
						const extensions = allowedTypes
							.map((t: string) => t.split("/")[1])
							.join(", ");
						form.setError(name as unknown as Path<T>, {
							type: "manual",
							message: `Tipo de archivo no permitido: "${file.name}". Permitidos: ${extensions}`,
						});
						return;
					}
				}

				// Si pasó todas las validaciones, limpiar errores previos
				form.clearErrors(name as unknown as Path<T>);
			}
		}

		// Si no es múltiple, limpiamos la lista visual anterior
		if (!multiple) {
			clearFiles();
		}

		// Preparamos los archivos (si no es multiple, solo el primero)
		const filesToProcess = multiple ? incomingFiles : [incomingFiles[0]];

		// 1. DISPARAMOS LA SUBIDA (Hook)
		uploadFiles(filesToProcess, (uploadedFilesSchemas) => {
			// 2. CALLBACK DE ÉXITO: Actualizamos el Formulario con FilesSchema[]
			// Esto ocurre solo cuando la subida termina exitosamente.

			const currentFormValues = form.getValues(name);
			let newValue: Array<{
				key: string;
				name: string;
				size: number;
				mimetype: string;
			}>;

			if (multiple) {
				// Si es array múltiple, concatenamos con los valores anteriores
				const prev = Array.isArray(currentFormValues) ? currentFormValues : [];
				newValue = [...prev, ...uploadedFilesSchemas].filter(Boolean);
			} else {
				// Si NO es múltiple, REEMPLAZAMOS pero mantenemos como array
				// El schema SIEMPRE espera un array, incluso cuando multiple=false
				newValue = uploadedFilesSchemas;
			}

			// Actualizamos React Hook Form
			form.setValue(
				name as unknown as Path<T>,
				newValue as PathValue<T, Path<T>>,
				{ shouldValidate: true, shouldDirty: true },
			);
		});
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		isDrag.value = false;
		if (e.dataTransfer?.files) {
			handleFilesAdded(Array.from(e.dataTransfer.files));
		}
	};

	const onFileSelect = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			handleFilesAdded(Array.from(target.files));
		}
		// Reset del input para permitir subir lo mismo si se borró
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	// B. Eliminación de Archivos (Modificado para usar removeFileState del hook)
	const handleRemove = (fileState: FileState) => {
		// 1. Quitar de la lista visual y manejar abort/delete S3 (Hook)
		removeFileState(fileState.id);

		// 2. Quitar del valor del formulario
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		const currentVal = form.getValues(name) as any;

		if (Array.isArray(currentVal)) {
			let keysToRemove: string[] = [];

			if (fileState.result && fileState.result.length > 0) {
				keysToRemove = fileState.result.map((f) => f.key);
			} else if (fileState.key) {
				keysToRemove = [fileState.key];
			}

			if (keysToRemove.length > 0) {
				const newVal = currentVal.filter(
					(item: { key: string }) => !keysToRemove.includes(item.key),
				);
				form.setValue(
					name as unknown as Path<T>,
					(newVal.length > 0 ? newVal : []) as PathValue<T, Path<T>>,
					{
						shouldValidate: true,
						shouldDirty: true,
					},
				);
			}
		} else if (currentVal?.key) {
			// Caso único (no array) - si coincide la key, ponemos null
			// Verificamos si la key actual coincide con alguna de las que vamos a borrar
			let shouldRemove = false;
			if (fileState.result?.some((res) => res.key === currentVal.key)) {
				shouldRemove = true;
			} else if (fileState.key === currentVal.key) {
				shouldRemove = true;
			}

			if (shouldRemove) {
				form.setValue(
					name as unknown as Path<T>,
					null as PathValue<T, Path<T>>,
					{
						shouldValidate: true,
						shouldDirty: true,
					},
				);
			}
		}
	};

	// C. Eliminación de Archivos Existentes (FilesSchema ya guardados)
	const handleRemoveExisting = async (fileKeys: string | string[]) => {
		const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		const currentVal = form.getValues(name) as any;

		// NOTA DE SEGURIDAD:
		// No llamamos a la API de eliminar (deleteFile) aquí.
		// Razón: Ese endpoint ahora es solo para ADMIN/MODERATOR por seguridad.
		// El usuario regular "elimina" el archivo quitándolo del array enviado en el update del formulario.
		// El backend (Service.update) debe encargarse de limpiar archivos huérfanos o reemplazados.

		if (Array.isArray(currentVal)) {
			// Filtramos TODOS las keys que se pasaron
			const newVal = currentVal.filter(
				(item: { key: string }) => !keys.includes(item.key),
			);
			form.setValue(
				name as unknown as Path<T>,
				(newVal.length > 0 ? newVal : []) as PathValue<T, Path<T>>,
				{
					shouldValidate: true,
					shouldDirty: true,
				},
			);
		} else {
			// Si es single, y la key coincide (o está en el array), null
			// Verificamos si la key actual está en la lista de borrados
			if (currentVal?.key && keys.includes(currentVal.key)) {
				form.setValue(
					name as unknown as Path<T>,
					null as PathValue<T, Path<T>>,
					{
						shouldValidate: true,
						shouldDirty: true,
					},
				);
			}
		}
	};

	return {
		form,
		isDrag,
		fileInputRef,
		editingImage,
		showFileInfo,
		uploadFiles,
		fileList,
		isUploading,
		removeFileState,
		clearFiles,
		nameCustom,
		handleFilesAdded,
		onDrop,
		onFileSelect,
		handleRemove,
		handleRemoveExisting,
	};
}

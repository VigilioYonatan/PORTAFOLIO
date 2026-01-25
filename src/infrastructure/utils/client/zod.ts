import { z } from "@infrastructure/config/zod-i18n.config";
import {
	type EntityFile,
	type EntityFileProperty,
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";

export function validFile(
	entity: EntityFile,
	property: EntityFileProperty,
	required = true,
) {
	const config = UPLOAD_CONFIG[entity][property];
	const maxFiles = config!.max_files!;

	return z
		.array(z.instanceof(File))
		.refine(
			(files) => {
				if (required && files.length === 0) return false;
				return true;
			},
			{ message: "Este campo es obligatorio" },
		)
		.refine(
			(files) => {
				if (files.length > maxFiles) return false;
				return true;
			},
			{ message: `Máximo ${maxFiles} archivos permitidos.` },
		)
		.superRefine((files, ctx) => {
			for (const file of files) {
				// Validar Tamaño
				if (file.size > config!.max_size!) {
					ctx.addIssue({
						code: "custom",
						message: `El archivo ${file.name} excede el tamaño máximo de ${
							config!.max_size! / 1024 / 1024
						}MB`,
					});
				}

				// Validar Tipos
				if (config!.mime_types.length > 0) {
					const allowedTypes = Array.isArray(config!.mime_types)
						? config!.mime_types
						: [config!.mime_types];

					if (!allowedTypes.includes(file.type)) {
						ctx.addIssue({
							code: "custom",
							message: `Tipo de archivo no permitido: ${
								file.name
							}. Permitidos: ${typeTextExtensions(allowedTypes)}`,
						});
					}
				}
			}
		});
}

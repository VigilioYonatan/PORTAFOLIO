import { getEnvironments } from "@infrastructure/config/server";
import { now } from "@infrastructure/utils/hybrid";
import { type ArgumentsHost, Catch, HttpStatus, Logger } from "@nestjs/common";
import type { Response } from "express";
import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
export class DrizzleExceptionFilter extends HttpExceptionFilter {
	private readonly drizzleLogger = new Logger(DrizzleExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		// biome-ignore lint/suspicious/noExplicitAny: Exception handling
		const exceptionAny = exception as any;
		// A veces Drizzle anida el error en .cause, y a veces ese .cause tiene otro .cause
		let dbError = exceptionAny.cause || exceptionAny;
		if (dbError.cause) {
			dbError = dbError.cause;
		}

		// 2. INTENTAR OBTENER EL CÓDIGO
		let code = dbError.code;

		// FALLBACK: Si no hay código, analizamos el mensaje de texto
		// Esto soluciona el error "Failed query..." si el driver no expuso el código
		if (!code && dbError.message) {
			if (dbError.message.includes("duplicate key")) code = "23505";
			else if (dbError.message.includes("violates foreign key")) code = "23503";
			else if (dbError.message.includes("null value")) code = "23502";
			else if (dbError.message.includes("too long")) code = "22001";
			else if (dbError.message.includes("invalid input syntax")) code = "22P02";
		}

		// 3. SI AÚN NO ES UN ERROR DE BD CONOCIDO -> DELEGAR A NEST
		// Verificamos si logramos obtener un código string válido
		if (!code || typeof code !== "string") {
			// Si el mensaje dice explícitamente "Failed query" pero no pudimos mapearlo,
			// lo manejamos como error interno para no filtrar SQL crudo al cliente.
			if (dbError.message?.startsWith("Failed query")) {
				// Cae al switch default de abajo (Internal Server Error)
				// Forzamos un código para que entre al log
				code = "DRIZZLE_QUERY_ERROR";
			} else {
				return super.catch(exception, host);
			}
		}

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Error interno de base de datos";

		// Intentamos extraer el campo problemático del 'detail' o del 'message'
		const detail = dbError.detail || dbError.message || "";
		const match = detail.match(/\((.*?)\)=/) || detail.match(/Key \((.*?)\)=/);
		const body = match ? match[1] : "campo desconocido";

		// --- SWITCH DE CÓDIGOS POSTGRES ---
		switch (code) {
			case "23505": {
				// Unique Constraint
				status = HttpStatus.CONFLICT;
				message = `Este valor ya está en uso.`;
				break;
			}
			case "23503": {
				// Foreign Key
				status = HttpStatus.BAD_REQUEST;
				message = "El registro relacionado no existe o es inválido.";
				break;
			}
			case "23502": {
				// Not Null
				status = HttpStatus.BAD_REQUEST;
				message = `Este campo es obligatorio.`;
				break;
			}
			case "22001": {
				// String Truncation
				status = HttpStatus.BAD_REQUEST;
				message = "El texto enviado es demasiado largo para este campo.";
				break;
			}
			case "22P02": {
				// Invalid Text Representation (UUID/Int)
				status = HttpStatus.BAD_REQUEST;
				message =
					"Formato de datos inválido (ej: se esperaba un número o UUID).";
				break;
			}
			case "42703": {
				// Undefined Column (Error de desarrollo)
				status = HttpStatus.INTERNAL_SERVER_ERROR;
				message = "Error interno: Columna no encontrada en base de datos.";
				break;
			}
			default:
				// Logueamos el error original completo para debug
				// Usamos exceptionAny para ver el stack completo de Drizzle
				this.drizzleLogger.error(
					`DB Error [${code}]: ${dbError.message}`,
					exceptionAny.stack,
				);

				// Si empieza con 42 (errores de sintaxis/tabla), es culpa del backend
				if (code.startsWith("42")) {
					message = "Error de configuración de base de datos.";
				}
				break;
		}

		// Respuesta segura para el cliente
		let result: Record<string, unknown> = {
			statusCode: status,
			message,
			// Solo enviamos 'body' si es un error de validación (400/409)
			...(status < 500 ? { field: body } : {}),
		};

		// En Desarrollo agregamos detalles técnicos extra
		if (getEnvironments().NODE_ENV === "DEVELOPMENT") {
			result = {
				...result,
				path: ctx.getRequest().url,
				timestamp: now(),
				originalError: {
					code,
					detail: dbError.detail,
					message: dbError.message,
				},
			};
		}

		return response.status(status).json(result);
	}
}

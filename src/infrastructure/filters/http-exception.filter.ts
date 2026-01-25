import { getEnvironments } from "@infrastructure/config/server";
import { now } from "@infrastructure/utils/hybrid";
import { astroRender } from "@infrastructure/utils/server";
import {
	type ArgumentsHost,
	Catch,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();
		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;
		if (request.url.startsWith("/api")) {
			const response = ctx.getResponse<Response>();

			let result: Record<string, unknown> = {
				success: false,
				statusCode: status,
				...(exception instanceof HttpException
					? exception.getResponse() instanceof Object
						? (exception.getResponse() as Record<string, unknown>)
						: { message: exception.getResponse() as string }
					: { message: "Internal server error" }),
			};

			if (
				getEnvironments().NODE_ENV === "DEVELOPMENT" ||
				getEnvironments().NODE_ENV === "TEST"
			) {
				this.logger.error(exception);
				result = {
					path: request.url,
					timestamp: now(),
					...(result || {}),
					exception:
						exception instanceof Error
							? {
									message: exception.message,
									stack: exception.stack,
								}
							: exception,
				};
			}
			return response.status(status).json(result);
		}
		return astroRender()(request, response, () => {});
	}
}

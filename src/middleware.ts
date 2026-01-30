import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;

	const headerLocals = context.request.headers.get("x-astro-locals");
	if (headerLocals) {
		try {
			const data = JSON.parse(
				Buffer.from(headerLocals, "base64").toString("utf-8"),
			);
			Object.assign(context.locals, data);
		} catch (e) {
			// biome-ignore lint/suspicious/noConsole: Log error
			console.error("Error parsing x-astro-locals header:", e);
		}
	}

	// Proteger rutas del dashboard - requiere autenticación
	if (pathname.startsWith("/dashboard")) {
		// Verificar si hay usuario autenticado en la sesión
		const user = context.locals.user;
		if (!user) {
			// Redirigir a login si no está autenticado
			return context.redirect("/auth/login");
		}
	}

	// En producción, context.locals ya viene lleno gracias al adaptador de Node.
	return next();
});

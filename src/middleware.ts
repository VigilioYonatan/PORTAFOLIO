import { PUBLIC_ENV } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;

	// Si estamos en desarrollo, los datos vienen por el Header 'x-astro-locals'
	// que inyectó nuestro Proxy.
	// Rellenamos el contexto de Astro con los datos del Backend
	const headerLocals = context.request.headers.get("x-astro-locals");
	const locals =
		PUBLIC_ENV === "DEVELOPMENT"
			? JSON.parse(
					headerLocals
						? Buffer.from(headerLocals, "base64").toString("utf-8")
						: "{}",
				)
			: context.locals;
	Object.assign(context.locals, locals);

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

import { createWriteStream } from "node:fs";
import stream from "node:stream";
import util from "node:util";
import type { QuerySchema } from "@infrastructure/schemas/query.schema";

const pipeline = util.promisify(stream.pipeline);

/*** random number between*/
export function randomNumber(start: number, end: number) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
}

export async function downloadFileFetch(url: string, rutaArchivo: string) {
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error: ${res.statusText}`);
		if (res.body) {
			await pipeline(
				res.body as unknown as stream.Readable,
				createWriteStream(rutaArchivo),
			);
		}
	} catch (err) {
		throw new Error((err as Error).message);
	}
}

export function getOS(userAgent: string) {
	let os = "Unknown OS";

	if (userAgent.includes("Windows")) os = "Windows";
	else if (userAgent.includes("Mac OS")) os = "Mac OS";
	else if (userAgent.includes("Linux")) os = "Linux";
	else if (userAgent.includes("Android")) os = "Android";
	else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
		os = "iOS";
	return os;
}

export function getBrowser(userAgent: string) {
	let browser = "Desconocido";

	if (/edg/i.test(userAgent)) {
		browser = "Edge";
	} else if (/opr|opera/i.test(userAgent)) {
		browser = "Opera";
	} else if (/chrome/i.test(userAgent)) {
		browser = "Chrome";
	} else if (/safari/i.test(userAgent)) {
		browser = "Safari";
	} else if (/firefox/i.test(userAgent)) {
		browser = "Firefox";
	} else if (/msie|trident/i.test(userAgent)) {
		browser = "Internet Explorer";
	}
	return browser;
}

export function incrementCode(code: string, increment = 1) {
	const ultimoNumero = Number.parseInt(code.replace(/\D/g, ""), 10);
	return `${String(ultimoNumero + increment).padStart(6, "0")}`;
}

export interface PaginatorOptions<T extends object> {
	filters?: T & QuerySchema; // DTO plano
	cb: (
		filters: T & QuerySchema,
		isClean: boolean,
	) => Promise<[(unknown & { id: number })[], number]>; // Aceptamos array de Promises (Lean) o Tuple
}

// Result para Controller/Swagger
export type PaginatorQuery<T extends object> = T & QuerySchema;
export type PaginatorResult<T extends object> = {
	success: true;
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
};
export async function paginator<T extends object, X extends object>(
	model: string,
	options: PaginatorOptions<T>,
): Promise<PaginatorResult<X>> {
	const { cb, filters } = options;

	// Si filters viene nulo o vacío, asignamos defaults aqui si es necesario,
	// pero idealmente el DTO validado ya trae defaults.
	// Asumimos que "filters" trae TODO (limit, offset, search, propios).
	const {
		offset = 0,
		limit = 20,
		search = "",
		cursor,
		...rest
	} = (filters || {}) as T & QuerySchema;

	// Aseguramos tipos, aunque el DTO ya debería haberlo hecho.
	const searchConverted = search || "";

	// Determine if query is "clean" (only basic pagination, no filters/search/custom sorts)
	// We assume explicit specific filters (like is_active) will appear in 'rest'
	// Default sort is often implicit, but if 'sortBy' is present in rest and not 'id', it's dirty.
	// Simplifying: If search is empty AND 'rest' has no active keys (undefined/null are ignored), it's clean.
	const hasExtraFilters = Object.values(rest).some(
		(v) => v !== undefined && v !== null && v !== "",
	);
	const isClean = !searchConverted && !hasExtraFilters;

	// Ejecutamos callback
	const cbResult = await cb(
		{
			...rest,
			offset,
			limit,
			search: searchConverted,
			cursor,
		} as T & QuerySchema,
		isClean,
	);

	// Aseguramos que results sea un array nuevo para no mutar el objeto en caché por referencia si el store es en memoria
	const [rawResults, count] = cbResult;
	const results = [...rawResults]; // Defensive copy
	let next: string | null = null;
	let back: string | null = null;

	// Construct query params for links (preserve search and other filters)
	const queryParams = new URLSearchParams();
	if (search) queryParams.set("search", search);
	Object.entries(rest).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			queryParams.set(key, String(value));
		}
	});

	const queryString = queryParams.toString()
		? `&${queryParams.toString()}`
		: "";

	// Si limits es mayor que results.length (significa que pedimos limit+1)
	if (cursor) {
		// En cursor pagination pedimos limit + 1 para saber si hay siguiente pagina
		// Si el array trae mas elementos que el limit original, hay next page.
		if (results.length > limit) {
			results.pop(); // Remove the extra item from the COPY
			const lastItem = results[results.length - 1];
			next = `/api/v1${model}?cursor=${lastItem.id}&limit=${limit}${queryString}`;
		}
	} else {
		// Offset Logic
		if (offset + limit < count) {
			next = `/api/v1${model}?offset=${offset + limit}&limit=${limit}${queryString}`;
		}

		// Only calculate back link for offset pagination
		const offsetTotal = offset - limit;
		if (offsetTotal >= 0) {
			back = `/api/v1${model}?offset=${offsetTotal}&limit=${limit}${queryString}`;
		}
	}

	return {
		success: true,
		count,
		next,
		previous: back,
		results: results as X[],
	};
}

export interface PaginatorCursorOptions<T extends object> {
	filters?: T & { cursor?: string | number; limit?: number };
	cb: (
		filters: T & { cursor?: string | number; limit?: number },
	) => Promise<unknown[]>;
}

export type PaginatorCursorResult<T extends object> = {
	success: true;
	next: string | null;
	results: T[];
};

export function toNull<T>(data: T | undefined): T | null {
	return data ?? null;
}

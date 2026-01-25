import type { Column, InferInsertModel } from "drizzle-orm";
import type { AnyPgTable, PgTable } from "drizzle-orm/pg-core";

export interface GenerateCodeOptions {
	Item: AnyPgTable;
	latestCodeColumn: string;
	orderByColumn: Column;
	prefix?: string;
	tenantId?: number;
}

// type DbConnection = PgDatabase<any, any, any> | any;

// Configuración para la creación
export type BulkCreateConfig<
	TTable extends PgTable,
	TInputData extends object,
> = {
	table: TTable;
	data: TInputData[];
	// Campos a excluir del objeto de entrada antes de insertar
	excludeFields?: (keyof TInputData)[];
	// Función para transformar datos antes de insertar (ej: agregar IDs foráneos)
	beforeCreate?: (
		item: TInputData,
		index: number,
		parent: (Record<string, unknown> & { id: number }) | null,
	) => InferInsertModel<TTable>;
	chunkSize?: number;
};

// Configuración de relaciones anidadas
export type RelationConfig = {
	// El campo en el objeto PADRE que contiene el array de hijos (ej: 'grid_banners')
	childrenField: string;
	// El campo en la tabla HIJA que recibe el ID del padre (ej: 'page_id')
	foreignKeyField: string;
	// Configuración de la tabla hija
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	config: Omit<BulkCreateConfig<any, any>, "data">;
};

import { incrementCode } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import {
	desc,
	eq,
    getTableColumns,
	type InferInsertModel,
	type InferSelectModel,
	isNull,
	or,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTable, PgTableWithColumns } from "drizzle-orm/pg-core";
import { CacheService } from "../cache";
import { DRIZZLE } from "./database.const";
import type { schema } from "./database.schema";
import type {
	BulkCreateConfig,
	GenerateCodeOptions,
	RelationConfig,
} from "./database.type";

export { DRIZZLE };

@Injectable()
export class DatabaseService {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
		private readonly cacheService: CacheService,
	) {}

	async generateCodeEntity({
		Item,
		latestCodeColumn,
		orderByColumn,
		prefix = "",
		tenantId,
	}: GenerateCodeOptions) {
        const columns = getTableColumns(Item);
        const codeCol = columns[latestCodeColumn];
        const tenantCol = columns.tenant_id;

		const latestRow = await this.db
			.select({
				code: codeCol,
			})
			.from(Item)
			.where(tenantId && tenantCol ? eq(tenantCol, tenantId) : undefined)
			.orderBy(desc(orderByColumn))
			.limit(1);

		const latestUser = latestRow[0];
		let code: string | null = null;
		if (latestUser) {
			const numericPart = latestUser.code as string;
			code = incrementCode(numericPart);
		} else {
			code = "000001";
		}
		return `${prefix}${code}`;
	}

	/**
	 * Función principal de insersión masiva en cascada
	 */
	async bulkCreateWithNestedRelations<
		TTable extends PgTable,
		TInputData extends object,
	>(
		mainConfig: BulkCreateConfig<TTable, TInputData>,
		relations: RelationConfig[] = [],
		// biome-ignore lint/suspicious/noExplicitAny: Transaction type compatibility
		tx?: NodePgDatabase<typeof schema> | any,
	) {
		const chunkSize = mainConfig.chunkSize || 4000;
		const db = tx || this.db;

		// --- FUNCIÓN INTERNA: PROCESAR POR LOTES ---
		const processInChunks = async <T extends PgTable>(
			table: T,
			rows: InferInsertModel<T>[],
		): Promise<InferSelectModel<T>[]> => {
			if (rows.length === 0) return [];

			const results: InferSelectModel<T>[] = [];

			for (let i = 0; i < rows.length; i += chunkSize) {
				const chunk = rows.slice(i, i + chunkSize);

				// Drizzle insert con returning para obtener los IDs
				const created = await db.insert(table).values(chunk).returning();

				results.push(...(created as InferSelectModel<T>[]));
			}
			return results;
		};

		// --- LOGICA PRINCIPAL NIVEL 1 (RAÍZ) ---

		// Preparar datos raíz
		const rootDataToInsert = mainConfig.data.map((item, index) => {
			const itemData = { ...item } as Record<string, unknown>;

			// Limpiar campos excluidos
			if (mainConfig.excludeFields) {
				for (const field of mainConfig.excludeFields) {
					delete itemData[field as string];
				}
			}

			// Ejecutar hook beforeCreate si existe
			if (mainConfig.beforeCreate) {
				return mainConfig.beforeCreate(item as TInputData, index, null);
			}

			return itemData as InferInsertModel<TTable>;
		});

		// Insertar Raíz
		const rootResults = await processInChunks(
			mainConfig.table,
			rootDataToInsert,
		);

		// --- LOGICA RECURSIVA (RELACIONES) ---
		// Mantenemos el rastro de los padres actuales (datos originales + resultados de BD)

		// Parents Data: La data original (que contiene los arrays de hijos)
		let currentParentsData = mainConfig.data as (Record<string, unknown> & {
			id: number;
		})[];
		// Parents Results: La data insertada en BD (que contiene los nuevos IDs)
		let currentParentsResults = rootResults as (Record<string, unknown> & {
			id: number;
		})[];

		for (const relation of relations) {
			const childrenToInsert: Record<string, unknown>[] = [];
			// Necesitamos mapear qué hijo pertenece a qué padre para reconstruir la cadena luego
			const nextParentsData: (Record<string, unknown> & {
				id: number;
			})[] = [];
			// const parentIndexMap: number[] = []; // Para saber a qué padre pertenece el hijo insertado

			// Iterar sobre cada padre para extraer sus hijos
			for (const [parentIndex, parentData] of currentParentsData.entries()) {
				const parentResult = currentParentsResults[parentIndex];
				const children =
					((parentData as Record<string, unknown>)[
						relation.childrenField
					] as Record<string, unknown>[]) || [];

			for (const [childIndex, child] of children.entries()) {
					let childData = { ...child } as Record<string, unknown>;

					// 1. Limpieza de campos
					if (relation.config.excludeFields) {
						for (const field of relation.config.excludeFields) {
							delete childData[field as string];
						}
					}

					// 2. Asignar Foreign Key del Padre
					// Asumimos que el PK del padre es 'id', si es otro, habría que parametrizarlo
					childData[relation.foreignKeyField] = parentResult.id;

					// 3. Before Create Hook
					// biome-ignore lint/suspicious/noExplicitAny: Generic hook
					if (relation.config.beforeCreate) {
                        // Cast to any because generic complexity is high here
						childData = relation.config.beforeCreate(
							childData as unknown,
							childIndex,
							parentResult,
						) as Record<string, unknown>;
					}

					childrenToInsert.push(childData);
					nextParentsData.push(child as Record<string, unknown> & { id: number }); // Guardamos la data original del hijo para el siguiente nivel
				}
			}

			if (childrenToInsert.length > 0) {
				// Insertar este nivel masivamente
				const childResults = await processInChunks(
					relation.config.table,
					childrenToInsert,
				);

				// Preparar variables para la siguiente iteración del bucle de relaciones
				currentParentsData = nextParentsData;
				currentParentsResults = childResults as (Record<string, unknown> & {
					id: number;
				})[];
			} else {
				// Si no hay hijos en este nivel, se rompe la cadena para los siguientes niveles
				break;
			}
		}

		return rootResults as unknown as InferSelectModel<TTable>[];
	}

	// 2️⃣ Función adaptada para Drizzle (getByIdCache)
	/**
	 * Busca la ID de una entidad por su ID, slug o code, usando caché de por medio.
	 * Si encuentra la ID en la DB, la guarda en caché antes de devolverla.
	 * @param tableSchema El objeto de esquema de Drizzle para la tabla (e.g., schema.file)
	 * @param idValue El valor a buscar (puede ser ID, slug, o code)
	 * @param searchFields Los campos de la tabla a buscar (e.g., ['id', 'slug', 'code'])
	 * @returns La ID encontrada como string, o null.
	 */
	async getByIdCache(
		// biome-ignore lint/suspicious/noExplicitAny: Generic table schema
		tableSchema: PgTableWithColumns<any>,
		idValue: string | number,
		searchFields: string[],
		cache_time = this.cacheService.CACHE_TIMES.DAYS_7,
	): Promise<string | null> {
		const tableName = tableSchema.meta.name;
		const cacheKey = `${tableName.toLowerCase()}_id:${idValue}`;

		//  Intentamos usar cache por id
		const cachedId = await this.cacheService.get<string>(cacheKey);
		if (cachedId) return cachedId;

		// --- Lógica de Búsqueda en DB (Drizzle) ---
		let idAsNumber: number | string = idValue;
		if (!Number.isNaN(Number(idValue))) {
			idAsNumber = Number(idValue);
		}

		// 2️⃣ Construcción de la cláusula WHERE con Op.or (operador 'or' de Drizzle)
		const conditions = searchFields
			.map((field) => {
				const tableColumn = tableSchema[field];

				if (!tableColumn) {
					// biome-ignore lint/suspicious/noConsole: Legacy support
					console.warn(
						`Field '${field}' not found in Drizzle schema for table '${tableName}'. Skipping.`,
					);
					return isNull(sql`1`); // Devuelve una condición falsa si el campo no existe
				}

				// Drizzle usa 'eq' (equals)
				if (field === "id") {
					// Si el ID es válido numéricamente, lo buscamos. Si no, lo buscamos como 0 para fallar.
					const finalId = Number.isNaN(Number(idValue)) ? 0 : idAsNumber;
					return eq(tableColumn, finalId);
				}

				// Para otros campos (slug, code), buscamos el valor tal cual
				return eq(tableColumn, idValue as string);
			})
			.filter((cond) => !isNull(cond)); // Filtra condiciones que no se pudieron generar

		const whereClause = or(...conditions);

		// 3️⃣ Buscar en DB por id, slug o code
		const [dbResult] = await this.db
			.select({ id: tableSchema.id }) // SELECT id
			.from(tableSchema)
			.where(whereClause)
			.limit(1);

		if (!dbResult) return null;

		const foundId = dbResult.id.toString();

		await this.cacheService.set(cacheKey, foundId, cache_time);

		return foundId;
	}
}

# 🏗️ Backend del Proyecto
> Este archivo no debe ser modificado por ti.
> Lógica específica, convenciones y reglas propias del proyecto.
> Recuerda que docs/rules/_\_.md son el corazón de todo el proyecto, de ahi sacaras toda la información para realizar todo estar 100% fiel a docs/rules/_\_.md
> Recuerda que si sientes que al crear una funcion que se pueda reutilizar usa infrastructure/utils depende de la funcionalidad que quieras reutilizar, psdt si esa funcionalidad solo pertenece a un modulo no la pongas en infrastructure/utils solo en ese modulo, ah y recuerda client y server o hybrid. verifica si existe una funcion similar antes de crearla ejemplo slugify para slug.


## 🏆 REGLAS DE ORO (MANDATORIO)

> [!IMPORTANT]
> Estas reglas NO son negociables. Cualquier código generado DEBE cumplirlas al 100%.
> Los nombres de las carpetas en modules no seran en plurales ejemplo user no users, product no products.
> Tipar todas las variables y cuando tipes usar los Schemas claro si lo necesitas no crear tipos objetos por querer y no poner codigo duro,por ejemplo tiene un select los valores de ese select deben ser tipados del schema, eso se llama no escribir codigo duro.
> usar const y poner en archivo .const.ts
> No harcodear tipos, heredar de los .schemas.ts Pick<ExampleSchema> o Omit<ExampleSchema>, ExampleSchema["field"], pero nunca harcodees tipos osea nada de as "PORTFOLIO_PROJECT" | "BLOG_POST" sino usa ExampleSchema["techeable_type"], es un ejemplo.
> REcuerda que eres una IA si hay codigo que necesitas de un humano para que funcione correctamente,ejemplo pasarela de pago pagos, esa clase de codigo hazlo pero deja un comentario que revise esa parte, deja un comentario Ejemplo: //TODO: Acá revisa use la pasarela de pago de esta api de pagos, pero no estoy seguro que funcione correctamente.
> Por que tu ayudas para cosas repetidas , pero para lógica que es privado o temas personales ahi te pierdes. IMPORTANTE.
> Nunca en los parametros o retorna codigo duro.
> Eliminar imports que no estes usando el archivo.
> Importante al poner los nombres de las clases de servicios, controller,repositories.
Si el archivo se llama example.service.ts , el nombre de la clase de ese servicio se debe llamar class ExampleService{},
Si el archivo se llama example.controller.ts , el nombre de la clase de ese controlador se debe llamar class ExampleController{} y el @controller("examples") debes ponerlo, como dicen en rules-endpoints.md,
Si el archivo se llama example.repository.ts , el nombre de la clase de ese repositorio se debe llamar class ExampleRepository{},
Si el archivo se llama pepito-capo.repository.ts , el nombre de la clase de ese repositorio se debe llamar class PepitoCapoRepository{} u el @Controller("pepito-capo") debes ponerlo NO "pepito/capo" , como dicen en rules-endpoints.md,
> Usar el schema siempre no hardcoear los tipos ,enums ,etc. EJEMPLO

```typescript
// ✅  Correcto
// Incorrecto
body.techeable_type as "PORTFOLIO_PROJECT" | "BLOG_POST";
// Correcto
body.techeable_type as ExampleSchema["techeable_type"];
```

> USAR SOLO en update() de repositories body: Partial<ExampleSchema>, ojo esto es solo exclusivo de update en repository,NO en otros metodos.

```typescript
// ✅  Correcto
async update(
    tenant_id: number,
    id: number,
    body: Partial<ExampleSchema>
  ): Promise<ExampleSchema> {
  }
// ❌ Incorrecto

async update(
    tenant_id: number,
    id: number,
    body: ExampleUpdateDto // incorrecto esto no va en repositories update
  ): Promise<ExampleSchema> {
  }
async updateSetting(
    tenant_id: number,
    id: number,
    body: Partial<ExampleSchema> // aca crear un dto
  ): Promise<ExampleSchema> {
  }


```

> Prioriza usar "satisfies" que "as" en typescript. Importante.
> AL usar zod importarlo desde import { z } from "@infrastructure/config/zod-i18n.config";
> Siempre usar absolute paths al importar un archivo

```typescript
// ✅  Correcto
import exampleSchema from "@modules/example/...";
// ❌ Incorrecto
import exampleSchema from "../../../modules/...";
```

> IMportante

```typescript
// x Incorrecto
async update(
    tenant_id: number,
    id: number,
    body: Partial<ExampleSchema> // Solo en el repositorio update puede ir Partial<ExampleSchema>, ojo esto es solo exclusivo de update en repository

  ): Promise<ExampleSchema> {
    const [result] = await this.db
      .update(exampleEntity)
      .set({ ...body })
      .where(and(eq(exampleEntity.id, id), eq(exampleEntity.tenant_id, tenant_id)))
      .returning();
    return result;
  }
```

### Nomenclatura y Estructura

- **Entidades**: Siempre deben usar el sufijo `Entity`. Ejemplo: `productEntity`, `categoryEntity`.
- **Archivos**: Siempre en minúsculas con guiones si hay varios términos. Ejemplo: `product-item.entity.ts`.
- **DTOs**: En sus propios archivos `*.dto.ts`. No mezclar con schemas de base de datos. Usar `createZodDto` para Swagger, no usar partial .partial en dtos de update.
- **Dtos**: Siempre usa zod en los dtos, no uses classvalidator ni otros.
- **Dtos**: Hay schemas que estan en nullable, pero hay enpoint o formularios que necesitan esa propiedad asi que para que no sea nullable agrega .unwrap()
- **No crear index.ts**: NO crear index.ts en controller,modules,services,dtos,caches,**tests**,seeders,repositories,entities,schemas.

### Entidades (Integridad y Rendimiento)

- **Sintaxis**: No pasar el nombre de la columna como primer parámetro a menos que sea estrictamente necesario. Drizzle infiere el nombre de la propiedad.
- **Relaciones Físicas**: Siempre usar `.references(() => otherEntity.id)` en la columna. Las `relations()` de Drizzle no son suficientes para la integridad de la DB.
- **Unicidad SaaS**: Campos únicos (slug, SKU, email) deben ser únicos **por cliente**. Ejemplo: `unique().on(table.tenant_id, table.slug)`.
- **Índices**: Obligatorio indexar `tenant_id` y cualquier FK usada en filtros o paginación.
- **Timestamps**: `updated_at` si tiene created_at debe tener updated_at.
- **Entidades**: En sus propios archivos cada entidad `*.entity.ts`.

### DTOs de Validación

- **Pick vacío**: Si no vas a seleccionar campos del base schema, **PROHIBIDO** usar `.pick({})`. Usa `querySchema.extend({...})` o `z.object({...})` directamente.

### Lógica de Repositorios (Paginación)

- **Aislamiento**: Todo query de lectura/escritura DEBE filtrar por `tenant_id` como primer parámetro (Tenant Isolation).
- **Paginador**: Implementar paginación híbrida (**Cursor** para performance, **Offset** para flexibilidad).
- **@Query()**: Obligatorio usar un dto query si vas a usar offset y limit

```typescript
// ✅ Correcto
index(@Query()query:ExampleQueryDto){
}
// ❌ Incorrecto
index(@Query("offset",new ParseIntPipe({optional:true}))offset?:number,
@Query("limit",new ParseIntPipe({optional:true}))limit?:number)
```

- **Optimización**: Si viene un `cursor`, OMITIR el conteo total (`count(*)`) para mejorar el rendimiento en tablas grandes.

> **Client vs Server vs Hybrid:**
>
> - `client`: Solo se ejecuta en el cliente (tiene `window`).
> - `server`: Solo se ejecuta en el server (tiene `process.env`, DB).
> - `hybrid`: Se ejecuta en ambos (validaciones puras, formateo de fechas).
> - VARIABLES de entorno en NESTJS

```typescript
@Injectable()
export class ExampleService {
constructor(private configService: ConfigService<Environments>){}

this.configService.get("variable")
}
```

> **Reutilización (DRY):** Evita código repetido. Guárdalo en `utils/client`, `utils/server` o `utils/hybrid`.

```typescript
// ❌ MAL: Función con window en utils/server
// /utils/server/funciones.ts
export function funcionCliente() {
  return localStorage.getItem("token"); // Error en server
}

// ✅ BIEN: Función con window en utils/client
// /utils/client/funciones.ts
export function funcionCliente() {
  return localStorage.getItem("token");
}

// ✅ BIEN: Función de servidor en utils/server
// /utils/server/funciones.ts
export function funcionServer() {
  return process.env.API_KEY;
}
```

> **Fechas:** No uses `Date` o `new Date()` (API nativa JS) para lógica de negocio. Usa `dayjs` importado de `@infrastructure/utils/hybrid/date.utils`.

> **Tipado:** Variables siempre tipadas explícitamente (`const`, `let`).

> **Schema Inheritance:** Siempre `pick`, `omit` o `extend` de un Schema base Zod. No crear propiedades redundantes.

> **Funciones:** Preferir `function name() {}` sobre arrow functions para funciones principales.

```typescript
// ❌ NO (para funciones grandes/top-level)
const onExampleUpdate = (body: ExampleUpdateDto) => { ... }

// ✅ CORRECTO
function onExampleUpdate(body: ExampleUpdateDto) { ... }
```

---

## TypeScript Governance

**Prohibiciones:**

```typescript
// ❌ PROHIBIDO
const data: any = ...
const items = []
type Props = {}

// ✅ CORRECTO
const data: unknown = ...
const items: Item[] = []
interface Props extends BaseProps {}

// ❌ Prohibido Intersecciones manuales (Hardcoded)
type Params = Dto & { id: number };

// ✅ Correcto (Usar Pick del Schema)
type Params = Dto & Pick<UserSchema, "id">;

```

**Imports:**
Los imports siempre deben estare hacia arriba, siempre

```typescript
// ❌ PROHIBIDO (top-level await import)
const fs = await import("node:fs/promises");

// ✅ CORRECTO
import fs from "node:fs/promises";
```

**Tipado Estricto:**

```typescript
// ❌ Tipos mágicos
type Type = "group"; // string genérico

// ✅ Union types explícitos
type Type = "group" | "file";

// ❌ Tipos inline en Generics
const result = customFunction<"users" | "roles">("users");

// ✅ Correcto (Tipo definido afuera y exportado si es necesario)
export type UserViewMode = "users" | "roles";
const result = customFunction<UserViewMode>("users");
```

**Librerías:**

```typescript
// ❌ NO INVENTES TIPOS
icon: FunctionalComponent<any>;

// ✅ USA LOS DE LA LIBRERÍA
icon: LucideIcon;
```

---

**Limpieza y Legibilidad (Clean Code):**

> **REGLA:** Evitar returns inline complejos anidados o con lógica. Usar variables intermedias descriptivas.

```typescript
// ❌ MAL (Difícil de leer/debuggear)
return toNullable(
  await this.cacheService.get<UserSchema>(this.getKey(tenant_id, id)),
);

// ✅ BIEN (Claro y explicito)
const cache = await this.cacheService.get<UserSchema>(
  this.getKey(tenant_id, id),
);
return toNull(cache);
```

---

## 📦 1.1 Stack del Proyecto

```json
{
  "zod": "^4.x",
  "nestjs": "^11.x",
  "astro": "^5.x",
  "drizzle-orm": "^0.45+",
  "vitest": "^4.x",
  "preact": "latest",
  "tailwindcss": "^4.x"
}
```

---

## 1.2 Estructura de Módulos

```
modules/
└── feature/
    ├── utils/
    │   ├── hybrid/
    │   ├── client/
    │   └── server/
    ├── components/      # Componentes Preact
    ├── controllers/     # NestJS Controllers
    ├── services/        # Lógica de negocio
    ├── repositories/    # Acceso a datos (Drizzle)
    ├── modules/         # NestJS Module def
    ├── dtos/            # Zod DTOs + Types
    ├── entities/        # Drizzle schemas
    ├── guards/          # Auth guards
    ├── seeders/         # Seeders
    ├── apis/            # Archivos API client-side
    ├── const/           # Constantes
    ├── schemas/         # Zod Schemas base
    ├── caches/          # Caches
    ├── events/          # Eventos
    ├── listeners/       # Listeners
    └── __tests__/       # Tests (Unit/E2E)
```

### Services

1.  **Alta Cohesión:** Todo lo relacionado a una funcionalidad (ej: `Users`) va en su carpeta.
2.  **Convención :** Controllers y Services usan métodos estándar: `index`, `show`, `store`, `update`, `destroy`. Evitar `findAll`, `getOne`, `create`.
3. ExampleResponseDto (habrá response dtos) y ExampleResponseClassDto (habrá class dtos) diferentes archivos. OBLIGATORIO. NO ES necesario crear archivos por separado por ejemplo example.index.response.dto.ts y example.index.response.class.dto.ts, etc. NO es necesario suficiente example.response.dto.ts y example.response.class.dto.ts.
```typescript
// ✅ Correcto -  convention
@Injectable()
export class ExampleService {
private readonly logger = new Logger(ExampleService.name);

	constructor(
		private readonly exampleRepository: ExampleRepository,
		private readonly exampleCache: ExampleCache,
	) {}
 // esto es un index con paginador, claro si se usa pagina quiere decir que esta entidad tendrá muchos registros
	async index(
    tenant_id: number,
    query?: ExampleQueryDto
  ): Promise<ExampleIndexResponseDto> {
    return await paginator<ExampleQueryDto, ExampleIndexSchema>("/examples", {
      filters: query,
      cb: async (filters, isClean) => {
        // If clean query, try cache first
        if (isClean) {
          // 1. Try Cache
          const cached = await this.exampleCache.getList(tenant_id, filters);
          if (cached) {
            return cached;
          }
        }
        // 2. Try DB
        const result = await this.exampleRepository.index(tenant_id, filters);
        if (isClean) {
          // 3. Set Cache (Only for clean queries)
          await this.exampleCache.setList(tenant_id, filters, result);
        }

        return result;
      },
    });
  }

// index sin paginador, eso quiere decir que esta entidad no habrá un crud para agregar, pero si tiene un store crud para agregar si  o si usar paginacion
  async index(
		tenant_id: number,
	): Promise<ExampleIndexResponseDto> {
		const examples = await this.exampleRepository.index(tenant_id);
		return {success:true, examples};
	}


	async show(
		tenant_id: number,
		id: number,
	): Promise<ExampleShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching example by ID");

		// 1. Try Cache
		let example = await this.exampleCache.get(tenant_id, id);

		if (!example) {
			// 2. Try DB
			example = await this.exampleRepository.showById(tenant_id, id);

			if (!example) {
				this.logger.warn({ tenant_id, id }, "Example not found");
				throw new NotFoundException(`Example #${id} not found`);
			}
			// 3. Set Cache
			await this.exampleCache.set(tenant_id, example);
		}

		return { success: true, example };
	}

	async store(
		tenant_id: number,
		body: ExampleStoreDto,
	): Promise<{ success: true; example: ExampleSchema }> {
		this.logger.log({ tenant_id }, "Creating example");
		const example = await this.exampleRepository.store(tenant_id, body);

    // DONT USE .set()
		await this.exampleCache.invalidateLists(tenant_id);

		return { success: true, example };
	}

	async update(
		tenant_id: number,
		id: number,
		body: ExampleUpdateDto,
	): Promise<ExampleUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating example");
		const example = await this.exampleRepository.update(tenant_id, id, body);

		// Invalidate single + lists
    // DONT USE .set()
		await this.exampleCache.invalidate(tenant_id, id);
		await this.exampleCache.invalidateLists(tenant_id);

		return { success: true, example };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<ExampleDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting example");
		const example = await this.exampleRepository.destroy(tenant_id, id);

		if (!example) {
			this.logger.warn({ tenant_id, id }, "Example not found for deletion");
			throw new NotFoundException(`Example #${id} not found`);
		}

		// Invalidate single + lists
		await this.exampleCache.invalidate(tenant_id, id);
		await this.exampleCache.invalidateLists(tenant_id);

		return { success: true, message: "Example deleted successfully" };
	}

  // index blogs, eso quiere decir que se necesitara los blogs de un example
  async showBlogs(
    tenant_id: number,
    id: number,
    query: ExampleQueryDto,
  ): Promise<ExampleShowBlogsResponseDto> {
    return await paginator<CategoryQueryDto, BlogSchema>(`/example/${id}/blogs`, {
      filters: query,
      cb: async (filters, isClean) => {
        // If clean query, try cache first
        if (isClean) {
          // 1. Try Cache
          const cached = await this.categoryCache.getList(tenant_id, filters);
          if (cached) {
            return cached;
          }
        }
        // 2. Try DB
        const result = await this.exampleRepository.index(tenant_id, filters);
        if (isClean) {
          // 3. Set Cache (Only for clean queries)
          await this.categoryCache.setList(tenant_id, filters, result);
        }

        return result;
      },
    });

  }
```

#### IMPORTANTE al usar cache en un service

Cuando usas cache ejemplo user.cache.ts, esa cache solo debe pertenes al user.service.ts, no debe pertenecer a otro service como el auth.service.ts, o otro service que no tenga relacion con el user.service.ts. Beneficios mas limpio el codigo y no tener los cache en muchos archivos.

Un service debe tener solo servicios, no debe tener otros caches de otros modulos, ni repositorio de otros modulos.
Ejemplo:

```ts
// Correcto
export class AuthService {
  async register(tenant_id: number, registerDto: AuthRegisterDto) {
    this.logger.log(`Registering user: ${registerDto.email}`);

    const existingUser = await this.userService.getByEmailForAuth(
      tenant_id,
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException("El usuario ya está registrado");
    }

    // Create user via UserService
    const username = registerDto.email.split("@")[0];
    const { user } = await this.userService.store(tenant_id, {
      email: registerDto.email,
      username: username,
      password: registerDto.password,
      repeat_password: registerDto.repeat_password,
      role_id: 2, // Default to User
      status: "ACTIVE",
      avatar: null,
      phone_number: registerDto.phone_number,
      google_id: null,
      mfa_secret: null,
    });

    return this.login(user);
  }
}
```

Ejemplo:

```ts
// Correcto: Estas usando cache en su propio service no en otro service como el auth.service.ts
class ExampleService {
  constructor(
    private readonly exampleRepository: ExampleRepository,
    private readonly exampleCache: ExampleCache,
  ) {}

  store(
    tenant_id: number,
    body: ExampleStoreDto,
  ): Promise<{ success: true; example: ExampleSchema }> {
    const example = await this.exampleRepository.store(tenant_id, body);
    await this.exampleCache.invalidateLists(tenant_id);

    return { success: true, example };
  }
}

// ❌ Incorrecto: Estas usando cache en otro service como el other.service.ts, por eso debes crear un service example.service.ts y crear un servicio register y ahi haces el store y usas cache
class OtherService {
  constructor(
    private readonly exampleRepository: ExampleRepository,
    private readonly exampleCache: ExampleCache,
  ) {}

  register(
    tenant_id: number,
    body: ExampleStoreDto,
  ): Promise<{ success: true; example: ExampleSchema }> {
    const example = await this.exampleRepository.store(tenant_id, body); // esto debe estar en exampleService, register por ejemplo
   
    await this.exampleCache.invalidateLists(tenant_id);

    return { success: true, example };
  }
}
```

---

### 1.3 Schemas

```ts
import { z } from "@infrastructure/config/zod-i18n.config";
import { customDateSchema,timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

// ✅ Correcto - con comentarios
export const exampleSchema = z
  .object({
    id: z.number().int().positive(), // identificador único
    name: z.string().min(1).max(100), // nombre
    url: z.url().nullable(), // url de documentación
    age:z.number().int().positive().nullable(),
    enum_axample: z.enum(["frontend"]), // enum
    enabled: z.boolean(), // Estado: true = disponible
    start_date: customDateSchema, // para fechas menos los timestamps usar u
    setting:z.object({is_enabled:boolean()}),
    end_date: customDateSchema,

     documents: z.array(filesSchema()), // para archivos
     images:z.array(filesSchema(UPLOAD_CONFIG.student.images.dimensions)), // para imagenes, UPLOAD_CONFIG le importas de uploads/const/upload.const.ts, para archivos videos, audios, documentos, etc, psdt puede ir vacio si no tiene dimension
    ...timestamps.shape, // no usar merge esto son los timestamps created_at y updated_at
  }).strict(); // agregar strict a los schemas


  export type ExampleSchema = z.infer<typeof exampleSchema>;

  // puedes crear schemas  que se usaran en los repositories, controllers,services,etc.
  export type ProductShowSchema = ExampleSchema &{user:UserCreated,city:CityShowSchema}
------

// ❌ NO usar z.any()


//optional si es valido para query dtos, no para dtos de store y update
// ✅ Correcto  usar nullable y no optional
age:z.number().int().positive().nullable(),
fav_color:z.string().nullable(),



// ❌Incorrecto, No usar optional
age:z.number().int().positive().optional(),
fav_color:z.string().optional(),


----

// No usar default en los schemas, en los entities si puedes usar default
// ✅Correcto,
age:z.number().int().positive(),

// ❌Incorrecto,
age:z.number().int().positive().default(2),


-------
// ✅Correcto cuando usar record en zod, va 2 tipos de datos

documents_submitted: z.record(z.string(),z.number().int())

// ❌Incorrecto
documents_submitted: z.record(z.number().int())

------
// ✅ Correcto para fecha usar customDateSchema
start_date: customDateSchema,

//❌Incorrecto
start_date: z.string().or(z.date()),
birth_date: z.date()
birth_date: z.coerce.date()
-------
// ❌ Sin comentarios
export const exampleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});
-------
// Importante al usar enum o objeto, no lo separes pon todo ahi y cuando usas el enum asi exampleSchema["enum_axample"] y no es necesario crear export type EnumExampleType = exampleSchema["enum_axample"], puede usar exampleSchema["enum_axample"];
LOS enums no se pueden separar de los object tampoco los objetos arrays no deben salir del z.object()

// ✅ Correcto
export const exampleSchema = z.object({
  enum_axample: z.enum(["frontend", "backend"]), // enum
  other_object:z.object({ id:z.number()}) // el otro objeto debe estar dentro del z.object SIEMPRE
});

export type exampleSchema = z.infer<typeof exampleSchema>;

// ❌ Incorrecto

// Los enum ni objetos, objetos ni arrays deben estar afuera del z.schema principal.
const enumExample = z.enum(["frontend", "backend"]);

const otherObject=z.object({id:z.number()})

export const exampleSchema = z.object({
  enum_axample: enumExample,
  other_object:enumExample
});
---------

// ❌Incorrecto
igv: z.string().regex(/^\d+\.?\d*$/).or(z.number())
dni: z.string().regex(/^\d+\.?\d*$/).or(z.number())
ruc: z.string().regex(/^\d+\.?\d*$/).or(z.number())
telephone: z.string().regex(/^\d+\.?\d*$/).or(z.number())
// No poner string() cosas que SON numeros que son decimales que se suman



// ✅ Correcto
igv: z.number()
dni: z.string()
ruc: z.string()
telephone: z.string()

// No poner number() cosas que SON textos como ruc, dni, etc
```


Recuerda que puedes crear schemas personalizados que heredan del schema principal para poder usarlo en todos lados, apis,microservicios,etc, claro el nombre de la schema es personalizado. No puedes crear schemas en otros archivos que no sean .schema.ts

```ts
// example.schema.ts
export const exampleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

export type exampleSchema = z.infer<typeof exampleSchema>;

// Todos los Schemas deben tener su propio archivo que se usaran en las apis SHOW
// Los ExampleShowSchema viene informacion de quien lo creó y información más, claro no va a ir de many to many solo de one to many o ono to one

export type ExampleShowSchema = exampleSchema & {
  address: Pick<AddressSchema, "id" | "street">;
  user: UserCreated; // esto viene de user.schema.ts
};
export type ExampleShowProducts = exampleSchema & {
  products: ProductSchema[];
};
```

TODOS los schemas deben tener su propio archivo .schema.ts

```ts
// ✅ Correcto

export const exampleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

export type exampleSchema = z.infer<typeof exampleSchema>;

// ✅ Correcto puedes agregar mas schemas en el archivo .schema.ts claro solo los que son heredados, ahi esta bien, pero no crear otro schema de zod
export type exampleSchemaOther = exampleSchema & {
  address: Pick<AddressSchema, "id" | "street">;
};
```

```ts
// ❌ Incorrecto ya no agregar mas schemas zod en el archivo .schema.ts, eso en otro archivo.
export const exampleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});
export type exampleSchema = z.infer<typeof exampleSchema>;
export const example2Schema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});
export type example2Schema = z.infer<typeof example2Schema>;
```

Tod
---

## 1.4 Controller Completo (Backend)

- Tos los controllers deben tener un Promise, su propio dto, la cual las apis usaran SIGUIENDO el estandar, por ejemplo `ExampleStoreResponseDto`, ExampleIndexResponseDto, ExampleShowResponseDto,etc etc ya sabes,.
  `@Req() req` debe usarse para acceder a `req.locals` (tenant, usuario).
- En exampleIndexResponseDto usar paginatorSchema const exampleIndexResponseDto = createPaginatorSchema(exampleSchema);


```typescript
import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { ExampleStoreResponseDto } from "../dtos/example.store.response.dto";
import { ExampleQueryClassDto } from "../dtos/example.query.class.dto";
import {
  exampleStoreDto,
  type ExampleStoreDto,
} from "../dtos/example.store.dto";

@ApiTags("Ejemlos") // todos los controlladores,deben tener swagger y en español
@UseGuards(AuthenticatedGuard)
@Controller("examples")
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Public() // usar public para controladores que no requieren autenticacion osea publico
  @Get("/")
  @ApiOperation({ summary: "List examples" })
  index(
    @Req() req: Request,
    @Query() query: ExampleQueryClassDto,
  ): Promise<ExampleIndexResponseDto> {
    //depende si retorn una paginacion será diferente
    // Usar req.locals para contexto
    return this.exampleService.index(req.locals.tenant.id, query);
  }

  @HttpCode(201)
  @Post("/")
  @ApiOperation({ summary: "Create example" })
  @ApiBody({ type: ExampleStoreClassDto })
  store(
    @Req() req: Request,
    @Body(new ZodPipe(exampleStoreDto)) body: ExampleStoreDto,
  ): Promise<ExampleStoreResponseDto> {
    return this.exampleService.store(req.locals.tenant.id, body);
  }
}
```

No poner dto usar body en los controladores

```ts

// ✅ CORRECTO
 store(
    @Body(new ZodPipe(exampleStoreDto)) body: ExampleStoreDto // correcto
  ): Promise<{ success: true; example: ExampleSchema }> {
  }


  //  INCORRECTO, NO poder dto en los controladores, usar body
 store(
    @Body(new ZodPipe(exampleStoreDto)) dto: ExampleStoreDto
  ): Promise<{ success: true; example: ExampleSchema }> {
  }
```

Los controladores deben terminar con un return result, no { success:true,...etc}

```ts
// ✅ CORRECTO
 store(
    @Body(new ZodPipe(exampleStoreDto)) body: ExampleStoreDto // correcto
  ): Promise<ExampleStoreResponseDto> {
    return this.exampleService.store(req.locals.tenant.id, body);
  }

// ❌ INCORRECTO
 store(
    @Body(new ZodPipe(exampleStoreDto)) body: ExampleStoreDto // correcto
  ): Promise<{ success: true; example: ExampleSchema }> {
    return {success:true,example:await this.exampleService.store(req.locals.tenant.id, body)}
  }
```

---

## 1.5 DTOs con Zod v4

**Regla de Oro:** Cada DTO en su propio archivo. Nombre de clase DTO de Swagger en su propio archivo `*.class.dto.ts`. 

```typescript
// ✅ example.store.dto.ts
import { z } from "@infrastructure/config/zod-i18n.config";
import { exampleSchema } from "../schemas/example.schema";

export const exampleStoreDto = exampleSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});
export type ExampleStoreDto = z.infer<typeof exampleStoreDto>;

// ✅ example.update.dto.ts , no usar partial
import { z } from "@infrastructure/config/zod-i18n.config";
import { exampleSchema } from "../schemas/example.schema";

export const exampleUpdateDto = exampleSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});
export type ExampleUpdateDto = z.infer<typeof exampleUpdateDto>;
```

```typescript
// ✅ example.store.class.dto.ts
import { createZodDto } from "nestjs-zod";
import { exampleStoreDto } from "./example.store.dto";

export class ExampleStoreClassDto extends createZodDto(exampleStoreDto) {}
```

**Query DTOs**

```typescript
// ✅ example.query.dto.ts
import { exampleSchema } from "../schemas/example.schema";
import { querySchema } from "@infrastructure/schemas/query.schema";

export const exampleQueryDto = exampleSchema
  .pick({
    category_id: true,
    is_active: true,
  })
  .partial()
  .extend(querySchema.shape);

// Y si no usarás nada por ejemplo no usaras   category_id: true, uis_active: true, etc
export const exampleQueryDto = exampleSchema.pick({}).extend(querySchema.shape); // vacio el pick

export type ExampleQueryDto = z.infer<typeof exampleQueryDto>;
```

NO usar optional en los dtos, puedes usar partial o optional en los queryDtos menos en los Dtos normal cmo exampleStoreDto,exampleUpdateDto

.extend({}) puedes usar cuando vas a usar un valor que no esta en el schema, pero siempre heredar del schema.

```ts
// X Incorrecto
export const ExampleStoreDto = exampleSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({ slug: exampleSchema.shape.exampleSchema.optional() });

//✅ Correcto
export const ExampleStoreDto = exampleSchema.omit({
  id: true,
  slug: true,
  created_at: true,
  updated_at: true,
});
```

// IMPORTANTE: Hay schemas que estan en nullable, pero hay enpoint o formularios que necesitan esa propiedad asi que para que no sea nullable agrega .unwrap()

```ts
export const authRegisterDto = userSchema
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({
    phone_number: userSchema.shape.phone_number.unwrap(), // unwrap lo que hace lo hace requerido
    repeat_password: userSchema.shape.password,
  });
```

**Response DTOs**

- Los response dtos sirven para swagger tambien para retornar los datos, claro los responde dtos pueden ir en el controlador :Promise<> como tambien en los apis mutation<> y query<>.
- response.dto y class.dto diferentes archivos. OBLIGATORIO. 

EJemplo en el siguiente codigo

```ts
// example.response.dto.ts
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { z } from "@infrastructure/config/zod-i18n.config";
import { exampleSchema } from "../schemas/example.schema";

// debe ser fiel al resultado del .service.ts
export const exampleShowResponseDto = createPaginatorSchema(
	exampleSchema.omit({ password: true }),
);

export type ExampleShowResponseDto = z.infer<typeof exampleShowResponseDto>;


// example.response.class.dto.ts
import { createZodDto } from "nestjs-zod";
import { exampleShowResponseDto } from "./example.show.response.dto";

export class ExampleShowResponseClassDto extends createZodDto(
	exampleShowResponseDto,
) {}

// En el controlador show
show(
	@Req() req: Request,
	@Param("id") id: string,
): Promise<ExampleShowResponseClassDto> {
	return this.exampleService.show(req.locals.tenant.id, id);
}
```

---

## 1.6 Repository con Drizzle

1.  **Lógica DB Pura:** El repositorio contiene TODAS las queries. El servicio solo orquesta.
2.  **Naming:** Métodos en inglés (`store`, `showById`, `showByHost`, `index`).
3.  **Retornos Estandarizados:** TODOS los métodos de escritura (`store`, `update`, `destroy`) deben retornar el objeto creado/actualizado directamente (`result`), NO un array.
4.  **Orden de Parámetros MANDATORIO:** En TODOS los métodos (repositories, services, controllers), el orden SIEMPRE debe ser: `tenant_id` → `user_id` (si existe) → `entity_id` → `body`.
5.  **IMPORTANTE SEGUIR CONVENCIÓN** No usar find,get,set,create,delete en los nombres de los metodos
6. No meter logica en los repositories, ejemplo convertir en slugify(), etc, solo consultas de db
7. En store repository body: Omit<ExampleSchema, "id" | "tenant_id"|"created_at" | "updated_at">,
    // Solo en el repositorio store puede ir Omit<ExampleSchema, "id" |"tenant_id"| "created_at" | "updated_at"> en el body ,ojo esto es solo exclusivo de store en repository, SOLO ESOS CAMPOS NO OTROS CAMPOS, SERVICES SE ENCARGARÁ
```typescript
// ✅ CORRECTO
index() // Mostrar todos, claro puedes usasr paginacion o normal, claro hay entidades con millones de datos, ahi si usar paginacion
store() // Crear
showById() // Mostrar un solo por id
showByHost() // Mostrar un solo por host
update() // Actualizar
destroy() // Eliminar

// ❌ Incorrecto
findAll() // Mostrar todos, claro puedes usasr paginacion o normal, claro hay entidades con millones de datos, ahi si usar paginacion
create() // Crear
get() // Mostrar un solo
edit() // Actualizar
delete() // Eliminar
---


// ✅ CORRECTO
showProduct(id: number) // Mostrar un solo producto
showProducts(id: number, query: ExampleQueryDto) // Mostrar todos los productos, puedes usar paginacion o normal,claro hay entidades con millones de datos, ahi si usar paginacion
showUsers(id: number, query: ExampleQueryDto) // Mostrar todos los usuarios

// ❌ Incorrecto

getProducts() // Mostrar todos los productos
getUsers() // Mostrar todos los usuarios
----

// ✅ CORRECTO - USAR show para mostrar un solo registro osea objeto
showById() // Mostrar un solo por id
showByHost() // Mostrar un solo por host
showSetting() // Mostrar setting de la entidad
showProduct() // Mostrar un solo producto de la entidad
showUser() // Mostrar un solo usuario de la entidad

// ❌ Incorrecto
findById()
findByHost()
getSetting()
findProduct()
findUser()

----
// ✅ CORRECTO - USAR store para crear un solo o varios registro  segun sea el caso
store()
storeProducts()
storeUser()

// ❌ Incorrecto
create()
createProduct()
createUser()
add()
addProduct()
addUser()

----
// ✅ CORRECTO - USAR update para crear un solo o varios registro  segun sea el caso
update()
updateProducts()
updateUser()

// ❌ Incorrecto
editProduct()
editUser()
set()
setProducts()
setUser()
----

// ✅ CORRECTO - USAR destroy para eliminar un solo registro osea objeto o varios tambien segun sea el caso
destroy()
destroyProduct()
destroyUser()
destroyUsers()
destroyProducts()

// ❌ Incorrecto
delete()
deleteProduct()
deleteUser()
deleteUsers()
deleteProducts()
```

> [!IMPORTANT] > **Reglas de Retorno de Repositorios:**
>
> - `store()`: DEBE retornar `result` (Single Object)
> - `update()`: DEBE retornar `result` (Single Object)
> - `destroy()`: DEBE retornar `result` (Single Object)
> - `index()`: Retorna `[results, count]` (tupla)
> - `showById()`, `showByHost()`: Retornan el objeto directamente o `null` usando toNull()

```typescript
// ✅ CORRECTO - Store retorna objeto
async store(tenant_id: number, body: Omit<UserSchema, "id" | "created_at" | "updated_at">
// Solo en el repositorio store puede ir Omit<UserSchema, "id" | "created_at" | "updated_at"> en el body ,ojo esto es solo exclusivo de store en repository

): Promise<UserSchema> {
  const [result] = await this.db
    .insert(userEntity)
    .values({ ...body, tenant_id })
    .returning();
  return result;  // Retorna el objeto directo
}

// ✅ CORRECTO - Update retorna objeto
async update(id: number, tenant_id: number, body: Partial<UserSchema> // Solo en el repositorio update() puede ir Partial<UserSchema> en el body, ojo esto es solo exclusivo de update en repository

): Promise<UserSchema> {
  const [result] = await this.db
    .update(userEntity)
    .set({ ...body })
    .where(and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)))
    .returning();
  return result;  // Retorna el objeto directo
}

// ✅ CORRECTO - Destroy retorna objeto
async destroy(id: number, tenant_id: number): Promise<UserSchema> {
  const [result] = await this.db
    .delete(userEntity)
    .where(and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)))
    .returning();
  return result;
}

// ❌ INCORRECTO - No retornar array y tambien es obligatorio usar:Promise< Tipar el resultado
async update(...) {
  const result = ...returning();
  return [result];  // ❌ NO hacer esto
}
```

> [!IMPORTANT] > **Orden de Parámetros en Métodos (MANDATORIO):**
>
> El orden de los parámetros en TODOS los métodos (repositories, services, controllers) SIEMPRE debe seguir esta secuencia:
>
> 1. `tenant_id` (primero, SIEMPRE para multi-tenancy)
> 2. `user_id` (segundo, si el método lo requiere)
> 3. `entity_id` (tercero, ID de la entidad: producto, categoría, etc.)
> 4. `body` (último, DTO con los datos)

```typescript
// ✅ CORRECTO - Orden: tenant_id → entity_id
async showById(tenant_id: number, id: number): Promise<ProductShowSchema | null> {
  const result = await this.db.query.productEntity.findFirst({
    where: and(
      eq(productEntity.tenant_id, tenant_id),
      eq(productEntity.id, id)
    ),
  });
  return toNull(result);
}

// ✅ CORRECTO - Orden: tenant_id → entity_id → body
async update(tenant_id: number, id: number, body: Partial<ProductSchema>
// Solo en el repositorio update puede ir Partial<ProductSchema>  en el body, ojo esto es solo exclusivo de update en repository

): Promise<ProductSchema> {
  const [result] = await this.db
    .update(productEntity)
    .set({ ...body })
    .where(and(eq(productEntity.id, id), eq(productEntity.tenant_id, tenant_id)))
    .returning();
  return result;
}

// ✅ CORRECTO - Orden: tenant_id → user_id → body (cuando se necesita user)
async store(tenant_id: number, user_id: number, body: Omit<ProductSchema, "id" | "created_at" | "updated_at">
// Solo en el repositorio store puede ir Omit<ProductSchema, "id" | "created_at" | "updated_at"> en el body ,ojo esto es solo exclusivo de store en repository

): Promise<ProductSchema> {
  const [result] = await this.db
    .insert(productEntity)
    .values({ ...body, tenant_id, created_by: user_id })
    .returning();
  return result;
}

// ❌ INCORRECTO - tenant_id debe ser primero
async findById(id: number, tenant_id: number) {  // ❌ Mal orden
  // ...
}

// ❌ INCORRECTO - body no debe estar antes de id
async update(tenant_id: number, body: ProductUpdateDto, id: number) {  // ❌ Mal orden
  // ...
}
```

```typescript
@Injectable()
export class ExampleRepository {
  constructor(
    @Inject(DRIZZLE_ORM) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ✅ Ejemplo index con paginación claro será pesonalizado el query pero es un ejemplo
  async index(
    tenant_id: number,
    query: CategoryQueryDto,
  ): Promise<[CategoryIndexSchema[], number]> {
    // Base filters (applied to both Data and Count)
    const baseWhere: SQL[] = [eq(categoryEntity.tenant_id, tenant_id)];
    if (query.search) {
      baseWhere.push(ilike(categoryEntity.name, `%${query.search}%`));
    }
    if (query.is_active !== undefined) {
      baseWhere.push(eq(categoryEntity.is_active, query.is_active));
    }
    if (query.parent_id !== undefined) {
      baseWhere.push(
        query.parent_id === null
          ? isNull(categoryEntity.parent_id)
          : eq(categoryEntity.parent_id, query.parent_id),
      );
    }
    const baseWhereClause = and(...baseWhere);
    // Cursor filter (applied ONLY to Data)
    const cursorWhere: SQL[] = [...baseWhere];
    if (query.cursor) {
      cursorWhere.push(lt(categoryEntity.id, Number(query.cursor)));
    }
    const cursorWhereClause = and(...cursorWhere);

    // Dynamic Sorting
    let orderBy: SQL<unknown>[] = [desc(categoryEntity.id)];
    if (query.sortBy && query.sortDir) {
      const columns = getTableColumns(categoryEntity);
      const column = columns[query.sortBy as keyof typeof columns];
      if (column) {
        orderBy = [query.sortDir === "ASC" ? asc(column) : desc(column)];
      }
    }

    // Check if sorting is compatible with cursor pagination (must be by ID or default)
    const isCursorCompatible =
      !query.sortBy || query.sortBy === "id" || query.sortBy === "created_at";
    const useCursor = query.cursor && isCursorCompatible;

    const result = await Promise.all([
      this.db.query.categoryEntity.findMany({
        limit: useCursor ? query.limit! + 1 : query.limit!, // Fetch one more to check if there is a next page
        offset: useCursor ? undefined : query.offset, // Ensure offset is used when not in cursor mode
        where: useCursor ? cursorWhereClause : baseWhereClause,
        orderBy: orderBy, // Use dynamic orderBy
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(categoryEntity)
        .where(baseWhereClause)
        .then((result) => Number(result[0].count)),
    ]);
    return result;
  }

  // ✅ Ejemplo index sin paginación, si la entidad no tiene muchos datos usarlo
  async index(tenant_id: number): Promise<ExampleIndexSchema[]> {
    const result = await this.db.query.exampleEntity.findMany({
      where: eq(exampleEntity.tenant_id, tenant_id),
    });
    return result;
  }
}
```

Ejemplo de un repositorio avanzado:

- Tipado,
- Limpio
- Escalable

```typescript
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, ilike, lt, or, SQL, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ExampleQueryDto } from "../dtos/example.query.dto";
import type { ExampleStoreDto } from "../dtos/example.store.dto";
import type { ExampleUpdateDto } from "../dtos/example.update.dto";
import { exampleEntity } from "../entities/example.entity";
import type {
  ExampleSchema,
  ExampleShowSchema,
} from "../schemas/example.schema";
import { toNull } from "@infrastructure/utils/server";
import { exampleSettingEntity } from "../entities/example-setting.entity";
import type { ExampleSettingSchema } from "../schemas/example-setting.schema";
import type { ExampleSettingUpdateDto } from "../dtos/example-setting.update.dto";

@Injectable()
export class ExampleRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  // ExampleShowSchema, eso esta en nuestro Schema tipado type ExampleShowSchema = ExampleSchema & { setting: ExampleSettingSchema };, claro si no tiene setting: true relaciones , pues facilmente usar ExampleSchema
  async showByHost(host: string): Promise<ExampleShowSchema | null> {
    const cleanHost = host.split(":")[0];
    const result = await this.db.query.exampleEntity.findFirst({
      where: or(
        eq(exampleEntity.domain, cleanHost),
        eq(exampleEntity.slug, cleanHost.split(".")[0]), // esto solo es un ejemplo
      ),
      with: {
        setting: true,
      },
    });
    return toNull(result); // usar toNull para nullar ya que no quiera que sea undefined
  }

  async showById(id: number): Promise<ExampleShowSchema | null> {
    const result = await this.db.query.exampleEntity.findFirst({
      where: eq(exampleEntity.id, id),
      with: {
        setting: true,
      },
    });
    return toNull(result);
  }

  async index(
    tenant_id: number,
    query: ExampleQueryDto,
  ): Promise<[ExampleSchema[], number]> {
    const {
      limit,
      offset,
      search,
      cursor,
      is_active,
      parent_id,
      sortBy,
      sortDir,
    } = query;
    // Base filters (applied to both Data and Count)
    const baseWhere: SQL[] = [eq(exampleEntity.tenant_id, tenant_id)];
    if (search) {
      baseWhere.push(ilike(exampleEntity.name, `%${search}%`));
    }
    if (is_active !== undefined) {
      baseWhere.push(eq(exampleEntity.is_active, is_active));
    }
    if (parent_id !== undefined) {
      baseWhere.push(
        parent_id === null
          ? isNull(exampleEntity.parent_id)
          : eq(exampleEntity.parent_id, parent_id),
      );
    }
    const baseWhereClause = and(...baseWhere);
    // Cursor filter (applied ONLY to Data)
    const cursorWhere: SQL[] = [...baseWhere];
    if (cursor) {
      cursorWhere.push(lt(exampleEntity.id, Number(cursor)));
    }
    const cursorWhereClause = and(...cursorWhere);

    // Dynamic Sorting
    let orderBy: SQL<unknown>[] = [desc(exampleEntity.id)];
    if (sortBy && sortDir) {
      const columns = getTableColumns(exampleEntity);
      const column = columns[sortBy as keyof typeof columns];
      if (column) {
        orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
      }
    }

    // Check if sorting is compatible with cursor pagination (must be by ID or default)
    const isCursorCompatible =
      !sortBy || sortBy === "id" || sortBy === "created_at";
    const useCursor = cursor && isCursorCompatible;

    const result = await Promise.all([
      this.db.query.exampleEntity.findMany({
        limit: useCursor ? limit! + 1 : limit!, // Fetch one more to check if there is a next page
        offset: useCursor ? undefined : offset, // Ensure offset is used when not in cursor mode
        where: useCursor ? cursorWhereClause : baseWhereClause,
        orderBy: orderBy, // Use dynamic orderBy
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(exampleEntity)
        .where(baseWhereClause)
        .then((result) => Number(result[0].count)),
    ]);
    return result;
  }

  store(
    body: Omit<ExampleSchema, "id" | "tenant_id"|"created_at" | "updated_at">,
    // Solo en el repositorio store puede ir Omit<ExampleSchema, "id" |"tenant_id"| "created_at" | "updated_at"> en el body ,ojo esto es solo exclusivo de store en repository, SOLO ESOS CAMPOS NO OTROS CAMPOS, SERVICES SE ENCARGARÁ
  ): Promise<ExampleSchema> {
    const slug = slugify(body.name);
    return this.db.transaction(async (tx) => {
      const [example] = await tx
        .insert(exampleEntity)
        .values({ ...body, slug })
        .returning();
      await tx.insert(tenantSettingEntity).values({ tenant_id: tenant.id });
      return tenant;
    });
  }

  async update(
    id: number,
    body: Partial<ExampleSchema>,
    // Solo en el repositorio update puede ir Partial<ExampleSchema>, ojo esto es solo exclusivo de update en repository
  ): Promise<ExampleSchema> {
    const [result] = await this.db
      .update(exampleEntity)
      .set(body)
      .where(eq(exampleEntity.id, id))
      .returning();
    return result;
  }

  async destroy(id: number): Promise<ExampleSchema> {
    const [result] = await this.db
      .delete(exampleEntity)
      .where(eq(exampleEntity.id, id))
      .returning();
    return result;
  }

  async showSetting(tenant_id: number): Promise<ExampleSettingSchema | null> {
    const result = await this.db.query.exampleSettingEntity.findFirst({
      where: eq(exampleSettingEntity.tenant_id, tenant_id),
    });
    return toNull(result);
  }

  async updateSetting(
    tenant_id: number,
    body: ExampleSettingUpdateDto,
  ): Promise<ExampleSettingSchema> {
    const [result] = await this.db
      .update(exampleSettingEntity)
      .set(body)
      .where(eq(exampleSettingEntity.tenant_id, tenant_id))
      .returning();
    return result;
  }
}
```

---

## 1.7 Entidades con Drizzle (Nomenclatura Strict)

> **REGLA:** Nombres de variables de entidad deben terminar en `Entity`.

> **REGLA de oro:** Cada entidad debe estar en su propio archivo, no debe mas entidades y no crear un index.ts y poner ahi los entiedades.

> **REGLA:** Poner las entidades y relaciones en el schema.

```ts
// /config/Desktop/01-cut/src/infrastructure/providers/database/database.schema.ts
export interface Schema {
	tenantEntity: typeof tenantEntity;
	tenantSettingEntity: typeof tenantSettingEntity;
	categoryEntity: typeof categoryEntity;
	productEntity: typeof productEntity;
	userEntity: typeof userEntity;
	userEntityRelations: typeof userEntityRelations;
  ...aca tienes que poner todas las entidades y relaciones
}
```

```typescript
// ❌ INCORRECTO
export const users = pgTable("users", { ... });

// ✅ CORRECTO
export const userStatusEnum = pgEnum("user_status_enum", [
  "ACTIVE",
  "BANNED",
  "PENDING",
]);

export const userEntity = pgTable("users", {
  id: serial().primaryKey(),
  tenant_id: integer().notNull().references(() => tenantEntity.id),
  email: varchar({ length: 100 }).notNull(),
    phone_number: varchar({ length: 50 }),
    description: text(), // texto que no tienen limites
      avatar: jsonb().$type<FilesSchema[]>(), // archivos
      address:jsonb().$type<UserSchema["address"]>(), // objetos,arrays
    is_superuser: boolean().notNull().default(false),
      status: userStatusEnum().notNull().default("PENDING"), // así se usa un enum
  // FK física explícita
  role_id: integer().references(() => roleEntity.id),
  updated_at: timestamp().defaultNow().notNull(), // Excepción permitida para Drizzle hook
}, (t) => [
  unique("user_email_tenant_unique").on(t.tenant_id, t.email)
]);

// Usar enum siempre
// ❌ Incorrecto
	scope: varchar({ length: 20 }).$type<"GLOBAL" | "TENANT" | "OWN">().notNull(),

// ✅ Correcto
export const exampleEnum = pgEnum("example_enum", ["GLOBAL", "TENANT", "OWN"]);
{
	example: exampleEnum().notNull(),
}


// No poner nombre en las propiedades
// ✅ Correcto
 id: serial().primaryKey(),
  email: varchar({ length: 100 }).notNull(),

// ❌ Incorrecto
id: serial("id").primaryKey(),// ya no es necesario poner el nombre en las propiedad, dejar vacio ahi
email: varchar("email",{ length: 100 }).notNull(), // ya no es necesario poner el nombre en las propiedad, dejar vacio ahi


// Usa la api de drizzle la ultima version
// ❌ Incorrecto
export const users = pgTable("users", {
    id: integer(),
}, (t) => ({
    idx: index('custom_name').on(t.id)
}));
// ✅ Correcto

export const users = pgTable("users", {
    id: integer(),
}, (t) => [
    index('custom_name').on(t.id)
]);


Igual entities, cada entidad diferente archivos

// ❌ Incorrecto, no puedes tener la misma entidad en el mismo archivo
export const userEntity = pgTable("user", {
    id: integer(),
}
export const user2Entity = pgTable("user2", {
    id: integer(),
}
// ✅ Correcto, cada entidad diferente archivo
// user.entity.ts
export const userEntity = pgTable("user", {
    id: integer(),
}, (t) => [
    index('custom_name').on(t.id)
]);
// user2.entity.ts
export const user2Entity = pgTable("user2", {
    id: integer(),
});
```

Ejemplo avanzado de una entidad, de como usar enums, objetos,files,booleanos,fechas,etc, indices,etc

```ts
import { decimalCustom } from "@infrastructure/utils/server/decimal.utils";
import { categoryEntity } from "@modules/categories/entities/category.entity";
import { tenantEntity } from "@modules/tenants/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { now } from "@infrastructure/utils/hybrid";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

const timezoneEnum = pgEnum("timezone_enum", [
  "UTC",
  "America/Lima",
  "America/New_York",
]);
export const productEntity = pgTable(
  "products",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 200 }).notNull(),
    description: text(),
    sku: varchar({ length: 50 }).notNull(),
    barcode: varchar({ length: 50 }),
    price: decimalCustom("price").notNull(),
    compare_price: decimalCustom("compare_price"),
    timezone: timezoneEnum().notNull(),
    cost: decimalCustom("cost"),
    stock: integer().notNull(),
    min_stock: integer().notNull(),
    images: jsonb().$type<FilesSchema[]>().notNull(),
    is_active: boolean().notNull(),
    is_featured: boolean().notNull(),
    category_id: integer()
      .notNull()
      .references(() => categoryEntity.id),
    tenant_id: integer()
      .notNull()
      .references(() => tenantEntity.id),
    created_at: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updated_at: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now().toDate()),
  },
  (table) => [
    // SIempre comentar que hace estos indices
    index("products_tenant_idx").on(table.tenant_id),
    index("products_category_idx").on(table.category_id),
    unique("products_tenant_slug_unique").on(table.tenant_id, table.slug),
    unique("products_tenant_sku_unique").on(table.tenant_id, table.sku),

    // aca puede ir checks, mas indices,indices compuestos, mas buenas practicas de optimizacion y seguridad si es posible agregar, etc
  ],
);

export const productEntityRelations = relations(productEntity, ({ one }) => ({
  tenant: one(tenantEntity, {
    fields: [productEntity.tenant_id],
    references: [tenantEntity.id],
  }),
  category: one(categoryEntity, {
    fields: [productEntity.category_id],
    references: [categoryEntity.id],
  }),
}));

// Importante en cada entidad debe tener este tipado fuerte, psdt nunca se usará solo estará aca para que el tipado sea fuerte, pero no se usar a en otros archivos
export type ProductEntity = Entity<
  ProductSchema,
  InferSelectModel<typeof productEntity>
>;
```

## 1.8 Relaciones

```typescript
import {
    pgTable,
    serial,
    text,
    integer,
    primaryKey,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla Básica
// user.entity.ts
export const users = pgTable("users", {
    id: serial().primaryKey(),
    name: text().notNull(),
}); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Relación 1:1 (User <-> Profile) UNO a UNO
// profile.entity.ts
export const profiles = pgTable("profiles", {
    id: serial().primaryKey(),
    bio: text(),
    user_id: integer()
        .references(() => users.id)
        .unique(), // unique() fuerza 1:1
}); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Relaciones para Users
// user.entity.ts
export const usersEntityRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.user_id],
  }),
  ...aca ira varias relaciones
}));
// Relaciones para Profiles
// profile.entity.ts
export const profilesEntityRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.user_id],
    references: [users.id],
  }),
}));

//Como usarlo
const result = await db.query.users.findFirst({
  with: {
    profile: true,
  },
});

const profileWithUser = await db.query.profiles.findFirst({
  with: { user: true }
});

-----
// Relación 1:N (User <-> Posts) UNO a MUCHOS
// post.entity.ts
export const postEntity = pgTable(
    "post",
    {
        id: serial().primaryKey(),
        title: text(),
        author_id: integer().references(() => users.id),
    },
    (table) => [index("title_idx").on(table.title), index("user_title_idx").on(table.author_id, table.title)]  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes
);
// post.entity.ts
export const postEntityRelations = relations(postEntity, ({ one }) => ({
  author: one(userEntity, { // Cada post tiene un solo autor
    fields: [postEntity.authorId],
    references: [userEntity.id],
  }),
}));

// user.entity.ts
export const userEntityRelations = relations(userEntity, ({ one, many }) => ({
  ...aca ira varias relaciones
  posts: many(postEntity),
}));

// asi se obtiene los posts con el autor 1:N
const allPosts = await db.query.postEntity.findMany({
  with: {
    author: true,
  },
});

-------
// Relación N:M (Post <-> Category) mediante Tabla Intermedia, MUCHOS a MUCHOS
// category.entity.ts
export const categoryEntity = pgTable("category", {
    id: serial().primaryKey(),
    name: text(),
});  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes


// post-category.entity.ts
export const postCategoryEntity = pgTable(
    "post_category",
    {
        postId: integer().references(() => postEntity.id),
        categoryId: integer().references(() => categoryEntity.id),
    },
    (t) => [primaryKey({ columns: [t.postId, t.categoryId] })]  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes
);

export const postCategoryEntityRelations = relations(postCategoryEntity, ({ one }) => ({
  post: one(postEntity, { fields: [postCategoryEntity.postId], references: [postEntity.id] }),
  category: one(categoryEntity, { fields: [postCategoryEntity.categoryId], references: [categoryEntity.id] }),
}));


// category.entity.ts
export const categoryEntityRelations = relations(categoryEntity, ({ one, many }) => ({
  ...aca ira varias relaciones si tiene mas
  postCategories: many(postCategoryEntity), // esta bien que termines en es, por que es mucho si fuera uno pues terminar category
}));

export const postEntityRelations = relations(postEntity, ({ one, many }) => ({
  ...aca ira varias relaciones si tiene mas
  postCategories: many(postCategoryEntity),
}));



// Como obtenerlo
const studentWithCourses = await db.query.studentEntity.findFirst({
  with: {
    // 1. Entramos a la tabla intermedia
    enrollments: {
      with: {
        // 2. Desde la intermedia, entramos a la tabla final
        course: true

        // Consulta con filtros
        //course: {
        //  where: (courseEntity, { eq }) => eq(courseEntity.status, 'active')
        //}
      }
    }
  }
});
// limpiar la respuesta
const cleanCourses = studentWithCourses?.enrollments.map(e => e.course);
-------
// Relación Self-Referencing
// employee.entity.ts
export const employeeEntity = pgTable("employee", {
  id: serial().primaryKey(),
  name: text().notNull(),
  // Esta columna apunta a la misma tabla 'employees'
  managerId: integer().references(() => employeeEntity.id),
});
export const employeeEntityRelations = relations(employeeEntity, ({ one, many }) => ({
  // Relación "hacia arriba": Un empleado tiene un mánager (One)
  manager: one(employeeEntity, {
    fields: [employeeEntity.managerId],
    references: [employeeEntity.id],
    relationName: "management", // Nombre único para evitar confusión
  }),
  // Relación "hacia abajo": Un mánager tiene muchos subordinados (Many)
  subordinates: many(employeeEntity, {
    relationName: "management", // Debe coincidir con el nombre de arriba
  }),
}));

// como obtenerlo
const employee = await db.query.employeeEntity.findFirst({
  with: {
    manager: true,
  },
});
const boss = await db.query.employeeEntity.findFirst({
  where: eq(employeeEntity.name, "Elon Musk"),
  with: {
    subordinates: true,
  },
});


-----
// Relacion  One-to-One (1:1) Polimórfico
const targetTypeEnum = pgEnum("target_type_enum", ["post", "video", "product"]);
export const metadata = pgTable("metadata", {
  id: serial().primaryKey(),
  extra_info: text(),
  parent_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(), // target_type, examplet_type es segun la entidad
}, (table) => [
  // Esto obliga a que la combinación (tipo + id) sea ÚNICA en toda la tabla.
  uniqueIndex("metadata_target_unique_idx").on(table.target_type, table.parent_id),
]);  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Como usarlo
const result = await db.query.metadata.findFirst({
  where: (metadata, { and, eq }) => and(
    eq(metadata.target_type, 'post'),
    eq(metadata.parent_id, 5)
  ),
});

-------

// Relacion  One-to-Many (1:N) Polimórfico

export const targetTypeEnum = pgEnum("target_type_enum", ["post", "video", "product"]);

export const commentEntity = pgTable("comment", {
  id: serial().primaryKey(),
  content: text().notNull(),
  parent_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(),
}, (table) => [
  // 3. ÍNDICE COMPUESTO PARA VELOCIDAD MÁXIMA
  index("comment_target_idx").on(table.target_type, table.parent_id),
]); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// como obtenerlo
const postComments = await db.query.commentEntity.findMany({
  where: (commentEntity, { and, eq }) => and(
    eq(commentEntity.target_type, 'post'),
    eq(commentEntity.parent_id, 10)
  ),
  orderBy: (commentEntity, { desc }) => [desc(commentEntity.id)], // Los más nuevos primero
});


-------
// Relacion  One-to-Many (N:M) Polimórfico
export const taggableEntity = pgTable("taggable", {
  tag_id: integer().notNull().references(() => tagEntity.id),
  target_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(), // "article" | "product"
}, (table) => [
  // PK COMPUESTA: Indexación automática al más alto nivel
  primaryKey({ columns: [table.tag_id, table.target_id, table.target_type] }),
  // ÍNDICE EXTRA: Para buscar rápidamente todos los tags de un objeto específico
  index("taggable_target_idx").on(table.targetType, table.targetId),
]);

```

---

## Transacciones

```typescript
await db.transaction(async (tx) => {
  await tx.insert(postEntity).values({
    title: "New Post",
    content: "Content of the new post",
  });
  await tx.insert(commentEntity).values({
    content: "Comment on the new post",
    parent_id: 1,
    target_type: "post",
  });
});
```

## 1.9 Debugging & Logging

Usar `this.logger` (Pino), nunca `console.l
og`.

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async store(tenant_id: number, body: UserStoreDto): Promise<UserSchema> {
    this.logger.log({ email: body.email }, "Creating user");
    // ...
  }
}
```

---

## 1.10 Testing Best Practices

> [!IMPORTANT] > **Reglas de Testing MANDATORIAS:**
>
> 1. **NO USAR `any`** - Usar siempre `Schema` o `DTO` tipado

```typescript
// ✅ Correcto
const dto: ExampleDto = {
    name: "John Doe",
    email: "john.doe@example.com",
    tenant_id: 1,
    role_id: 1,
    is_active: true,
    security_stamp: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date(),
    updated_at: new Date(),
};

// ❌ Incorrecto
const dto: any = {
    name: "John Doe",
    email: "john.doe@example.com",
    tenant_id: 1,
    role_id: 1,
    is_active: true,
    security_stamp: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date(),
    updated_at: new Date(),
};

.values({    } as any)
```

> 2. **Nomenclatura** - Variables de entrada se llaman `body` (nunca `dto`, `data`)
> 3. **Constantes Globales** - Usar `TENANT_ID`, `USER_ID` en lugar de números mágicos (1, 2, 3)
> 4. **DRY Principle** - Reutilizar fixtures y helpers
> 5. **Completitud** - Mock objects con TODAS las propiedades del Schema

Buenas practicas al hacer testing

. 🏗️ Arquitectura & Entorno
Aislamiento Estricto (Env Isolation):
Separación total entre .env (desarrollo) y
.env.test
(testing).
Implementamos lógica en
AppConfigModule
para cargar dinámicamente el archivo correcto según NODE_ENV, evitando accidentes catastróficos (como borrar la DB de producción).
Base de Datos Real (Real Persistence Testing):
Cero mocks para la base de datos. Usamos PostgreSQL real. Esto garantiza que tus queries SQL, transacciones, foreign keys y constraints funcionan de verdad.
Elimina la categoría de bugs "Funciona en el test pero falla en producción". 2. 🧹 Gestión de Estado (State Management)
Limpieza Determinista (Database Truncation):
Antes de cada suite, ejecutamos TRUNCATE ... RESTART IDENTITY.
Garantiza que el ID siempre empiece en 1. Sin esto, los tests se volverían "flaky" (aleatorios) después de varias ejecuciones.
Seeding Automático:
El script
setup-test-db.ts
inyecta automáticamente los datos mínimos necesarios (Tenant "localhost") para que la aplicación arranque, simulando un entorno pre-configurado. 3. 🏭 Patrones de Diseño
Factory Pattern (
UserFactory
):
En lugar de repetir { email: "test@test.com", password: "123" } en 50 archivos, centralizamos la creación de objetos en
UserFactory
.
Si mañana el campo password cambia a pass_hash, solo cambias 1 archivo, no 50.
Single Responsibility en Tests:
Cada archivo E2E prueba un solo módulo (User, Tenant, Auth), pero interactúa con todo el sistema. 4. ⚡ Performance & Estabilidad
Serial Execution Strategy:
Configuramos fileParallelism: false conscientemente para evitar race conditions y deadlocks en la base de datos única. Priorizamos estabilidad sobre velocidad (aunque sigue siendo rapidísimo: ~3.5s).
Connection Pooling Eficiente:
Reutilizamos la conexión a la base de datos dentro de cada archivo de test en lugar de abrir una por
it()
, reduciendo el overhead de TCP. 5. 🛠️ CI/CD Readiness
Comandos Atómicos (npm scripts):
Creamos db:push:test para preparar el entorno de test sin intervención manual. Esto permite que Jenkins, GitHub Actions o GitLab CI corran tus tests con un solo comando: pnpm test:e2e:db.
Silent Fail-Safe:
El sistema de limpieza (
setup-test-db.ts
) maneja errores si la tabla no existe, permitiendo que el primer run en un entorno virgen no explote.

- Recuerda usar los tipos de los Dtos
- Ya no es necesario importar vitest por que ya esta global
- Recuerda reutilizar los testing DRY si es posible, como el siguiente ejemplo

```typescript

describe("Contact (E2E)", () => {
	let app: INestApplication;
	let tenantId: number;

	beforeAll(async () => {
		const db = await setupTestDb(); // Prepara la base de datos para los tests
		tenantId = await seedLocalhostTenant(db); // Crea el tenant localhost

		app = await setupE2EApp(); // Inicializa la aplicación para los tests
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});
}}
```

```typescript
❌ Incorrecto
import { describe, it, expect, beforeAll, afterAll } from "vitest";// ya no es necesario
```

```typescript
// ✅ CORRECTO - Testing con mejores prácticas
const TENANT_ID = 1; // Constante global al inicio del archivo
```

- Generación de Datos (Factory Pattern)
  ❌ Incorrecto (Hardcoding) Riesgo: Si corres el test dos veces, falla porque el email ya existe.

```typescript
it("should create user", async () => {
  // ❌ Mal: Datos fijos
  const dto = {
    email: "admin@test.com",
    password: "123",
    username: "admin",
  };
  await request(app).post("/users").send(dto);
});
```

✅ Correcto (Factory Dinámica) Beneficio: Genera datos únicos (user_174...) en cada ejecución.

```typescript
import { UserFactory } from "./user.factory";
it("should create user", async () => {
  // ✅ Bien: Datos aleatorios y válidos
  const dto = UserFactory.createDto();
  await request(app).post("/users").send(dto);
});
```

- Simulación de Multi-Tenancy
  ❌ Incorrecto (Ignorar el Tenant) Riesgo: El middleware rechazará la petición o usará el tenant por defecto incorrecto.

```typescript
it("should get users", async () => {
  // ❌ Mal: Falta el header Host, la app no sabe quién eres
  const response = await request(app).get("/users");
  expect(response.status).toBe(500); // Falla
});
```

✅ Correcto (Header Explícito) Beneficio: Simula una petición real de un dominio específico.

```typescript
it("should get users", async () => {
  // ✅ Bien: Decimos explícitamente "Soy localhost"
  const response = await request(app).get("/users").set("Host", "localhost"); // <--- Clave

  expect(response.status).toBe(200);
});
```

- Dependency Injection (Mocks)
  ❌ Incorrecto (Depender de infra externa) Riesgo: Si Redis no está levantado en tu PC, el test falla.

```typescript
// ❌ Mal: Usar el CacheService real que intenta conectar a Redis

import { AppModule } from "@/app.module";
// ... builder.createTestingModule({ imports: [AppModule] }).compile();
✅ Correcto (Override estratégico) Beneficio: Testea la lógica de negocio sin necesitar Redis real.
```

```typescript
// ✅ Bien: Reemplazar servicios de infraestructura pesada
const mockCache = { get: async () => null, set: async () => {} };
const module = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(CacheService) // <--- Override
  .useValue(mockCache) // <--- Mock en memoria
  .compile();
```

- Aserciones (Expects)

❌ Incorrecto (Vago) Riesgo: La API devuelve { error: "Algo pasó" } (Status 200 por error) y el test pasa falsamente.

```typescript
it("should return user", async () => {
  const res = await request(app).get("/users/1");
  // ❌ Mal: Solo mirar el status no garantiza que los datos estén bien
  expect(res.status).toBe(200);
});
```

✅ Correcto (Estricto) Beneficio: Asegura que el contrato JSON se cumple.

```typescript
it("should return user", async () => {
  const res = await request(app).get("/users/1");

  expect(res.status).toBe(200);
  // ✅ Bien: Verificar estructura y datos
  expect(res.body.success).toBe(true);
  expect(res.body.user.id).toBe(1);
  expect(res.body.user.email).toBeDefined();
});
```

- Configuración de Entorno
  ❌ Incorrecto (Configuración dispersa) Riesgo: Si cambias la DB de test, tienes que editar 20 archivos.

```typescript
// ❌ Mal: Cargar .env manualmente en cada archivo
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
describe("User Test", ...);
```

✅ Correcto (Centralizado y Limpio) Beneficio: El test es agnóstico de la configuración.

```typescript
// ✅ Bien: Importar helpers centrales, cero configuración aquí
import { setupTestDb } from "@infrastructure/setup-test-db";
describe("User Test", () => {
  beforeAll(async () => await setupTestDb());
  // ...
});
```

## 1.11 Rendimiento

```typescript
// ----- Queries de Base de Datos
// ❌ MAL - N+1 queries
const examples = await db.query.examples.findMany();
for (const example of examples) {
  example.posts = await db.query.posts.findMany({
    where: eq(posts.exampleId, example.id),
  });
}

// ✅ BIEN - Una sola query con join
const examples = await db.query.examples.findMany({
  with: { posts: true },
});

// No usar for of al insertar mucho datos , usa map
//✅ BIEN -
db.insert(table).values(data.map((item) => ({ ...item, tenant_id })))

// ❌ MAL -
for (const item of data) {
  await db.insert(table).values({ ...item, tenant_id });
}


// usa bulkcreateNestRelations cuando es avanzado inserciones, ES mucho mas rapido, usar cuando  tiene mas de 1 nivel de relación

await this.databaseService.bulkCreateWithNestedRelations(
  // 1️⃣ CONFIGURACIÓN PRINCIPAL (tabla raíz)
  {
    table: schema.countryEntity,        // Tabla padre
    data: this.seeder.map(c => ({       // Datos con hijos anidados
      code: c.dial_code,
      name: c.name,
      regions: c.regions,               // 👈 Hijos incluidos aquí
    })),
    excludeFields: ["regions"],         // No insertar este campo (es relación)
    beforeCreate: (country) => ({...}), // Hook para transformar
  },
  // 2️⃣ RELACIONES (niveles de anidación)
  [
    {
      childrenField: "regions",         // Campo que contiene los hijos
      foreignKeyField: "country_id",    // FK a asignar en los hijos
      config: {
        table: schema.region,
        excludeFields: ["cities"],      // Excluir el siguiente nivel
        beforeCreate: (region, _index, parent) => ({
          ...region,
          country_id: parent?.id,       // 👈 Asigna FK del padre
        }),
      },
    },
    {
      childrenField: "cities",          // Segundo nivel
      foreignKeyField: "region_id",
      config: {
        table: schema.city,
        beforeCreate: (city, _index, parent) => ({
          ...city,
          region_id: parent?.id,
        }),
      },
    },
  ],
  tx, // 3️⃣ Transacción opcional
);


//  -----  Evitar Memory Leaks

// ❌ MAL - Event listener sin cleanup
onModuleInit() {
    this.emitter.on('event', this.handler);
}

// ✅ BIEN - Cleanup en destroy
onModuleDestroy() {
    this.emitter.off('event', this.handler);
}


//  -----  Async/Await ParaleloInit

// ❌ LENTO - Secuencial
const example = await getexample(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// ✅ RÁPIDO - Paralelo
const [example, posts, comments] = await Promise.all([
  getexample(id),
  getPosts(id),
  getComments(id),
]);
-----
// ✅ Usar Logger con contexto
this.logger.debug(
  {
    exampleId,
    action: "login",
    ip: req.ip,
    duration: `${Date.now() - start}ms`,
  },
  "Login successful"
);

// ✅ Error con stack trace
try {
  await riskyOperation();
} catch (error) {
  this.logger.error(
    {
      error: error instanceof Error ? error.message : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
      context: { exampleId },
    },
    "Operation failed"
  );
  throw error;
}


// -----  Usar fs/promises fs.readFile (callback)
// ⚠️ Regular Funciona, pero el código se vuelve desordenado.
// fs.readFileSync (síncrono) ❌ No Bloquea todo el programa. Úsalo solo en scripts de inicio simples.
// fs/promises (await) ✅ Sí Es limpio, moderno y eficiente.
```

### 1.12 Middleware.ts

```typescript
export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const locals =
    PUBLIC_ENV === "development"
      ? JSON.parse(context.request.headers.get("x-astro-locals") || "{}")
      : context.locals;
  Object.assign(context.locals, locals);

  //  asi puedes usar middleware para acceder y todo eso
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
```

### MIDLEWARE GOBAL

```typescript
@Injectable()
export class InitialCacheMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // aca poner siempre los que se merecen ser cacheados siempre, ejemplo empresa merece ser cacheado por que siempre estara en todos lados , example igualmente, mas ejemplos compañia, cosas que se usen en todos lados y no cambian mucho, eso CACHEAR, cuidado con , aqui si puedes enviar cosas delicadas como contraseñas o datos sensibles por que esto corre en el servidor
    // Recuerda tipar eso en infrastructure/types/request.d.ts Global

    req.locals = {
      user: req.user as exampleAuth, // esto ya lo puede usar en los COntroladores @Req()req:Request imporstar Request de express
    };

    return next();
  }
}
```

### 1.13 Cache

this.cacheService.CACHE_TIMES // usar el tiempo segun el movimiento de la entidad, si la entidad cambia demasiado, usar menos tiempo, si la entidad cambia poco, usar mas tiempo Buenas practicas, El siguiente es un buen ejemplo de como usar cache nivel avanzado

Importante siempre usar CacheService, ya que es el nucleo se podría decir.

```typescript
import { Injectable } from "@nestjs/common";
import { CacheService } from "@infrastructure/providers/cache/cache.service";
import type { UserSchema } from "../schemas/user.schema";
import { toNull } from "@infrastructure/utils/server";

@Injectable()
export class UserCache {
  private readonly PREFIX = "user";

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Genera la key de caché con aislamiento multi-tenant
   */
  private getKey(tenant_id: number, id: number): string {
    return `${this.PREFIX}:${tenant_id}:${id}`;
  }

  /**
   * Obtiene un usuario del caché
   */
  async get(tenant_id: number, id: number): Promise<UserSchema | null> {
    const cache = await this.cacheService.get<UserSchema>(
      this.getKey(tenant_id, id),
    );
    return toNull(cache);
  }

  /**
   * Guarda un usuario en el caché
   */
  async set(tenant_id: number, user: UserSchema): Promise<void> {
    await this.cacheService.set(
      this.getKey(tenant_id, user.id),
      user,
      this.cacheService.CACHE_TIMES.HOUR,
    );
  }

  /**
   * Invalida un usuario específico del caché
   */
  async invalidate(tenant_id: number, id: number): Promise<void> {
    await this.cacheService.del(this.getKey(tenant_id, id));
  }

  /**
   * Invalida todos los usuarios de un tenant
   */
  async invalidateByTenant(tenant_id: number): Promise<void> {
    const pattern = `${this.PREFIX}:${tenant_id}:*`;
    await this.cacheService.deleteByPattern(pattern);
  }
}
```

Como usarlo

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userCache: UserCache,
  ) {}

  async show(
    id: number,
    tenant_id: number,
  ): Promise<UserShowResponseDto> {
    this.logger.log({ id }, "Fetching user by ID");

    // 1. Try Cache
    let user = await this.userCache.get(tenant_id, id);

    if (!user) {
      // 2. Try DB
      user = await this.userRepository.findById(tenant_id, id);

      if (!user) {
        this.logger.warn({ id }, "User not found");
        throw new NotFoundException(`User #${id} not found`);
      }
      // 3. Set Cache
      await this.userCache.set(tenant_id, user);
    }
    return { success: true, user };
  }

  async store(
    tenant_id: number,
    body: UserStoreDto,
  ): Promise<UserStoreResponseDto> {
    this.logger.log({ email: body.email }, "Creating new user");
    const { password, ...rest } = body;
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Repository returns UserSchema object directly
    const user = await this.userRepository.store(
      {
        ...rest,
        password: password_hash,
      },
      tenant_id,
    );

    await this.userCache.invalidateLists(tenant_id);

    return { success: true, user };
  }

  async update(
    id: number,
    tenant_id: number,
    body: UserUpdateDto,
  ): Promise<UserUpdateResponseDto> {
    this.logger.log({ id }, "Updating user");

    // Repository returns UserSchema object directly
    const user = await this.userRepository.update(id, tenant_id, body);

    // Cache Invalidation
    await this.userCache.invalidate(tenant_id, id);

    return { success: true, user };
  }

  async destroy(
    id: number,
    tenant_id: number,
  ): Promise<UserDestroyResponseDto> {
    this.logger.log({ id }, "Deleting user");
    await this.userRepository.destroy(id, tenant_id);

    // Cache Invalidation
    await this.userCache.invalidate(tenant_id, id);

    return { success: true, message: "User deleted successfully" };
  }
}
```

### 1.14 Archivos

SI una entidad tiene FileSchema[], insertarlo aca abajo entidad y la propiedad,
Si es una imagen poner dimension,
...UPLOAD_RULES.avatar, // el tipo de archivo si es imagen puedes escoger avatar o banner,etc.

```typescript
// aca poner tu schema para tipar fuerte
export type EntityFileProperty = keyof OnlyFiles<
  UserSchema & ProductSchema & TenantSchema
>;

// aca la configuracion de esa propiedad tipo FileSchema[], cuantos archivos,folders, dimensiones si es imagen,etc.
export const UPLOAD_CONFIG: Record<
  EntityFile,
  Partial<Record<EntityFileProperty, UploadConfig>>
> = {
  user: {
    photo: {
      ...UPLOAD_RULES.avatar,
      dimensions: [DIMENSION_IMAGE.xs, DIMENSION_IMAGE.md],
      folder: "users",
      max_files: 1,
    },
    wallpaper: {
      ...UPLOAD_RULES.banner,
      dimensions: [DIMENSION_IMAGE.xs, DIMENSION_IMAGE.md],
      folder: "users",
      max_files: 1,
    },
  },
};
```

### 1.15 SEEDER BACKEND

- de todos mis modulos schemas ,. crea un seeder de cada 1000 datos claro respetando si usan fk , pór que hay datos del seed que necesita una entidad ya sabes, psdt usa fakerjs psdt si hay algo que no esta en faker js usa otro de internet psdt se fiel a las imagenes, propiedades de las entidades que te diga, etc. b.insert(schema.socialMedia).values(soc ?? no crees que es mejor usar bulkcreate por eso he credo en bulkCreateWithNestedRelations

bulkCreateWithNestedRelations. tambien lo puedes usar en otro servicios no solo para seeder para optiomizacion.

los seeder no crees un const mejor private readonly

- agrega mas de 100 en los seeders

```ts
import { now } from "@infrastructure/utils/hybrid"	;

@Injectable()
export class UserSeeder {
  private readonly data : Omit<UserSchema, "id">[] = Array.from({}).map(()=>{}) // aca la data si no tienes parametros que usar
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id:number,role_id:number) {
		// Password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("Dokixd123@", salt);

    // los datos pueden estar asi si necesitas información en el run para pasarlo al seeder
		const usersSeed: Omit<UserSchema, "id">[] = await Promise.all(
			Array.from({ length: 100 }).map(
				async (_, i): Promise<Omit<UserSchema, "id">> => {
					const user_name = `${faker.person.firstName()}${faker.person.lastName()}-${
						i + 1
					}`;
					return {
						code: `USER-${i + 1}`,
						documento: "12345678",
						documento_code: "01",
            tenant_id:,role_id,
						... mas información,
						created_at: now().toDate(),
						updated_at: now().toDate(),
						deleted_at: null,
					};
				},
			),
		);
    // esto es importante para subir
		return await this.db.insert(userEntity).values(usersSeed).returning();
	}
}
```

### 1.16 EVENTOS

Aquí tienes una tabla resumen rápida para tomar la decisión correcta al diseñar tu arquitectura en NestJS

| Caso de Uso                                   | ¿Usar Eventos? | Razón Principal                           |
| :-------------------------------------------- | :------------: | :---------------------------------------- |
| **Efectos Secundarios** (Emails, Push)        |   ✅ **SÍ**    | Si falla, no rompe el flujo principal.    |
| **Dependencia de Datos** (Necesito respuesta) |   ❌ **NO**    | Los eventos no retornan valores.          |
| **Procesos Pesados** (PDFs, Excel)            |   ✅ **SÍ**    | Libera la respuesta al usuario rápido.    |
| **Transacciones Críticas** (Pagos, Dinero)    |   ❌ **NO**    | Difícil manejo de errores y rollback.     |
| **Desacoplar Módulos** (Romper ciclos)        |   ✅ **SÍ**    | Evita dependencias circulares.            |
| **Flujo Secuencial** (Paso 1 → 2 → 3)         |   ❌ **NO**    | Crea "código espagueti" difícil de leer.  |
| **Auditoría / Analytics**                     |   ✅ **SÍ**    | Tareas de fondo que no deben bloquear.    |
| **Extensibilidad** (Nuevas features)          |   ✅ **SÍ**    | Agregas funciones sin tocar código viejo. |

### 1.16 Innecesario

```typescript
// ❌ Innecesario en los controladores, en otros archivos ya esta controlado
if (!req.locals.tenant)
  throw new BadRequestException("Tenant context not found");
```

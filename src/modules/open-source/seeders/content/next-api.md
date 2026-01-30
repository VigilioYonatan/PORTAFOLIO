### ENGLISH (EN)

# @vigilio/next-api

Next.js API routes are simple, but as projects grow, they often become a mess of switch statements and manual validation boilerplate. `@vigilio/next-api` introduces a declarative, class-based architecture to Next.js APIs, allowing you to build scalable, maintainable, and type-safe backends effortlessly.

## 🌟 Core Features

- **Standard Decorators**: Use `@Get`, `@Post`, `@Put`, `@Delete` to define routes.
- **Dependency Injection**: Decouple logic with `@Injectable` services.
- **Integrated Validation**: Seamlessly use `@vigilio/valibot` via `@Validator` and `@Pipe` decorators.
- **Exception Handling**: Standardized HTTP exception classes (e.g., `NotFoundException`).
- **Formidable Support**: Built-in `@Upload` decorator for easy file handling.

---

## 📥 Installation

```bash
pnpm add @vigilio/next-api @vigilio/valibot path-to-regexp
```

### TypeScript Configuration

Ensure your `tsconfig.json` supports decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## 🏗️ Architecture Example

### 1. Define a Service

Services handle your business logic and database interactions.

```typescript
import { Injectable, NotFoundException } from "@vigilio/next-api";

@Injectable()
export class ProductsService {
  async findById(id: string) {
    const product = await DB.products.findUnique(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }
}
```

### 2. Create the Controller

Controllers handle incoming requests and map them to service methods.

```typescript
import {
  Get,
  Param,
  Post,
  Body,
  Validator,
  Controller,
} from "@vigilio/next-api";

@Controller("/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("/:id")
  async show(@Param("id") id: string) {
    return await this.productsService.findById(id);
  }

  @Post("/")
  @Validator(createProductDto)
  async store(@Body() body: CreateProductDto) {
    return await this.productsService.create(body);
  }
}
```

### 3. Register the Handler

In your Next.js API file (e.g., `pages/api/[[...params]].ts`):

```typescript
import { createHandler } from "@vigilio/next-api";

export default createHandler([ProductsController], true);
```

---

## 🛡️ Middlewares and Security

You can create custom middleware decorators using `createMiddlewareDecorator`.

```typescript
const JwtAuthGuard = createMiddlewareDecorator((req, res, next) => {
    const token = req.headers.authorization;
    if (!isValid(token)) throw new UnauthorizedException("Invalid Token");
    next();
});

// Usage in controller
@Get("/secret")
@JwtAuthGuard()
getSecretData() { ... }
```

---

## 📤 File Uploads

Integrated support for `formidable` allows for clean file handling without manual stream parsing.

```typescript
@Post("/upload")
@Upload() // Injects files into req.files
async uploadFile(@Req() req) {
    const files = req.files;
    return { success: true, count: files.length };
}
```

---

## 📄 HTTP Exceptions Table

| Class                          | Status Code | Use Case                                     |
| :----------------------------- | :---------- | :------------------------------------------- |
| `BadRequestException`          | 400         | Validation errors or invalid input.          |
| `UnauthorizedException`        | 401         | Missing or invalid auth credentials.         |
| `ForbiddenException`           | 403         | User does not have permission.               |
| `NotFoundException`            | 404         | Resource does not exist.                     |
| `ConflictException`            | 409         | Resource already exists or version conflict. |
| `InternalServerErrorException` | 500         | Unexpected failures.                         |

---

## 💡 Best Practices

1. **Keep Controllers Lean**: Only handle request parsing and response returning. Delegate all business logic to Services.
2. **Use Pipes for Params**: Use `@Pipe` to validate URL parameters like `id` (e.g., ensuring it is a valid UUID or existing record).
3. **Global Headers**: You can customize global headers and CORS settings within the `createHandler` options.

---

### ESPAÑOL (ES)

# @vigilio/next-api

Las rutas API de Next.js son simples, pero a medida que los proyectos crecen, a menudo se convierten en un lío de sentencias switch y boilerplate de validación manual. `@vigilio/next-api` introduce una arquitectura declarativa basada en clases para las APIs de Next.js, permitiéndote construir backends escalables, mantenibles y con tipos seguros sin esfuerzo.

## 🌟 Características Principales

- **Decoradores Estandár**: Usa `@Get`, `@Post`, `@Put`, `@Delete` para definir rutas.
- **Inyección de Dependencias**: Desacopla la lógica con servicios `@Injectable`.
- **Validación Integrada**: Usa `@vigilio/valibot` sin problemas a través de los decoradores `@Validator` y `@Pipe`.
- **Manejo de Excepciones**: Clases de excepción HTTP estandarizadas (ej., `NotFoundException`).
- **Soporte para Formidable**: Decorador `@Upload` integrado para un manejo fácil de archivos.

---

## 🏗️ Ejemplo de Arquitectura

### 1. Define un Servicio

Los servicios manejan tu lógica de negocio e interacciones con la base de datos.

```typescript
import { Injectable, NotFoundException } from "@vigilio/next-api";

@Injectable()
export class ProductsService {
  async findById(id: string) {
    const product = await DB.products.findUnique(id);
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }
}
```

### 2. Crea el Controlador

Los controladores manejan las solicitudes entrantes y las mapean a los métodos del servicio.

```typescript
import {
  Get,
  Param,
  Post,
  Body,
  Validator,
  Controller,
} from "@vigilio/next-api";

@Controller("/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("/:id")
  async show(@Param("id") id: string) {
    return await this.productsService.findById(id);
  }

  @Post("/")
  @Validator(createProductDto)
  async store(@Body() body: CreateProductDto) {
    return await this.productsService.create(body);
  }
}
```

### 3. Registra el Handler

En tu archivo de API de Next.js (ej., `pages/api/[[...params]].ts`):

```typescript
import { createHandler } from "@vigilio/next-api";

export default createHandler([ProductsController], true);
```

---

## 🛡️ Middlewares y Seguridad

Puedes crear decoradores de middleware personalizados usando `createMiddlewareDecorator`.

```typescript
const JwtAuthGuard = createMiddlewareDecorator((req, res, next) => {
  const token = req.headers.authorization;
  if (!isValid(token)) throw new UnauthorizedException("Token Inválido");
  next();
});

// Uso en el controlador
@Get("/secret")
@JwtAuthGuard()
getSecretData() { ... }
```

---

## 📤 Carga de Archivos

Soporte integrado para `formidable` que permite un manejo limpio de archivos sin parsing manual de streams.

```typescript
@Post("/upload")
@Upload() // Inyecta archivos en req.files
async uploadFile(@Req() req) {
    const files = req.files;
    return { success: true, count: files.length };
}
```

---

## 📄 Tabla de Excepciones HTTP

| Clase                          | Código de Estado | Caso de Uso                                          |
| :----------------------------- | :--------------- | :--------------------------------------------------- |
| `BadRequestException`          | 400              | Errores de validación o entrada inválida.            |
| `UnauthorizedException`        | 401              | Credenciales de autenticación faltantes o inválidas. |
| `ForbiddenException`           | 403              | El usuario no tiene permiso.                         |
| `NotFoundException`            | 404              | El recurso no existe.                                |
| `ConflictException`            | 409              | El recurso ya existe o conflicto de versión.         |
| `InternalServerErrorException` | 500              | Fallos inesperados.                                  |

---

## 💡 Mejores Prácticas

1. **Manten los Controladores Limpios**: Solo maneja el parsing de la solicitud y el retorno de la respuesta. Delega toda la lógica de negocio a los Servicios.
2. **Usa Pipes para Parámetros**: Usa `@Pipe` para validar parámetros de URL como `id` (ej., asegurando que es un UUID válido o un registro existente).
3. **Cabeceras Globales**: Puedes personalizar las cabeceras globales y la configuración de CORS dentro de las opciones de `createHandler`.

---

### PORTUGUÊS (PT)

# @vigilio/next-api

As rotas de API do Next.js são simples, mas conforme os projetos crescem, elas frequentemente se tornam uma bagunça de declarações switch e boilerplate de validação manual. O `@vigilio/next-api` introduz uma arquitetura declarativa baseada em classes para as APIs do Next.js, permitindo que você construa backends escaláveis, fáceis de manter e com tipos seguros sem esforço.

## 🌟 Recursos Principais

- **Decoradores Padrão**: Use `@Get`, `@Post`, `@Put`, `@Delete` para definir rotas.
- **Injeção de Dependências**: Desacople a lógica com serviços `@Injectable`.
- **Validação Integrada**: Use o `@vigilio/valibot` perfeitamente através dos decoradores `@Validator` e `@Pipe`.
- **Tratamento de Exceções**: Classes de exceção HTTP padronizadas (ex., `NotFoundException`).
- **Suporte a Uploads**: Decorador `@Upload` integrado para manipulação fácil de arquivos.

---

## 🏗️ Exemplo de Arquitetura

### 1. Definir um Serviço

Os serviços lidam com sua lógica de negócios e interações com o banco de dados.

```typescript
import { Injectable, NotFoundException } from "@vigilio/next-api";

@Injectable()
export class ProductsService {
  async findById(id: string) {
    const product = await DB.products.findUnique(id);
    if (!product) throw new NotFoundException(`Produto ${id} não encontrado`);
    return product;
  }
}
```

### 2. Criar o Controller

Os controladores lidam com as solicitações recebidas e as mapeiam para os métodos de serviço.

```typescript
import {
  Get,
  Param,
  Post,
  Body,
  Validator,
  Controller,
} from "@vigilio/next-api";

@Controller("/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("/:id")
  async show(@Param("id") id: string) {
    return await this.productsService.findById(id);
  }

  @Post("/")
  @Validator(createProductDto)
  async store(@Body() body: CreateProductDto) {
    return await this.productsService.create(body);
  }
}
```

### 3. Registrar o Handler

No seu arquivo de API do Next.js (ex., `pages/api/[[...params]].ts`):

```typescript
import { createHandler } from "@vigilio/next-api";

export default createHandler([ProductsController], true);
```

---

## 🛡️ Middlewares e Segurança

Você pode criar decoradores de middleware personalizados usando `createMiddlewareDecorator`.

```typescript
const JwtAuthGuard = createMiddlewareDecorator((req, res, next) => {
  const token = req.headers.authorization;
  if (!isValid(token)) throw new UnauthorizedException("Token Inválido");
  next();
});

// Uso no controller
@Get("/secret")
@JwtAuthGuard()
getSecretData() { ... }
```

---

## 📤 Upload de Arquivos

O suporte integrado para `formidable` permite um manuseio limpo de arquivos sem a necessidade de parsing manual de streams.

```typescript
@Post("/upload")
@Upload() // Injeta arquivos em req.files
async uploadFile(@Req() req) {
    const files = req.files;
    return { success: true, count: files.length };
}
```

---

## 📄 Tabela de Exceções HTTP

| Classe                         | Código de Status | Caso de Uso                                        |
| :----------------------------- | :--------------- | :------------------------------------------------- |
| `BadRequestException`          | 400              | Erros de validação ou entrada inválida.            |
| `UnauthorizedException`        | 401              | Credenciais de autenticação ausentes ou inválidas. |
| `ForbiddenException`           | 403              | O usuário não tem permissão.                       |
| `NotFoundException`            | 404              | O recurso não existe.                              |
| `ConflictException`            | 409              | O recurso já existe ou há conflito de versão.      |
| `InternalServerErrorException` | 500              | Falhas inesperadas.                                |

---

## 💡 Melhores Práticas

1. **Mantenha os Controllers Enxutos**: Lide apenas com o parsing de requisições e retorno de respostas. Delegue toda a lógica de negócios para os Serviços.
2. **Use Pipes para Parâmetros**: Use `@Pipe` para validar parâmetros de URL como `id` (ex., garantindo que seja um UUID válido ou um registro existente).
3. **Cabeçalhos Globais**: Você pode personalizar cabeçalhos globais e configurações de CORS nas opções do `createHandler`.

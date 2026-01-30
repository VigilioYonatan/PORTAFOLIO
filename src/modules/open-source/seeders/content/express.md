### ENGLISH (EN)

# @vigilio/express

`@vigilio/express` is a powerful, decorator-based framework built on top of Express.js. It brings the power of TypeScript decorators and dependency injection to your Express applications, allowing for a highly structured, scalable, and readable code base. Inspired by NestJS but maintaining the lightweight nature of Express, it simplifies the way you define routes, handle middleware, and manage dependencies.

## 🚀 Why @vigilio/express?

- **Declarative Routing**: Define your API structure using intuitive decorators like `@Controller`, `@Get`, and `@Post`.
- **Dependency Injection**: Seamlessly manage your services and their dependencies using the integrated DI module.
- **Middleware Made Easy**: Easily attach class-based or function-based middleware to controllers or specific routes.
- **Type Safety**: Leverage the full power of TypeScript for request parameters, bodies, and responses.

---

## 📥 Installation

```bash
pnpm add @vigilio/express express @vigilio/di
```

---

## 🛠️ API Reference

### Functions

| Function                                      | Description                                                      |
| :-------------------------------------------- | :--------------------------------------------------------------- |
| `attachControllers(app, controllers)`         | Attaches controller classes to an Express application or router. |
| `attachControllerInstances(app, controllers)` | Attaches already existing controller instances.                  |

### Decorators

#### Class Decorators

- `@Controller(baseUrl: string, middleware?: Middleware[])` - Registers a class as a controller for a specific base URL.

#### Method Decorators (Routes)

All standard HTTP methods are supported:

- `@Get(url: string, middleware?: Middleware[])` - GET requests.
- `@Post(url: string, middleware?: Middleware[])` - POST requests.
- `@Put(url: string, middleware?: Middleware[])` - PUT requests.
- `@Delete(url: string, middleware?: Middleware[])` - DELETE requests.
- `@Patch(url: string, middleware?: Middleware[])` - PATCH requests.
- `@Options(url: string, middleware?: Middleware[])` - OPTIONS requests.
- `@Head(url: string, middleware?: Middleware[])` - HEAD requests.
- `@Status(code: number)` - Specifies status code for the route.

#### Parameter Decorators

Inject Express-specific objects directly into your method arguments:

- `@Request(property?: string)` (alias `@Req`) - Injects the Request object or a specific property.
- `@Response()` (alias `@Res`) - Injects the Response object.
- `@Next()` - Injects the `next()` function.
- `@Params(param?: string)` - Injects `req.params` or a specific parameter.
- `@Query(param?: string)` - Injects `req.query` or a specific query param.
- `@Body(param?: string)` - Injects `req.body` or a specific body field.
- `@Headers(property?: string)` - Injects `req.headers` or a specific header.
- `@Cookies(param?: string)` - Injects `req.cookies` or a specific cookie.

---

## 🛡️ Middleware Implementation

You can use both class-based and function-based middleware.

### Class-based Middleware

Implement the `Middleware` interface for structured middleware logic.

```typescript
import { Middleware } from "@vigilio/express";
import { Request, Response, NextFunction } from "express";

class UserMiddleware implements Middleware {
  public use(request: Request, response: Response, next: NextFunction): void {
    console.log("User middleware triggered");
    next();
  }
}
```

### Error Middleware

Handle errors globally or specifically using `ErrorMiddleware`.

```typescript
import { Container, ErrorMiddleware, ERROR_MIDDLEWARE } from "@vigilio/express";

@Injectable()
class ServerErrorMiddleware implements ErrorMiddleware {
  public use(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    next();
  }
}

Container.provide([
  { provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware },
]);
```

---

## 🧪 Dependency Injection & Custom Decorators

### Dependency Injection Example

```typescript
import {
  Injectable,
  Controller,
  Get,
  attachControllers,
} from "@vigilio/express";
import express from "express";

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: "John Doe" }];
  }
}

@Controller("/users")
class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  getAll() {
    return this.userService.getUsers();
  }
}

const app = express();
attachControllers(app, [UserController]);
app.listen(3000);
```

### Custom Decorators

You can create custom decorators for middleware or metadata.

```typescript
import { attachMiddleware } from "@vigilio/express";

export function Access(key: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    attachMiddleware(target, propertyKey, (req, res, next) => {
      if (["CAN_ACCESS_TEST", "CAN_ACCESS_HOME"].includes(key)) {
        next();
      } else {
        res.send("ACCESS DENIED");
      }
    });
  };
}
```

---

### ESPAÑOL (ES)

# @vigilio/express

`@vigilio/express` es un potente framework basado en decoradores construido sobre Express.js. Aporta el poder de los decoradores de TypeScript y la inyección de dependencias a tus aplicaciones Express, permitiendo una base de código altamente estructurada, escalable y legible. Inspirado en NestJS pero manteniendo la naturaleza ligera de Express, simplifica la forma en que defines rutas, manejas middlewares y gestionas dependencias.

## 🚀 ¿Por qué @vigilio/express?

- **Enrutamiento Declarativo**: Define la estructura de tu API usando decoradores intuitivos como `@Controller`, `@Get` y `@Post`.
- **Inyección de Dependencias**: Gestiona sin problemas tus servicios y sus dependencias usando el módulo DI integrado.
- **Middleware Simplificado**: Adjunta fácilmente middleware basado en clases o funciones a controladores o rutas específicas.
- **Seguridad de Tipos**: Aprovecha todo el poder de TypeScript para parámetros de solicitud, cuerpos y respuestas.

---

## 📥 Instalación

```bash
pnpm add @vigilio/express express @vigilio/di
```

---

## 🛠️ Referencia de la API

### Funciones

| Función                                       | Descripción                                                      |
| :-------------------------------------------- | :--------------------------------------------------------------- |
| `attachControllers(app, controllers)`         | Adjunta clases de controlador a una aplicación o router Express. |
| `attachControllerInstances(app, controllers)` | Adjunta instancias de controlador ya existentes.                 |

### Decoradores

#### Decoradores de Clase

- `@Controller(baseUrl: string, middleware?: Middleware[])` - Registra una clase como controlador para una URL base específica.

#### Decoradores de Método (Rutas)

Todos los métodos HTTP estándar están soportados:

- `@Get(url: string, middleware?: Middleware[])` - Solicitudes GET.
- `@Post(url: string, middleware?: Middleware[])` - Solicitudes POST.
- `@Put(url: string, middleware?: Middleware[])` - Solicitudes PUT.
- `@Delete(url: string, middleware?: Middleware[])` - Solicitudes DELETE.
- `@Patch(url: string, middleware?: Middleware[])` - Solicitudes PATCH.
- `@Options(url: string, middleware?: Middleware[])` - Solicitudes OPTIONS.
- `@Head(url: string, middleware?: Middleware[])` - Solicitudes HEAD.
- `@Status(code: number)` - Especifica el código de estado para la ruta.

#### Decoradores de Parámetros

Inyecta objetos específicos de Express directamente en los argumentos de tu método:

- `@Request(property?: string)` (alias `@Req`) - Inyecta el objeto Request o una propiedad específica.
- `@Response()` (alias `@Res`) - Inyecta el objeto Response.
- `@Next()` - Inyecta la función `next()`.
- `@Params(param?: string)` - Inyecta `req.params` o un parámetro específico.
- `@Query(param?: string)` - Inyecta `req.query` o un parámetro de consulta específico.
- `@Body(param?: string)` - Inyecta `req.body` o un campo específico del cuerpo.
- `@Headers(property?: string)` - Inyecta `req.headers` o un encabezado específico.
- `@Cookies(param?: string)` - Inyecta `req.cookies` o una cookie específica.

---

## 🛡️ Implementación de Middleware

Puedes usar middleware basado tanto en clases como en funciones.

### Middleware basado en Clases

Implementa la interfaz `Middleware` para una lógica de middleware estructurada.

```typescript
import { Middleware } from "@vigilio/express";
import { Request, Response, NextFunction } from "express";

class UserMiddleware implements Middleware {
  public use(request: Request, response: Response, next: NextFunction): void {
    console.log("Middleware de usuario activado");
    next();
  }
}
```

### Middleware de Error

Maneja errores global o específicamente usando `ErrorMiddleware`.

```typescript
import { Container, ErrorMiddleware, ERROR_MIDDLEWARE } from "@vigilio/express";

@Injectable()
class ServerErrorMiddleware implements ErrorMiddleware {
  public use(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    next();
  }
}

Container.provide([
  { provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware },
]);
```

---

## 🧪 Inyección de Dependencias y Decoradores Personalizados

### Ejemplo de Inyección de Dependencias

```typescript
import {
  Injectable,
  Controller,
  Get,
  attachControllers,
} from "@vigilio/express";
import express from "express";

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: "John Doe" }];
  }
}

@Controller("/users")
class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  getAll() {
    return this.userService.getUsers();
  }
}

const app = express();
attachControllers(app, [UserController]);
app.listen(3000);
```

### Decoradores Personalizados

Puedes crear decoradores personalizados para middleware o metadatos.

```typescript
import { attachMiddleware } from "@vigilio/express";

export function Access(key: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    attachMiddleware(target, propertyKey, (req, res, next) => {
      if (["CAN_ACCESS_TEST", "CAN_ACCESS_HOME"].includes(key)) {
        next();
      } else {
        res.send("ACCESO DENEGADO");
      }
    });
  };
}
```

---

### PORTUGUÊS (PT)

# @vigilio/express

`@vigilio/express` é um framework poderoso baseado em decoradores, construído sobre o Express.js. Ele traz o poder dos decoradores TypeScript e da injeção de dependências para suas aplicações Express, permitindo uma base de código altamente estruturada, escalável e legível. Inspirado no NestJS, mas mantendo a natureza leve do Express, ele simplifica a maneira como você define rotas, lida com middlewares e gerencia dependências.

## 🚀 Por que @vigilio/express?

- **Roteamento Declarativo**: Defina a estrutura de sua API usando decoradores intuitivos como `@Controller`, `@Get` e `@Post`.
- **Injeção de Dependências**: Gerencie perfeitamente seus serviços e suas dependências usando o módulo DI integrado.
- **Middleware Facilitado**: Anexe facilmente middlewares baseados em classes ou funções a controladores ou rotas específicas.
- **Tipagem Segura**: Aproveite todo o poder do TypeScript para parâmetros de requisição, corpos e respostas.

---

## 📥 Instalação

```bash
pnpm add @vigilio/express express @vigilio/di
```

---

## 🛠️ Referência da API

### Funções

| Função                                        | Descrição                                                         |
| :-------------------------------------------- | :---------------------------------------------------------------- |
| `attachControllers(app, controllers)`         | Anexa classes de controlador a um aplicativo ou roteador Express. |
| `attachControllerInstances(app, controllers)` | Anexa instâncias de controlador já existentes.                    |

### Decoradores

#### Decoradores de Classe

- `@Controller(baseUrl: string, middleware?: Middleware[])` - Registra uma classe como um controlador para uma URL base específica.

#### Decoradores de Método (Rotas)

Todos os métodos HTTP padrão são suportados:

- `@Get(url: string, middleware?: Middleware[])` - Requisições GET.
- `@Post(url: string, middleware?: Middleware[])` - Requisições POST.
- `@Put(url: string, middleware?: Middleware[])` - Requisições PUT.
- `@Delete(url: string, middleware?: Middleware[])` - Requisições DELETE.
- `@Patch(url: string, middleware?: Middleware[])` - Requisições PATCH.
- `@Options(url: string, middleware?: Middleware[])` - Requisições OPTIONS.
- `@Head(url: string, middleware?: Middleware[])` - Requisições HEAD.
- `@Status(code: number)` - Especifica o código de status para a rota.

#### Decoradores de Parâmetros

Injete objetos específicos do Express diretamente nos argumentos do seu método:

- `@Request(property?: string)` (alias `@Req`) - Injete o objeto Request ou uma propriedade específica.
- `@Response()` (alias `@Res`) - Injete o objeto Response.
- `@Next()` - Injete a função `next()`.
- `@Params(param?: string)` - Injete `req.params` ou um parâmetro específico.
- `@Query(param?: string)` - Injete `req.query` ou um parâmetro de query específico.
- `@Body(param?: string)` - Injete `req.body` ou um campo específico do corpo.
- `@Headers(property?: string)` - Injete `req.headers` ou um cabeçalho específico.
- `@Cookies(param?: string)` - Injete `req.cookies` ou um cookie específico.

---

## 🛡️ Implementação de Middleware

Você pode usar middleware baseado em classes e baseado em funções.

### Middleware Baseado em Classe

Implemente a interface `Middleware` para uma lógica de middleware estruturada.

```typescript
import { Middleware } from "@vigilio/express";
import { Request, Response, NextFunction } from "express";

class UserMiddleware implements Middleware {
  public use(request: Request, response: Response, next: NextFunction): void {
    console.log("Middleware de usuário acionado");
    next();
  }
}
```

### Middleware de Erro

Lide com erros globalmente ou especificamente usando `ErrorMiddleware`.

```typescript
import { Container, ErrorMiddleware, ERROR_MIDDLEWARE } from "@vigilio/express";

@Injectable()
class ServerErrorMiddleware implements ErrorMiddleware {
  public use(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    next();
  }
}

Container.provide([
  { provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware },
]);
```

---

## 🧪 Injeção de Dependência e Decoradores Personalizados

### Exemplo de Injeção de Dependência

```typescript
import {
  Injectable,
  Controller,
  Get,
  attachControllers,
} from "@vigilio/express";
import express from "express";

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: "John Doe" }];
  }
}

@Controller("/users")
class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  getAll() {
    return this.userService.getUsers();
  }
}

const app = express();
attachControllers(app, [UserController]);
app.listen(3000);
```

### Decoradores Personalizados

Você pode criar decoradores personalizados para middleware ou metadados.

```typescript
import { attachMiddleware } from "@vigilio/express";

export function Access(key: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    attachMiddleware(target, propertyKey, (req, res, next) => {
      if (["CAN_ACCESS_TEST", "CAN_ACCESS_HOME"].includes(key)) {
        next();
      } else {
        res.send("ACESSO NEGADO");
      }
    });
  };
}
```

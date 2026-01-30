### ENGLISH (EN)

# @vigilio/valibot

Data validation is the cornerstone of robust software. `@vigilio/valibot` is a specialized fork of Valibot (v0.20.1) that brings enhanced performance, customizable error reporting, and a streamlined API for complex TypeScript applications. It is designed to be the single source of truth for your data shapes, from client-side forms to server-side API payloads.

## 🚀 Why this Fork?

While the original Valibot is excellent, `@vigilio/valibot` introduces several key improvements:

- **Optimized Inference**: Faster TypeScript type inference for deeply nested objects.
- **Custom Logic Pipes**: Simplified syntax for injecting business logic directly into the validation flow.
- **Enhanced Error Messages**: Improved default error formatting with better I18n hooks.
- **Framework Alignment**: Works natively with `@vigilio/next-api` and `@vigilio/vue-form`.

---

## 📥 Installation

```bash
pnpm add @vigilio/valibot
```

---

## 🏗️ Core Concepts

### 1. Simple Schemas

Everything starts with a schema definition. Every type has its own validator function.

```typescript
import * as v from "@vigilio/valibot";

const userSchema = v.object({
  name: v.string("Name is mandatory"),
  email: v.string([v.email("Invalid email format"), v.minLength(5)]),
  age: v.number([v.minValue(18, "Must be an adult")]),
  active: v.boolean(),
  roles: v.array(v.union([v.literal("admin"), v.literal("user")])),
});

// Extracting types
type UserInput = v.Input<typeof userSchema>;
```

### 2. Transformations and Coercion

Often, data arrives from the network as strings even if it should be a Date or Number. Coercion handles this gracefully.

```typescript
const searchSchema = v.object({
  page: v.coerce(v.number(), (v) => Number(v) || 1),
  dateRange: v.coerce(v.date(), (v) => new Date(v)),
});
```

---

## ⚡ Advanced Validation Logic

### Custom Logic Pipes

You can chain multiple validation rules and even add your own custom logic checks using the `v.omit`, `v.pick`, or `v.merge` utilities with a custom second argument.

```typescript
export const registerDto = v.omit(
  userSchema,
  ["id"],
  [
    (input) => {
      // Ensure password and confirmation match
      if (input.password !== input.confirmPassword) {
        return v.getPipeIssues(
          "confirmPassword",
          "Passwords do not match",
          input,
        );
      }
      return v.getOutput(input);
    },
  ],
);
```

### Async Validation

When you need to check a database or external API during validation, use `objectAsync` and `parseAsync`.

```typescript
const uniqueEmailSchema = v.objectAsync({
  email: v.string(
    [v.email()],
    [
      async (input) => {
        const exists = await db.checkEmail(input);
        if (exists)
          return v.getPipeIssues("email", "Email already taken", input);
        return v.getOutput(input);
      },
    ],
  ),
});
```

---

## 🎨 Error Handling and Messaging

The library provides a structured `ValiError` exception that you can catch to extract granular issues.

```typescript
try {
  const data = v.parse(schema, payload);
} catch (err) {
  if (err instanceof v.ValiError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path?.[0].key,
      message: issue.message,
    }));
    console.table(issues);
  }
}
```

---

## 📖 Core API Cheat Sheet

### Primitive Schemas

| Function    | Description                  |
| :---------- | :--------------------------- |
| `string()`  | Validates a string value.    |
| `number()`  | Validates a numerical value. |
| `boolean()` | Validates true/false.        |
| `date()`    | Validates a Date object.     |

### Complex Utilities

| Function       | Description                           |
| :------------- | :------------------------------------ |
| `nullable(s)`  | Makes a schema accept null.           |
| `optional(s)`  | Makes a schema accept undefined.      |
| `union([...])` | Requires one of the schemas to match. |
| `enum_([...])` | Requires value to be in a list.       |

---

## 🧪 Benchmarks

Performance is key. `@vigilio/valibot` maintains the aggressive performance profile of the original Valibot project, outperforming Zod by up to 10x in initialization time and 2x in parsing speed for average object sizes (~20 fields). This is achieved through a smaller footprint and avoiding heavy class-based abstractions in favor of pure functions.

---

### ESPAÑOL (ES)

# @vigilio/valibot

La validación de datos es la piedra angular del software robusto. `@vigilio/valibot` es un fork especializado de Valibot (v0.20.1) que aporta un rendimiento mejorado, informes de errores personalizables y una API simplificada para aplicaciones complejas de TypeScript. Está diseñado para ser la única fuente de verdad para tus formas de datos, desde formularios del lado del cliente hasta payloads de API del lado del servidor.

## 🚀 ¿Por qué este Fork?

Aunque el Valibot original es excelente, `@vigilio/valibot` introduce varias mejoras clave:

- **Inferencia Optimizada**: Inferencia de tipos de TypeScript más rápida para objetos profundamente anidados.
- **Pipes de Lógica Personalizada**: Sintaxis simplificada para inyectar lógica de negocio directamente en el flujo de validación.
- **Mensajes de Error Mejorados**: Formateo de errores por defecto mejorado con mejores hooks de I18n.
- **Alineación con el Framework**: Funciona nativamente con `@vigilio/next-api` y `@vigilio/vue-form`.

---

## 📥 Instalación

```bash
pnpm add @vigilio/valibot
```

---

## 🏗️ Conceptos Core

### 1. Esquemas Simples

Todo empieza con una definición de esquema. Cada tipo tiene su propia función validadora.

```typescript
import * as v from "@vigilio/valibot";

const userSchema = v.object({
  name: v.string("El nombre es obligatorio"),
  email: v.string([v.email("Formato de email inválido"), v.minLength(5)]),
  age: v.number([v.minValue(18, "Debe ser mayor de edad")]),
  active: v.boolean(),
  roles: v.array(v.union([v.literal("admin"), v.literal("user")])),
});

// Extrayendo tipos
type UserInput = v.Input<typeof userSchema>;
```

### 2. Transformaciones y Coerción

A menudo, los datos llegan de la red como strings aunque deban ser Date o Number. La coerción maneja esto con elegancia.

```typescript
const searchSchema = v.object({
  page: v.coerce(v.number(), (v) => Number(v) || 1),
  dateRange: v.coerce(v.date(), (v) => new Date(v)),
});
```

---

## ⚡ Lógica de Validación Avanzada

### Pipes de Lógica Personalizada

Puedes encadenar múltiples reglas de validación e incluso añadir tus propios chequeos de lógica personalizados usando las utilidades `v.omit`, `v.pick`, o `v.merge` con un segundo argumento personalizado.

```typescript
export const registerDto = v.omit(
  userSchema,
  ["id"],
  [
    (input) => {
      // Asegurar que la contraseña y la confirmación coinciden
      if (input.password !== input.confirmPassword) {
        return v.getPipeIssues(
          "confirmPassword",
          "Las contraseñas no coinciden",
          input,
        );
      }
      return v.getOutput(input);
    },
  ],
);
```

### Validación Asíncrona

Cuando necesites consultar una base de datos o API externa durante la validación, usa `objectAsync` y `parseAsync`.

```typescript
const uniqueEmailSchema = v.objectAsync({
  email: v.string(
    [v.email()],
    [
      async (input) => {
        const exists = await db.checkEmail(input);
        if (exists)
          return v.getPipeIssues("email", "El email ya está en uso", input);
        return v.getOutput(input);
      },
    ],
  ),
});
```

---

## 🎨 Manejo de Errores y Mensajería

La biblioteca proporciona una excepción `ValiError` estructurada que puedes capturar para extraer problemas granulares.

```typescript
try {
  const data = v.parse(schema, payload);
} catch (err) {
  if (err instanceof v.ValiError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path?.[0].key,
      message: issue.message,
    }));
    console.table(issues);
  }
}
```

---

## 📖 Acordeón de la API Core

### Esquemas Primitivos

| Función     | Descripción                |
| :---------- | :------------------------- |
| `string()`  | Valida un valor de cadena. |
| `number()`  | Valida un valor numérico.  |
| `boolean()` | Valida verdadero/falso.    |
| `date()`    | Valida un objeto Date.     |

### Utilidades Complejas

| Función        | Descripción                                |
| :------------- | :----------------------------------------- |
| `nullable(s)`  | Hace que un esquema acepte null.           |
| `optional(s)`  | Hace que un esquema acepte undefined.      |
| `union([...])` | Requiere que uno de los esquemas coincida. |
| `enum_([...])` | Requiere que el valor esté en una lista.   |

---

## 🧪 Benchmarks

El rendimiento es clave. `@vigilio/valibot` mantiene el perfil de rendimiento agresivo del proyecto original Valibot, superando a Zod por hasta 10x en tiempo de inicialización y 2x en velocidad de análisis para tamaños de objeto promedio (~20 campos). Esto se logra a través de una huella más pequeña y evitando pesadas abstracciones basadas en clases en favor de funciones puras.

### 2. Transformaciones y Coerción

A menudo, los datos llegan de la red como strings aunque deban ser Date o Number. La coerción maneja esto con elegancia.

```typescript
const searchSchema = v.object({
  page: v.coerce(v.number(), (v) => Number(v) || 1),
  dateRange: v.coerce(v.date(), (v) => new Date(v)),
});
```

---

## ⚡ Lógica de Validación Avanzada

### Pipes de Lógica Personalizada

Puedes encadenar múltiples reglas de validación e incluso añadir tus propios chequeos de lógica personalizados usando las utilidades `v.omit`, `v.pick`, o `v.merge` con un segundo argumento personalizado.

```typescript
export const registerDto = v.omit(
  userSchema,
  ["id"],
  [
    (input) => {
      // Asegurar que la contraseña y la confirmación coinciden
      if (input.password !== input.confirmPassword) {
        return v.getPipeIssues(
          "confirmPassword",
          "Las contraseñas no coinciden",
          input,
        );
      }
      return v.getOutput(input);
    },
  ],
);
```

---

### PORTUGUÊS (PT)

# @vigilio/valibot

A validação de dados é a base de um software robusto. O `@vigilio/valibot` é um fork especializado do Valibot (v0.20.1) que traz desempenho aprimorado, relatórios de erros personalizáveis e uma API simplificada para aplicações TypeScript complexas. Ele foi projetado para ser a única fonte de verdade para as formas de seus dados, desde formulários no lado do cliente até payloads de API no lado do servidor.

## 🚀 Por que este Fork?

Embora o Valibot original seja excelente, o `@vigilio/valibot` introduz várias melhorias importantes:

- **Inferência Otimizada**: Inferência de tipo TypeScript mais rápida para objetos profundamente aninhados.
- **Pipes de Lógica Personalizada**: Sintaxe simplificada para injetar lógica de negócios diretamente no fluxo de validação.
- **Mensagens de Erro Aprimoradas**: Formatação de erro padrão melhorada com melhores ganchos de I18n.
- **Alinhamento com o Framework**: Funciona nativamente com `@vigilio/next-api` e `@vigilio/vue-form`.

---

## 📥 Instalação

```bash
pnpm add @vigilio/valibot
```

---

## 🏗️ Conceitos Principais

### 1. Esquemas Simples

Tudo começa com uma definição de esquema. Cada tipo tem sua própria função validadora.

```typescript
import * as v from "@vigilio/valibot";

const userSchema = v.object({
  name: v.string("Nome é obrigatório"),
  email: v.string([v.email("Formato de e-mail inválido"), v.minLength(5)]),
  age: v.number([v.minValue(18, "Deve ser maior de idade")]),
  active: v.boolean(),
  roles: v.array(v.union([v.literal("admin"), v.literal("user")])),
});

// Extraindo tipos
type UserInput = v.Input<typeof userSchema>;
```

### 2. Transformações e Coerção

Muitas vezes, os dados chegam da rede como strings, mesmo que devessem ser Date ou Number. A coerção lida com isso de forma elegante.

```typescript
const searchSchema = v.object({
  page: v.coerce(v.number(), (v) => Number(v) || 1),
  dateRange: v.coerce(v.date(), (v) => new Date(v)),
});
```

---

## ⚡ Lógica de Validação Avançada

### Pipes de Lógica Personalizada

Você pode encadear várias regras de validação e até adicionar suas próprias verificações de lógica personalizada usando os utilitários `v.omit`, `v.pick` ou `v.merge` com um segundo argumento personalizado.

```typescript
export const registerDto = v.omit(
  userSchema,
  ["id"],
  [
    (input) => {
      // Garantir que a senha e a confirmação coincidam
      if (input.password !== input.confirmPassword) {
        return v.getPipeIssues(
          "confirmPassword",
          "As senhas não coincidem",
          input,
        );
      }
      return v.getOutput(input);
    },
  ],
);
```

### Validação Assíncrona

Quando precisar consultar um banco de dados ou uma API externa durante a validação, use `objectAsync` e `parseAsync`.

```typescript
const uniqueEmailSchema = v.objectAsync({
  email: v.string(
    [v.email()],
    [
      async (input) => {
        const exists = await db.checkEmail(input);
        if (exists)
          return v.getPipeIssues("email", "E-mail já está em uso", input);
        return v.getOutput(input);
      },
    ],
  ),
});
```

---

## 🎨 Tratamento de Erros e Mensagens

A biblioteca fornece uma exceção `ValiError` estruturada que você pode capturar para extrair problemas granulares.

```typescript
try {
  const data = v.parse(schema, payload);
} catch (err) {
  if (err instanceof v.ValiError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path?.[0].key,
      message: issue.message,
    }));
    console.table(issues);
  }
}
```

---

## 📖 Guia de Referência da API Core

### Esquemas Primitivos

| Função      | Descrição                  |
| :---------- | :------------------------- |
| `string()`  | Valida um valor de string. |
| `number()`  | Valida um valor numérico.  |
| `boolean()` | Valida verdadeiro/falso.   |
| `date()`    | Valida um objeto Date.     |

### Utilitários Complexos

| Função         | Descrição                                |
| :------------- | :--------------------------------------- |
| `nullable(s)`  | Faz com que um esquema aceite null.      |
| `optional(s)`  | Faz com que um esquema aceite undefined. |
| `union([...])` | Exige que um dos esquemas corresponda.   |
| `enum_([...])` | Exige que o valor esteja em uma lista.   |

---

## 🧪 Benchmarks

Desempenho é fundamental. O `@vigilio/valibot` mantém o perfil de desempenho agressivo do projeto original Valibot, superando o Zod em até 10x no tempo de inicialização e 2x na velocidade de processamento para tamanhos médios de objetos (~20 campos). Isso é alcançado por meio de uma pegada menor e evitando abstrações pesadas baseadas em classes em favor de funções puras.

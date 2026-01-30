### ENGLISH (EN)

# @vigilio/sweet

A robust and highly customizable library designed to simplify the creation of Modals, Alerts, and Popups in modern web applications. Whether you are building a cyberpunk dashboard or a minimalist landing page, `@vigilio/sweet` provides the tools you need with zero overhead.

## 🚀 Getting Started

First, install the package using your favorite package manager:

```bash
npm install @vigilio/sweet
pnpm add @vigilio/sweet
yarn add @vigilio/sweet
```

### 📦 Important: Import Styles

To ensure everything looks as intended, import the minified CSS in your entry file (e.g., `main.ts` or `app.tsx`):

```typescript
import "@vigilio/sweet/vigilio-sweet.min.css";
```

---

## 🏗️ Core Usage

### 1. Simple Modals

The `sweetModal` function returns a Promise that resolves when the user interacts with the modal.

```typescript
import { sweetModal } from "@vigilio/sweet";

async function showAlert() {
  const result = await sweetModal({
    title: "Are you sure?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
  });

  if (result.isConfirmed) {
    console.log("Item deleted successfully!");
  } else if (result.isDismissed) {
    console.log("User cancelled the operation.");
  }
}
```

### 2. Auto-dismissing Alerts

Perfect for notifications or toast-like messages.

```typescript
import { sweetAlert } from "@vigilio/sweet";

sweetAlert({
  title: "Settings Saved!",
  icon: "success",
  timer: 3000, // Closes after 3 seconds
  position: "top-end",
  showConfirmButton: false,
});
```

---

## 🛠️ Advanced Configuration

### Custom HTML and Elements

You are not limited to plain text. You can pass strings of HTML or even native DOM Elements.

```typescript
sweetModal({
  title: "<strong>Rich Content</strong>",
  html: `
        <div class='custom-container'>
            <p>You can use <em>any</em> HTML here.</p>
            <img src='/path-to-image.png' style='width: 100px; margin-top: 10px;' />
        </div>
    `,
  confirmButtonText: "<i class='fas fa-thumbs-up'></i> Great!",
});
```

### Dynamic Callbacks

If you need to execute logic during the lifecycle (like fetching data before closing), use the callback pattern.

```typescript
sweetModal((onClose) => ({
  title: "Please wait...",
  text: "Processing your request",
  showConfirmButton: false,
  onOpen: async () => {
    await someLongOperation();
    onClose(); // Programmatically close the modal
  },
}));
```

---

## 🎨 Styling and Customization

The library uses CSS Variables for easy theming. You can override them in your global CSS:

```css
:root {
  --vigilio-sweet-bg: #1a1a1a;
  --vigilio-sweet-text: #ffffff;
  --vigilio-sweet-primary: #00ffcc; /* Cyberpunk Teal */
  --vigilio-sweet-border-radius: 8px;
}
```

### CSS Classes

Pass `customClass` to inject your own utility classes (compatible with Tailwind CSS):

```typescript
sweetModal({
  title: "Custom Styled Modal",
  customClass: {
    container: "my-custom-container",
    popup: "bg-slate-900 border-2 border-primary",
    confirmButton: "bg-green-500 hover:bg-green-600 font-bold px-6",
    cancelButton: "underline text-red-400",
  },
});
```

---

## 📖 API Reference

### SwalProps

| Property           | Type         | Default      | Description                       |
| :----------------- | :----------- | :----------- | :-------------------------------- | -------------------- | ----------- | ----------------- |
| `title`            | `string`     | `undefined`  | The header text of the modal.     |
| `text`             | `string`     | `undefined`  | The body text of the modal.       |
| `icon`             | `'success'   | 'danger'     | 'warning'                         | 'info'`              | `undefined` | Predefined icons. |
| `html`             | `string      | HTMLElement` | `undefined`                       | Custom HTML content. |
| `timer`            | `number`     | `undefined`  | Auto-close timer in milliseconds. |
| `showCancelButton` | `boolean`    | `false`      | Shows a secondary cancel button.  |
| `onClose`          | `() => void` | `undefined`  | Hook called when modal is closed. |

### Result Object

```typescript
interface SwalResult {
  isConfirmed: boolean;
  isDismissed: boolean;
  dismiss?: "timer" | "cancel" | "esc" | "backdrop";
  value?: any; // For modals with inputs
}
```

---

## ♿ Accessibility (A11y)

`@vigilio/sweet` is built with accessibility in mind. It automatically handles:

- **Focus Trap**: Users cannot tab out of the modal while it is open.
- **Keyboard Support**: Close on `Escape` key, toggle focus on buttons with `Tab`.
- **ARIA Roles**: Integrated `role='dialog'` and `aria-modal='true'` attributes.

---

## 🧪 Performance

Optimized to be **Zero Dependencies**. By using native DOM APIs and minimal Framer Motion (optional), it ensures a tiny bundle size that won't slow down your application. Perfect for edge-runtime applications or performance-critical SaaS tools.

---

### ESPAÑOL (ES)

# @vigilio/sweet

Una biblioteca robusta y altamente personalizable diseñada para simplificar la creación de Modals, Alertas y Popups en aplicaciones web modernas. Ya sea que estés construyendo un dashboard cyberpunk o una landing page minimalista, `@vigilio/sweet` proporciona las herramientas que necesitas con cero sobrecarga.

## 🚀 Primeros Pasos

Primero, instala el paquete usando tu gestor de paquetes favorito:

```bash
npm install @vigilio/sweet
pnpm add @vigilio/sweet
yarn add @vigilio/sweet
```

### 📦 Importante: Importar Estilos

Para asegurar que todo se vea como se espera, importa el CSS minificado en tu archivo de entrada (ej., `main.ts` o `app.tsx`):

```typescript
import "@vigilio/sweet/vigilio-sweet.min.css";
```

---

## 🏗️ Uso Principal

### 1. Modales Simples

La función `sweetModal` devuelve una Promesa que se resuelve cuando el usuario interactúa con el modal.

```typescript
import { sweetModal } from "@vigilio/sweet";

async function showAlert() {
  const result = await sweetModal({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "¡Sí, eliminar!",
    cancelButtonText: "No, mantener",
  });

  if (result.isConfirmed) {
    console.log("¡Elemento eliminado con éxito!");
  } else if (result.isDismissed) {
    console.log("El usuario canceló la operación.");
  }
}
```

### 2. Alertas con Auto-cierre

Perfecto para notificaciones o mensajes tipo "toast".

```typescript
import { sweetAlert } from "@vigilio/sweet";

sweetAlert({
  title: "¡Configuración Guardada!",
  icon: "success",
  timer: 3000, // Se cierra después de 3 segundos
  position: "top-end",
  showConfirmButton: false,
});
```

---

## 🛠️ Configuración Avanzada

### HTML Personalizado y Elementos

No estás limitado a texto plano. Puedes pasar cadenas de HTML o incluso Elementos DOM nativos.

```typescript
sweetModal({
  title: "<strong>Contenido Enriquecido</strong>",
  html: `
        <div class='custom-container'>
            <p>Puedes usar <em>cualquier</em> HTML aquí.</p>
            <img src='/path-to-image.png' style='width: 100px; margin-top: 10px;' />
        </div>
    `,
  confirmButtonText: "<i class='fas fa-thumbs-up'></i> ¡Genial!",
});
```

### Callbacks Dinámicos

Si necesitas ejecutar lógica durante el ciclo de vida (como obtener datos antes de cerrar), usa el patrón de callback.

```typescript
sweetModal((onClose) => ({
  title: "Por favor espera...",
  text: "Procesando tu solicitud",
  showConfirmButton: false,
  onOpen: async () => {
    await someLongOperation();
    onClose(); // Cerrar el modal programáticamente
  },
}));
```

---

## 🎨 Estilizado y Personalización

La biblioteca utiliza Variables CSS para una tematización fácil. Puedes sobrescribirlas en tu CSS global:

```css
:root {
  --vigilio-sweet-bg: #1a1a1a;
  --vigilio-sweet-text: #ffffff;
  --vigilio-sweet-primary: #00ffcc; /* Verde Cyberpunk */
  --vigilio-sweet-border-radius: 8px;
}
```

### Clases CSS

Pasa `customClass` para inyectar tus propias clases de utilidad (compatible con Tailwind CSS):

```typescript
sweetModal({
  title: "Modal con Estilo Personalizado",
  customClass: {
    container: "my-custom-container",
    popup: "bg-slate-900 border-2 border-primary",
    confirmButton: "bg-green-500 hover:bg-green-600 font-bold px-6",
    cancelButton: "underline text-red-400",
  },
});
```

---

## 📖 Referencia de la API

### SwalProps

| Propiedad          | Tipo         | Por Defecto  | Descripción                                  |
| :----------------- | :----------- | :----------- | :------------------------------------------- | ----------------------------- | ----------- | -------------------- |
| `title`            | `string`     | `undefined`  | El texto de la cabecera del modal.           |
| `text`             | `string`     | `undefined`  | El texto del cuerpo del modal.               |
| `icon`             | `'success'   | 'danger'     | 'warning'                                    | 'info'`                       | `undefined` | Iconos predefinidos. |
| `html`             | `string      | HTMLElement` | `undefined`                                  | Contenido HTML personalizado. |
| `timer`            | `number`     | `undefined`  | Temporizador de auto-cierre en milisegundos. |
| `showCancelButton` | `boolean`    | `false`      | Muestra un botón secundario de cancelación.  |
| `onClose`          | `() => void` | `undefined`  | Hook llamado cuando se cierra el modal.      |

### Objeto de Resultado

```typescript
interface SwalResult {
  isConfirmed: boolean;
  isDismissed: boolean;
  dismiss?: "timer" | "cancel" | "esc" | "backdrop";
  value?: any; // Para modales con inputs
}
```

---

## ♿ Accesibilidad (A11y)

`@vigilio/sweet` está construido con la accesibilidad en mente. Maneja automáticamente:

- **Focus Trap**: Los usuarios no pueden salir del modal con el tabulador mientras esté abierto.
- **Soporte de Teclado**: Cierre con la tecla `Escape`, cambio de foco en botones con `Tab`.
- **Roles ARIA**: Atributos `role='dialog'` y `aria-modal='true'` integrados.

---

## 🧪 Rendimiento

Optimizado para tener **Cero Dependencias**. Al usar APIs nativas del DOM y un mínimo de Framer Motion (opcional), asegura un tamaño de paquete diminuto que no ralentizará tu aplicación. Perfecto para aplicaciones en edge-runtime o herramientas SaaS críticas para el rendimiento.

---

### PORTUGUÊS (PT)

# @vigilio/sweet

Uma biblioteca de componentes de interface de usuário robusta e altamente personalizável, projetada para simplificar a criação de Modais, Alertas e Popups em aplicações web modernas. Seja para construir um dashboard cyberpunk ou uma landing page minimalista, o `@vigilio/sweet` oferece as ferramentas necessárias com zero sobrecarga.

## 🚀 Primeiros Passos

Primeiro, instale o pacote usando seu gerenciador de pacotes favorito:

```bash
npm install @vigilio/sweet
pnpm add @vigilio/sweet
yarn add @vigilio/sweet
```

### 📦 Importante: Importar Estilos

Para garantir que tudo funcione conforme o esperado, importe o CSS minificado em seu arquivo de entrada (ex., `main.ts` ou `app.tsx`):

```typescript
import "@vigilio/sweet/vigilio-sweet.min.css";
```

---

## 🏗️ Uso Principal

### 1. Modais Simples

A função `sweetModal` retorna uma Promise que é resolvida quando o usuário interage com o modal.

```typescript
import { sweetModal } from "@vigilio/sweet";

async function showAlert() {
  const result = await sweetModal({
    title: "Você tem certeza?",
    text: "Esta ação não pode ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Não, manter",
  });

  if (result.isConfirmed) {
    console.log("Item excluído com sucesso!");
  } else if (result.isDismissed) {
    console.log("O usuário cancelou a operação.");
  }
}
```

### 2. Alertas com Fechamento Automático

Perfeito para notificações ou mensagens do tipo "toast".

```typescript
import { sweetAlert } from "@vigilio/sweet";

sweetAlert({
  title: "Configurações Salvas!",
  icon: "success",
  timer: 3000, // Fecha após 3 segundos
  position: "top-end",
  showConfirmButton: false,
});
```

---

## 🛠️ Configuração Avançada

### HTML Personalizado e Elementos

Você não está limitado a texto simples. Pode passar strings de HTML ou até mesmo Elementos DOM nativos.

```typescript
sweetModal({
  title: "<strong>Conteúdo Rico</strong>",
  html: `
        <div class='custom-container'>
            <p>Você pode usar <em>qualquer</em> HTML aqui.</p>
            <img src='/path-to-image.png' style='width: 100px; margin-top: 10px;' />
        </div>
    `,
  confirmButtonText: "<i class='fas fa-thumbs-up'></i> Ótimo!",
});
```

### Callbacks Dinâmicos

Se você precisar executar lógica durante o ciclo de vida (como buscar dados antes de fechar), use o padrão de callback.

```typescript
sweetModal((onClose) => ({
  title: "Por favor, aguarde...",
  text: "Processando sua solicitação",
  showConfirmButton: false,
  onOpen: async () => {
    await someLongOperation();
    onClose(); // Fechar o modal programaticamente
  },
}));
```

---

## 🎨 Estilização e Personalização

A biblioteca utiliza Variáveis CSS para facilitar a tematização. Você pode sobrescrevê-las em seu CSS global:

```css
:root {
  --vigilio-sweet-bg: #1a1a1a;
  --vigilio-sweet-text: #ffffff;
  --vigilio-sweet-primary: #00ffcc; /* Verde Cyberpunk */
  --vigilio-sweet-border-radius: 8px;
}
```

### Classes CSS

Passe `customClass` para injetar suas próprias classes de utilidade (compatível com Tailwind CSS):

```typescript
sweetModal({
  title: "Modal com Estilo Personalizado",
  customClass: {
    container: "my-custom-container",
    popup: "bg-slate-900 border-2 border-primary",
    confirmButton: "bg-green-500 hover:bg-green-600 font-bold px-6",
    cancelButton: "underline text-red-400",
  },
});
```

---

## 📖 Referência da API

### SwalProps

| Propriedade        | Tipo         | Padrão       | Descrição                                               |
| :----------------- | :----------- | :----------- | :------------------------------------------------------ | ---------------------------- | ----------- | -------------------- |
| `title`            | `string`     | `undefined`  | O texto do cabeçalho do modal.                          |
| `text`             | `string`     | `undefined`  | O texto do corpo do modal.                              |
| `icon`             | `'success'   | 'danger'     | 'warning'                                               | 'info'`                      | `undefined` | Ícones predefinidos. |
| `html`             | `string      | HTMLElement` | `undefined`                                             | Conteúdo HTML personalizado. |
| `timer`            | `number`     | `undefined`  | Temporizador de fechamento automático em milissegundos. |
| `showCancelButton` | `boolean`    | `false`      | Mostra um botão secundário de cancelamento.             |
| `onClose`          | `() => void` | `undefined`  | Hook chamado quando o modal é fechado.                  |

### Objeto de Resultado

```typescript
interface SwalResult {
  isConfirmed: boolean;
  isDismissed: boolean;
  dismiss?: "timer" | "cancel" | "esc" | "backdrop";
  value?: any; // Para modais com inputs
}
```

---

## ♿ Acessibilidade (A11y)

O `@vigilio/sweet` foi construído com a acessibilidade em mente. Ele lida automaticamente com:

- **Focus Trap**: Os usuários não podem sair do modal com o tabulador enquanto ele estiver aberto.
- **Suporte de Teclado**: Fechar com a tecla `Escape`, alternar o foco nos botões com `Tab`.
- **Roles ARIA**: Atributos `role='dialog'` e `aria-modal='true'` integrados.

---

## 🧪 Performance

Otimizado para ter **Zero Dependências**. Ao usar APIs nativas do DOM e o mínimo de Framer Motion (opcional), garante um tamanho de pacote minúsculo que não deixará sua aplicação lenta. Perfeito para aplicações no edge-runtime ou ferramentas SaaS críticas para a performance.

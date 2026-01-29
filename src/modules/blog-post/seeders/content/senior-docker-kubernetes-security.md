### ESPAÑOL (ES)

En el ciclo de vida de desarrollo moderno, "funciona en mi máquina" no es suficiente; debe funcionar de forma segura en un clúster hostil. La seguridad en contenedores es un modelo de capas que va desde el Dockerfile hasta el Runtime de Kubernetes. Ignorar una capa hace vulnerables a todas las demás.

#### 1. Endurecimiento (Hardening) de Imágenes Docker

![Container Security Layers](./images/senior-docker-kubernetes-security/layers.png)

La seguridad empieza a la izquierda (Shift Left). No uses imágenes base gigantescas.

**Distroless & Multi-stage Builds:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
# Usamos distroless para reducir la superficie de ataque (sin shell, sin package managers)
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Ejecutar como usuario no-root (ID 1000 es estándar)
USER 1000:1000

CMD ["dist/main.js"]
```

**Principios Clave:**

- **Inmutabilidad:** `readOnlyRootFilesystem: true` en K8s impide que un atacante descargue malware.
- **Sin Shell:** Si un atacante logra RCE (Remote Code Execution), no encontrará `/bin/sh` para escalar privilegios.

#### 2. Seguridad de la Cadena de Suministro con Cosign

No basta con escanear la imagen; debes verificar su origen. Un atacante podría inyectar una imagen maliciosa en tu registry. Usamos **Sigstore Cosign** para firmar imágenes en CI y **Kyverno** para verificarlas en el clúster.

**Firmado en CI (GitHub Actions):**

```bash
cosign sign --key env://COSIGN_PRIVATE_KEY $IMAGE_URI
```

**Verificación en Kubernetes (ClusterPolicy de Kyverno):**

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signature
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-signature
      match:
        resources:
          kinds:
            - Pod
      verifyImages:
        - image: "ghcr.io/mi-organizacion/*"
          key: |-
            -----BEGIN PUBLIC KEY-----
            ...
            -----END PUBLIC KEY-----
```

#### 3. Kubernetes Pod Security Standards (PSS)

Las `PodSecurityPolicies` (PSP) están obsoletas. Ahora usamos PSS con Admission Controllers.

**Perfil 'Restricted' (El objetivo Senior):**
Debes configurar tus namespaces para rechazar pods inseguros por defecto.

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backend-secure
  labels:
    # Bloquea cualquier pod que no cumpla con el estándar restringido
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
```

Para que un Pod cumpla con esto, su manifiesto debe ser explícito:

```yaml
securityContext:
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL # No necesitamos NET_ADMIN ni SYS_ADMIN
```

#### 4. Network Policies y mTLS con Service Mesh

Por defecto, todos los Pods en K8s se ven entre sí. Si comprometen tu frontend, tienen acceso directo a tu DB.

Las **NetworkPolicies** son el firewall de capa 3/4. Pero para seguridad real Zero Trust, necesitamos encriptación y autenticación fuerte en capa 7. Aquí entra **Istio** o **Linkerd** con mTLS automático.

```yaml
# AuthorizationPolicy de Istio para permitir SOLO al frontend llamar al backend
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: backend-authz
  namespace: prod
spec:
  selector:
    matchLabels:
      app: backend
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/prod/sa/frontend-sa"]
```

#### 5. Secretos Enterprise con External Secrets Operator

Nunca guardes secretos en Git. Ni siquiera encriptados. Y los Kubernetes Secrets base64 no son seguros si alguien tiene acceso a ETCD.

**Flujo Senior:**
AWS Secrets Manager -> External Secrets Operator -> K8s Secret (In-memory/Tmpfs) -> Pod env var.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials-secret # Nombre del secret nativo que se creará
  data:
    - secretKey: username
      remoteRef:
        key: production/db/credentials
        property: username
```

#### 6. Runtime Security con Falco

¿Qué pasa si todas las prevenciones fallan? Necesitas detección.
**Falco** escucha las system calls del kernel Linux mediante eBPF.

Ejemplo de regla Falco para detectar una shell inversa:

```yaml
- rule: Reverse shell
  desc: Detect reverse shell established to external server
  condition: >
    spawned_process and container and shell_procs and
    (fd.typechar='4' or fd.typechar='6')
  output: "Reverse shell detected (user=%user.name command=%proc.cmdline)"
  priority: CRITICAL
```

#### Conclusión

La seguridad en contenedores no es un interruptor que se enciende. Es una disciplina continua. Al combinar imágenes mínimas firmadas criptográficamente, mTLS estricto y detección de intrusiones en tiempo de ejecución, reducimos la superficie de ataque a tal punto que, incluso si una aplicación es vulnerable, el radio de explosión (Blast Radius) queda contenido matemáticamente.

---

### ENGLISH (EN)

In the modern development lifecycle, "it works on my machine" is not enough; it must work securely in a hostile cluster. Container security is a layered model ranging from the Dockerfile to the Kubernetes Runtime. Ignoring one layer makes all the others vulnerable.

#### 1. Docker Image Hardening

![Container Security Layers](./images/senior-docker-kubernetes-security/layers.png)

Security starts left (Shift Left). Do not use gigantic base images.

**Distroless & Multi-stage Builds:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
# We use distroless to reduce the attack surface (no shell, no package managers)
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Run as non-root user (ID 1000 is standard)
USER 1000:1000

CMD ["dist/main.js"]
```

**Key Principles:**

- **Immutability:** `readOnlyRootFilesystem: true` in K8s prevents an attacker from downloading malware.
- **No Shell:** If an attacker achieves RCE (Remote Code Execution), they won't find `/bin/sh` to escalate privileges.

#### 2. Supply Chain Security with Cosign

It is not enough to scan the image; you must verify its origin. An attacker could inject a malicious image into your registry. We use **Sigstore Cosign** to sign images in CI and **Kyverno** to verify them in the cluster.

**Signing in CI (GitHub Actions):**

```bash
cosign sign --key env://COSIGN_PRIVATE_KEY $IMAGE_URI
```

**Verification in Kubernetes (Kyverno ClusterPolicy):**

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signature
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-signature
      match:
        resources:
          kinds:
            - Pod
      verifyImages:
        - image: "ghcr.io/my-org/*"
          key: |-
            -----BEGIN PUBLIC KEY-----
            ...
            -----END PUBLIC KEY-----
```

#### 3. Kubernetes Pod Security Standards (PSS)

`PodSecurityPolicies` (PSP) are deprecated. We now use PSS with Admission Controllers.

**'Restricted' Profile (The Senior Goal):**
You must configure your namespaces to reject insecure pods by default.

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backend-secure
  labels:
    # Blocks any pod that does not comply with the restricted standard
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
```

For a Pod to comply with this, its manifest must be explicit:

```yaml
securityContext:
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL # We don't need NET_ADMIN or SYS_ADMIN
```

#### 4. Network Policies and mTLS with Service Mesh

By default, all Pods in K8s see each other. If your frontend is compromised, they have direct access to your DB.

**NetworkPolicies** are the layer 3/4 firewall. But for real Zero Trust security, we need encryption and strong authentication at layer 7. This is where **Istio** or **Linkerd** come in with automatic mTLS.

```yaml
# Istio AuthorizationPolicy to allow ONLY frontend to call backend
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: backend-authz
  namespace: prod
spec:
  selector:
    matchLabels:
      app: backend
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/prod/sa/frontend-sa"]
```

#### 5. Enterprise Secrets with External Secrets Operator

Never store secrets in Git. Not even encrypted. And base64 Kubernetes Secrets are not secure if someone has access to ETCD.

**Senior Workflow:**
AWS Secrets Manager -> External Secrets Operator -> K8s Secret (In-memory/Tmpfs) -> Pod env var.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials-secret # Name of the native secret to be created
  data:
    - secretKey: username
      remoteRef:
        key: production/db/credentials
        property: username
```

#### 6. Runtime Security with Falco

What happens if all preventions fail? You need detection.
**Falco** listens to Linux kernel system calls using eBPF.

Example Falco rule to detect a reverse shell:

```yaml
- rule: Reverse shell
  desc: Detect reverse shell established to external server
  condition: >
    spawned_process and container and shell_procs and
    (fd.typechar='4' or fd.typechar='6')
  output: "Reverse shell detected (user=%user.name command=%proc.cmdline)"
  priority: CRITICAL
```

#### Conclusion

Container security is not a switch you flip on. It is a continuous discipline. By combining cryptographically signed minimal images, strict mTLS, and runtime intrusion detection, we reduce the attack surface to such an extent that, even if an application is vulnerable, the Blast Radius is mathematically contained.

---

### PORTUGUÊS (PT)

No ciclo de vida de desenvolvimento moderno, "funciona na minha máquina" não é suficiente; deve funcionar de forma segura em um cluster hostil. A segurança em contêineres é um modelo de camadas que vai desde o Dockerfile até o Runtime do Kubernetes. Ignorar uma camada torna todas as outras vulneráveis.

#### 1. Endurecimento (Hardening) de Imagens Docker

![Container Security Layers](./images/senior-docker-kubernetes-security/layers.png)

A segurança começa à esquerda (Shift Left). Não use imagens base gigantescas.

**Distroless & Multi-stage Builds:**

```dockerfile
# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Produção
# Usamos distroless para reduzir a superfície de ataque (sem shell, sem gerenciadores de pacotes)
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Executar como usuário não-root (ID 1000 é padrão)
USER 1000:1000

CMD ["dist/main.js"]
```

**Princípios Chave:**

- **Imutabilidade:** `readOnlyRootFilesystem: true` no K8s impede que um atacante baixe malware.
- **Sem Shell:** Se um atacante conseguir RCE (Execução Remota de Código), não encontrará `/bin/sh` para escalar privilégios.

#### 2. Segurança da Cadeia de Suprimentos com Cosign

Não basta escanear a imagem; você deve verificar sua origem. Um atacante pode injetar uma imagem maliciosa em seu registro. Usamos **Sigstore Cosign** para assinar imagens no CI e **Kyverno** para verificá-las no cluster.

**Assinando no CI (GitHub Actions):**

```bash
cosign sign --key env://COSIGN_PRIVATE_KEY $IMAGE_URI
```

**Verificação no Kubernetes (ClusterPolicy Kyverno):**

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signature
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-signature
      match:
        resources:
          kinds:
            - Pod
      verifyImages:
        - image: "ghcr.io/minha-organizacao/*"
          key: |-
            -----BEGIN PUBLIC KEY-----
            ...
            -----END PUBLIC KEY-----
```

#### 3. Kubernetes Pod Security Standards (PSS)

As `PodSecurityPolicies` (PSP) estão obsoletas. Agora usamos PSS com Admission Controllers.

**Perfil 'Restricted' (O objetivo Sênior):**
Você deve configurar seus namespaces para rejeitar pods inseguros por padrão.

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backend-secure
  labels:
    # Bloqueia qualquer pod que não cumpra com o padrão restrito
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
```

Para que um Pod cumpra isso, seu manifesto deve ser explícito:

```yaml
securityContext:
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL # Não precisamos de NET_ADMIN nem SYS_ADMIN
```

#### 4. Network Policies e mTLS com Service Mesh

Por padrão, todos os Pods no K8s se veem. Se comprometerem seu frontend, eles têm acesso direto ao seu DB.

As **NetworkPolicies** são o firewall de camada 3/4. Mas para segurança real Zero Trust, precisamos de criptografia e autenticação forte na camada 7. É aqui que entra o **Istio** ou **Linkerd** com mTLS automático.

```yaml
# AuthorizationPolicy do Istio para permitir SOMENTE que o frontend chame o backend
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: backend-authz
  namespace: prod
spec:
  selector:
    matchLabels:
      app: backend
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/prod/sa/frontend-sa"]
```

#### 5. Segredos Enterprise com External Secrets Operator

Nunca guarde segredos no Git. Nem mesmo criptografados. E os Kubernetes Secrets base64 não são seguros se alguém tiver acesso ao ETCD.

**Fluxo Sênior:**
AWS Secrets Manager -> External Secrets Operator -> K8s Secret (In-memory/Tmpfs) -> Pod env var.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials-secret # Nome do secret nativo que será criado
  data:
    - secretKey: username
      remoteRef:
        key: production/db/credentials
        property: username
```

#### 6. Segurança em Runtime com Falco

O que acontece se todas as prevenções falharem? Você precisa de detecção.
**Falco** escuta as system calls do kernel Linux usando eBPF.

Exemplo de regra Falco para detectar uma reverse shell:

```yaml
- rule: Reverse shell
  desc: Detect reverse shell established to external server
  condition: >
    spawned_process and container and shell_procs and
    (fd.typechar='4' or fd.typechar='6')
  output: "Reverse shell detected (user=%user.name command=%proc.cmdline)"
  priority: CRITICAL
```

#### Conclusão

A segurança em contêineres não é um interruptor que se liga. É uma disciplina contínua. Ao combinar imagens mínimas assinadas criptograficamente, mTLS estrito e detecção de intrusão em tempo de execução, reduzimos a superfície de ataque a tal ponto que, mesmo se uma aplicação for vulnerável, o raio de explosão (Blast Radius) é matematicamente contido.

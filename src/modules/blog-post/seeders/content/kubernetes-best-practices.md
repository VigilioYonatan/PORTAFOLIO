### ESPAÑOL (ES)

Kubernetes (K8s) es el sistema operativo de la nube moderna, pero su curva de aprendizaje es empinada. Las configuraciones por defecto ("Vanilla K8s") son inseguras e ineficientes para cargas de trabajo críticas. En este artículo, destilaremos años de experiencia operando clusters de alto tráfico para ofrecer una guía de "Best Practices" enfocada en la resiliencia, la seguridad y el escalado automático basado en eventos.

#### 1. QoS Classes y Gestión de Recursos (Evitando el OOM Killer)

![Kubernetes Resources](./images/kubernetes-best-practices/resources.png)

K8s asigna una "Clase de Calidad de Servicio" (QoS) a cada Pod basándose en sus `requests` y `limits`. Esto determina a quién mata primero cuando falta memoria.

- **Guaranteed**: `requests` == `limits` (para CPU y RAM). K8s prioriza estos pods. Úsalo para Bases de Datos o Core Services.
- **Burstable**: `requests` < `limits`. El pod puede usar picos de CPU, pero es candidato a ser eliminado si el nodo se satura. Ideal para APIs web.
- **BestEffort**: Sin resources definidos. Son los primeros en morir. **Nunca uses esto en producción**.

**Ejemplo Burstable para Node.js API:**

```yaml
resources:
  requests:
    cpu: "250m" # 1/4 Core garantizado
    memory: "512Mi"
  limits:
    cpu: "1000m" # Puede usar hasta 1 Core en picos
    memory: "768Mi" # Hard Limit
```

_Tip: Configura `max_old_space_size` de Node.js al 75% del límite de memoria del contenedor._

#### 2. Autoscalado Dirigido por Eventos con KEDA

El Horizontal Pod Autoscaler (HPA) nativo escala por CPU/RAM. Esto es reactivo y lento.
Si tienes 10,000 mensajes en una cola SQS, el HPA no escalará hasta que los pods actuales revienten de CPU consumiendo esos mensajes.

**Solución: KEDA (Kubernetes Event-driven Autoscaling)**.
KEDA escala tus pods basándose en métricas externas (Lag de Kafka, Longitud de Cola SQS/Redis, Cron).

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
spec:
  scaleTargetRef:
    name: order-processor
  minReplicaCount: 2
  maxReplicaCount: 50
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123/orders
        queueLength: "5" # Escala 1 pod por cada 5 mensajes en espera
```

#### 3. Probes: La Tríada de la Disponibilidad

Configurar mal los probes es la causa #1 de "CrashLoopBackOff" infinitos o downtime durante deployments.

1.  **Startup Probe**: Crítico para apps NestJS/Java que tardan 30s en arrancar. Si no la tienes, el Liveness Probe matará al pod antes de que termine de arrancar.
2.  **Readiness Probe**: Verifica conectividad crítica (DB). Si falla, saca al pod del Load Balancer.
3.  **Liveness Probe**: Verifica deadlock interno.

```yaml
startupProbe:
  httpGet: { path: /health, port: 3000 }
  failureThreshold: 30
  periodSeconds: 10 # Da hasta 300s para arrancar
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
```

#### 4. Service Mesh (Istio/Linkerd) y mTLS

Cuando tienes 50 microservicios, confiar en la red interna del clúster es peligroso (Zero Trust).
Un Service Mesh añade un sidecar proxy (Envoy) a cada pod para manejar:

- **mTLS (Mutual TLS)**: Cifrado automático entre servicios sin tocar el código de la app.
- **Canary Deployments**: "Envía el 5% del tráfico a la v2.0".
- **Circuit Breakers**: "Si el Servicio B falla 5 veces, deja de llamarlo por 1 minuto".

#### 5. Seguridad: Pod Security Standards & Network Policies

Por defecto, cualquier pod puede hablar con cualquier pod. ¡Inseguro!
Usa **Network Policies** para aislar namespaces.

```yaml
# Deny All Ingress por defecto
kind: NetworkPolicy
spec:
  podSelector: {}
  policyTypes: [Ingress]
```

Además, endurece el contenedor con `securityContext`:

```yaml
securityContext:
  runAsUser: 1000 # Nunca root
  runAsNonRoot: true
  readOnlyRootFilesystem: true # Previene inyección de malware persistente
  allowPrivilegeEscalation: false
```

Kubernetes es poderoso, pero "With great power comes great complexity". Automatiza todo con GitOps (ArgoCD) y nunca hagas cambios manuales (`kubectl edit`) en producción.

---

### ENGLISH (EN)

Kubernetes (K8s) is the operating system of the modern cloud, but its learning curve is steep. Default configurations ("Vanilla K8s") are insecure and inefficient for critical workloads. In this article, we will distill years of experience operating high-traffic clusters to provide a "Best Practices" guide focused on resilience, security, and event-driven autoscaling.

#### 1. QoS Classes and Resource Management (Avoiding the OOM Killer)

![Kubernetes Resources](./images/kubernetes-best-practices/resources.png)

K8s assigns a "Quality of Service" (QoS) Class to each Pod based on its `requests` and `limits`. This determines who gets killed first when memory is scarce.

- **Guaranteed**: `requests` == `limits` (for CPU and RAM). K8s prioritizes these pods. Use for Databases or Core Services.
- **Burstable**: `requests` < `limits`. The pod can use CPU bursts but is a candidate for eviction if the node saturates. Ideal for Web APIs.
- **BestEffort**: No resources defined. First to die. **Never use this in production**.

**Burstable Example for Node.js API:**

```yaml
resources:
  requests:
    cpu: "250m" # 1/4 Core guaranteed
    memory: "512Mi"
  limits:
    cpu: "1000m" # Can burst up to 1 Core
    memory: "768Mi" # Hard Limit
```

_Tip: Set Node.js `max_old_space_size` to 75% of the container memory limit._

#### 2. Event-Driven Autoscaling with KEDA

Native Horizontal Pod Autoscaler (HPA) scales by CPU/RAM. This is reactive and slow.
If you have 10,000 messages in an SQS queue, HPA won't scale until current pods max out their CPU consuming those messages.

**Solution: KEDA (Kubernetes Event-driven Autoscaling)**.
KEDA scales your pods based on external metrics (Kafka Lag, SQS/Redis Queue Length, Cron).

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
spec:
  scaleTargetRef:
    name: order-processor
  minReplicaCount: 2
  maxReplicaCount: 50
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123/orders
        queueLength: "5" # Scale 1 pod for every 5 pending messages
```

#### 3. Probes: The Trinity of Availability

Misconfiguring probes is the #1 cause of infinite "CrashLoopBackOff" or downtime during deployments.

1.  **Startup Probe**: Critical for NestJS/Java apps that take 30s to boot. If missing, the Liveness Probe will kill the pod before it finishes starting.
2.  **Readiness Probe**: Checks critical connectivity (DB). If failed, removes pod from Load Balancer.
3.  **Liveness Probe**: Checks internal deadlock.

```yaml
startupProbe:
  httpGet: { path: /health, port: 3000 }
  failureThreshold: 30
  periodSeconds: 10 # Gives up to 300s to boot
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
```

#### 4. Service Mesh (Istio/Linkerd) and mTLS

When you have 50 microservices, trusting the internal cluster network is dangerous (Zero Trust).
A Service Mesh adds a sidecar proxy (Envoy) to every pod to handle:

- **mTLS (Mutual TLS)**: Automatic encryption between services without touching app code.
- **Canary Deployments**: "Send 5% of traffic to v2.0".
- **Circuit Breakers**: "If Service B fails 5 times, stop calling it for 1 minute".

#### 5. Security: Pod Security Standards & Network Policies

By default, any pod can talk to any pod. Insecure!
Use **Network Policies** to isolate namespaces.

```yaml
# Deny All Ingress by default
kind: NetworkPolicy
spec:
  podSelector: {}
  policyTypes: [Ingress]
```

Also, harden the container with `securityContext`:

```yaml
securityContext:
  runAsUser: 1000 # Never root
  runAsNonRoot: true
  readOnlyRootFilesystem: true # Prevents persistent malware injection
  allowPrivilegeEscalation: false
```

Kubernetes is powerful, but "With great power comes great complexity". Automate everything with GitOps (ArgoCD) and never make manual changes (`kubectl edit`) in production.

---

### PORTUGUÊS (PT)

Kubernetes (K8s) é o sistema operacional da nuvem moderna, mas sua curva de aprendizado é íngreme. As configurações padrão ("Vanilla K8s") são inseguras e ineficientes para cargas de trabalho críticas. Neste artigo, destilaremos anos de experiência operando clusters de alto tráfego para oferecer um guia de "Melhores Práticas" focado em resiliência, segurança e escalonamento automático baseado em eventos.

#### 1. Classes QoS e Gerenciamento de Recursos (Evitando o OOM Killer)

![Kubernetes Resources](./images/kubernetes-best-practices/resources.png)

O K8s atribui uma "Classe de Qualidade de Serviço" (QoS) a cada Pod com base em seus `requests` e `limits`. Isso determina quem é morto primeiro quando falta memória.

- **Guaranteed**: `requests` == `limits` (para CPU e RAM). K8s prioriza esses pods. Use para Bancos de Dados ou Serviços Core.
- **Burstable**: `requests` < `limits`. O pod pode usar picos de CPU, mas é candidato a ser eliminado se o nó saturar. Ideal para APIs Web.
- **BestEffort**: Sem recursos definidos. São os primeiros a morrer. **Nunca use isso em produção**.

**Exemplo Burstable para API Node.js:**

```yaml
resources:
  requests:
    cpu: "250m" # 1/4 Core garantido
    memory: "512Mi"
  limits:
    cpu: "1000m" # Pode usar até 1 Core em picos
    memory: "768Mi" # Limite Rígido (Hard Limit)
```

_Dica: Configure o `max_old_space_size` do Node.js para 75% do limite de memória do contêiner._

#### 2. Autoscaling Dirigido por Eventos com KEDA

O Horizontal Pod Autoscaler (HPA) nativo escala por CPU/RAM. Isso é reativo e lento.
Se você tem 10.000 mensagens em uma fila SQS, o HPA não escalará até que os pods atuais estalem a CPU consumindo essas mensagens.

**Solução: KEDA (Kubernetes Event-driven Autoscaling)**.
O KEDA escala seus pods com base em métricas externas (Lag do Kafka, Comprimento da Fila SQS/Redis, Cron).

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
spec:
  scaleTargetRef:
    name: order-processor
  minReplicaCount: 2
  maxReplicaCount: 50
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123/orders
        queueLength: "5" # Escala 1 pod para cada 5 mensagens pendentes
```

#### 3. Probes: A Tríade da Disponibilidade

Configurar mal os probes é a causa #1 de "CrashLoopBackOff" infinitos ou downtime durante deployments.

1.  **Startup Probe**: Crítico para apps NestJS/Java que demoram 30s para iniciar. Se não tiver, o Liveness Probe matará o pod antes que ele termine de iniciar.
2.  **Readiness Probe**: Verifica conectividade crítica (BD). Se falhar, remove o pod do Load Balancer.
3.  **Liveness Probe**: Verifica deadlock interno.

```yaml
startupProbe:
  httpGet: { path: /health, port: 3000 }
  failureThreshold: 30
  periodSeconds: 10 # Dá até 300s para iniciar
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
```

#### 4. Service Mesh (Istio/Linkerd) e mTLS

Quando você tem 50 microsserviços, confiar na rede interna do cluster é perigoso (Zero Trust).
Um Service Mesh adiciona um sidecar proxy (Envoy) a cada pod para lidar com:

- **mTLS (Mutual TLS)**: Criptografia automática entre serviços sem tocar no código do app.
- **Canary Deployments**: "Envie 5% do tráfego para a v2.0".
- **Circuit Breakers**: "Se o Serviço B falhar 5 vezes, pare de chamá-lo por 1 minuto".

#### 5. Segurança: Pod Security Standards & Network Policies

Por padrão, qualquer pod pode falar com qualquer pod. Inseguro!
Use **Network Policies** para isolar namespaces.

```yaml
# Negar todo Ingress por padrão
kind: NetworkPolicy
spec:
  podSelector: {}
  policyTypes: [Ingress]
```

Além disso, endureça o contêiner com `securityContext`:

```yaml
securityContext:
  runAsUser: 1000 # Nunca root
  runAsNonRoot: true
  readOnlyRootFilesystem: true # Previne injeção de malware persistente
  allowPrivilegeEscalation: false
```

O Kubernetes é poderoso, mas "Com grande poder vem grande complexidade". Automatize tudo com GitOps (ArgoCD) e nunca faça alterações manuais (`kubectl edit`) em produção.

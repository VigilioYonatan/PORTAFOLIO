### ESPAÑOL (ES)

En el ecosistema de la nube, la resiliencia no es la ausencia de fallos, sino la capacidad de absorber un impacto y recuperarse rápidamente manteniendo el servicio. Para un ingeniero senior en AWS, diseñar sistemas "Cloud-Native" resilientes implica adoptar el caos como una constante. No se trata solo de alta disponibilidad, sino de tolerancia a fallos a nivel regional, gestión de latencias extremas y autoreparación (self-healing).

#### 1. Resiliencia Multi-Región: El Último Bastión

![Multi-Region Architecture](./images/aws-cloud-native-resilience/multi-region.png)

Cuando una región entera de AWS (ej: us-east-1) tiene problemas, tu sistema debe poder conmutar a otra (ej: us-west-2) sin pérdida crítica de servicio.

**Arquitectura Active-Active con Global Accelerator:**
Un senior prefiere arquitecturas Active-Active donde el tráfico se distribuye globalmente.

```hcl
# Terraform: Global Accelerator con endpoints en 2 regiones
resource "aws_globalaccelerator_endpoint_group" "us_east_1" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-east-1"
  endpoint_configuration {
    endpoint_id = aws_lb.us_east_1_alb.arn
    weight      = 50
  }
}

resource "aws_globalaccelerator_endpoint_group" "us_west_2" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-west-2"
  endpoint_configuration {
    endpoint_id = aws_lb.us_west_2_alb.arn
    weight      = 50
  }
}
```

Esto no solo da resiliencia, reduce automáticamente la latencia del usuario final al enrutarlo a la región más cercana.

#### 2. Patrones de Diseño Avanzados

- **Bulkheads (Mamparos)**: Al igual que en un barco, dividimos en compartimentos. Si el servicio de "Pagos" falla, no debe hundir al servicio de "Catálogo". Esto se implementa con Pools de Hilos aislados o Lambdas separadas.
- **Circuit Breakers**: Protegen el sistema de la "cascada de fallos".

```typescript
// Implementación simple con Cockatiel o Opossum
import { CircuitBreaker, Policy } from "cockatiel";

// Romper el circuito si falla el 50% de las peticiones en 10s
const breaker = Policy.handleAll().circuitBreaker(
  10 * 1000,
  new SamplingBreaker({ threshold: 0.5, duration: 10 * 1000 }),
);

export async function resilientCall() {
  try {
    const data = await breaker.execute(() => externalApi.getData());
    return data;
  } catch (err) {
    if (breaker.state === CircuitState.Open) {
      // Fallback: Devolver datos cacheados de Drizzle/Redis
      return await cacheService.getFallbackData();
    }
    throw err;
  }
}
```

#### 3. Chaos Engineering con AWS FIS

La teoría está bien, pero la práctica es mejor. Usamos **AWS Fault Injection Simulator (FIS)** para causar estragos controlados en producción (o staging).

**Escenario de Prueba:**
"Terminar aleatoriamente el 20% de las instancias EC2 en el Auto Scaling Group y verificar si las alarmas de latencia P99 se disparan en menos de 1 minuto."

```json
{
  "actions": {
    "terminate-instances": {
      "actionId": "aws:ec2:terminate-instances",
      "parameters": {},
      "targets": { "Instances": "my-asg-instances" }
    }
  },
  "stopConditions": [
    { "source": "aws:cloudwatch:alarm", "value": "arn:aws:cloudwatch:..." }
  ]
}
```

#### 4. Observabilidad Resiliente

Si durante un desastre tu sistema de monitoreo también cae (porque corre en la misma región), estás volando a ciegas.

- **Cross-Region Logging**: Configurar CloudWatch para replicar logs críticos y métricas a una región de "Observabilidad" separada.
- **Synthetic Canaries**: Usar AWS CloudWatch Synthetics para simular tráfico de usuario real desde fuera de tu VPC, validando que el flujo (Login -> Checkout) funciona incluso si tus métricas internas dicen "todo OK".

#### 5. Base de Datos Resiliente (Drizzle + Aurora Global)

La base de datos suele ser el punto único de fallo.

- **Aurora Global Database**: Replica datos fisicamente a otra región con < 1s de latencia.
- **Drizzle Read Replicas**:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const primaryPool = new Pool({ connectionString: process.env.DB_PRIMARY });
const replicaPool = new Pool({ connectionString: process.env.DB_REPLICA });

// Drizzle soporta nativamente separar lectura/escritura
export const db = drizzle(primaryPool, {
  logger: true,
  replicas: [replicaPool] // Automáticamente usa esto para .select() si se configura
  // Nota: Drizzle standard necesita lógica custom o drivers que soporten split,
  // pero conceptualmente separamos los pools.
});

async function getProduct(id: number) {
    // Usar explícitamente la réplica para lecturas masivas
    return await drizzle(replicaPool).select().from(products)...;
}
```

#### Conclusión

La resiliencia en AWS no se compra, se diseña. Requiere un cambio de mentalidad: de "evitar que falle" a "mitigar el impacto cuando falle". Adoptando patrones multi-región, circuit breakers y chaos engineering, transformamos aplicaciones frágiles en sistemas antifrágiles que mejoran bajo estrés.

---

### ENGLISH (EN)

In the cloud ecosystem, resilience is not the absence of failure, but the ability to absorb impact and recover quickly while maintaining service. For a senior AWS engineer, designing resilient "Cloud-Native" systems involves embracing chaos as a constant. It's not just about high availability, but regional fault tolerance, extreme latency management, and self-healing.

#### 1. Multi-Region Resilience: The Last Bastion

![Multi-Region Architecture](./images/aws-cloud-native-resilience/multi-region.png)

When an entire AWS region (e.g., us-east-1) goes down, your system must switch to another (e.g., us-west-2) without critical service loss.

**Active-Active Architecture with Global Accelerator:**
A senior engineer prefers Active-Active architectures where traffic is distributed globally.

```hcl
# Terraform: Global Accelerator with endpoints in 2 regions
resource "aws_globalaccelerator_endpoint_group" "us_east_1" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-east-1"
  endpoint_configuration {
    endpoint_id = aws_lb.us_east_1_alb.arn
    weight      = 50
  }
}

resource "aws_globalaccelerator_endpoint_group" "us_west_2" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-west-2"
  endpoint_configuration {
    endpoint_id = aws_lb.us_west_2_alb.arn
    weight      = 50
  }
}
```

This not only provides resilience but automatically reduces end-user latency by routing them to the closest region.

#### 2. Advanced Design Patterns

- **Bulkheads**: Like in a ship, we divide into compartments. If "Payment" service fails, it shouldn't sink the "Catalog". Implemented with isolated Thread Pools or separate Lambdas.
- **Circuit Breakers**: Protect the system from "cascading failures".

```typescript
// Simple implementation with Cockatiel or Opossum
import { CircuitBreaker, Policy } from "cockatiel";

// Break circuit if 50% of requests fail in 10s
const breaker = Policy.handleAll().circuitBreaker(
  10 * 1000,
  new SamplingBreaker({ threshold: 0.5, duration: 10 * 1000 }),
);

export async function resilientCall() {
  try {
    const data = await breaker.execute(() => externalApi.getData());
    return data;
  } catch (err) {
    if (breaker.state === CircuitState.Open) {
      // Fallback: Return cached data from Drizzle/Redis
      return await cacheService.getFallbackData();
    }
    throw err;
  }
}
```

#### 3. Chaos Engineering with AWS FIS

Theory is good, practice is better. We use **AWS Fault Injection Simulator (FIS)** to cause controlled havoc in production (or staging).

**Test Scenario:**
"terminate randomly 20% of EC2 instances in the Auto Scaling Group and verify if P99 latency alarms fire in less than 1 minute."

```json
{
  "actions": {
    "terminate-instances": {
      "actionId": "aws:ec2:terminate-instances",
      "parameters": {},
      "targets": { "Instances": "my-asg-instances" }
    }
  },
  "stopConditions": [
    { "source": "aws:cloudwatch:alarm", "value": "arn:aws:cloudwatch:..." }
  ]
}
```

#### 4. Resilient Observability

If your monitoring system also fails during a disaster (because it runs in the same region), you are flying blind.

- **Cross-Region Logging**: Configure CloudWatch to replicate critical logs and metrics to a separate "Observability" region.
- **Synthetic Canaries**: Use AWS CloudWatch Synthetics to simulate real user traffic from outside your VPC, validating that the flow (Login -> Checkout) works even if internal metrics say "all OK".

#### 5. Resilient Database (Drizzle + Aurora Global)

The database is usually the single point of failure.

- **Aurora Global Database**: Physically replicates data to another region with < 1s latency.
- **Drizzle Read Replicas**:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const primaryPool = new Pool({ connectionString: process.env.DB_PRIMARY });
const replicaPool = new Pool({ connectionString: process.env.DB_REPLICA });

// Drizzle natively supports separate read/write conceptually
export const db = drizzle(primaryPool, {
  logger: true,
});

async function getProduct(id: number) {
    // Explicitly use replica for massive reads
    return await drizzle(replicaPool).select().from(products)...;
}
```

#### Conclusion

Resilience in AWS isn't bought, it's designed. It requires a mindset shift: from "preventing failure" to "mitigating impact when it fails." By adopting multi-region patterns, circuit breakers, and chaos engineering, we transform fragile applications into antifragile systems that improve under stress.

---

### PORTUGUÊS (PT)

No ecossistema da nuvem, a resiliência não é a ausência de falhas, mas a capacidade de absorver um impacto e se recuperar rapidamente mantendo o serviço. Para um engenheiro sênior da AWS, projetar sistemas "Cloud-Native" resilientes envolve adotar o caos como uma constante. Não se trata apenas de alta disponibilidade, mas de tolerância a falhas em nível regional, gerenciamento de latências extremas e autorreparo (self-healing).

#### 1. Resiliência Multi-Região: O Último Bastião

![Multi-Region Architecture](./images/aws-cloud-native-resilience/multi-region.png)

Quando toda uma região da AWS (ex: us-east-1) tem problemas, seu sistema deve ser capaz de mudar para outra (ex: us-west-2) sem perda crítica de serviço.

**Arquitetura Active-Active com Global Accelerator:**
Um sênior prefere arquiteturas Active-Active onde o tráfego é distribuído globalmente.

```hcl
# Terraform: Global Accelerator com endpoints em 2 regiões
resource "aws_globalaccelerator_endpoint_group" "us_east_1" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-east-1"
  endpoint_configuration {
    endpoint_id = aws_lb.us_east_1_alb.arn
    weight      = 50
  }
}

resource "aws_globalaccelerator_endpoint_group" "us_west_2" {
  listener_arn = aws_globalaccelerator_listener.example.id
  endpoint_group_region = "us-west-2"
  endpoint_configuration {
    endpoint_id = aws_lb.us_west_2_alb.arn
    weight      = 50
  }
}
```

Isso não só oferece resiliência, mas reduz automaticamente a latência do usuário final roteando-o para a região mais próxima.

#### 2. Padrões de Design Avançados

- **Bulkheads (Anteparas)**: Como em um navio, dividimos em compartimentos. Se o serviço de "Pagamentos" falhar, não deve afundar o "Catálogo". Implementado com Pools de Threads isolados ou Lambdas separadas.
- **Circuit Breakers**: Protegem o sistema da "cascata de falhas".

```typescript
// Implementação simples com Cockatiel ou Opossum
import { CircuitBreaker, Policy } from "cockatiel";

// Abrir o circuito se 50% das requisições falharem em 10s
const breaker = Policy.handleAll().circuitBreaker(
  10 * 1000,
  new SamplingBreaker({ threshold: 0.5, duration: 10 * 1000 }),
);

export async function resilientCall() {
  try {
    const data = await breaker.execute(() => externalApi.getData());
    return data;
  } catch (err) {
    if (breaker.state === CircuitState.Open) {
      // Fallback: Retornar dados em cache do Drizzle/Redis
      return await cacheService.getFallbackData();
    }
    throw err;
  }
}
```

#### 3. Chaos Engineering com AWS FIS

A teoria é boa, mas a prática é melhor. Usamos **AWS Fault Injection Simulator (FIS)** para causar estragos controlados em produção (ou staging).

**Cenário de Teste:**
"Terminar aleatoriamente 20% das instâncias EC2 no Auto Scaling Group e verificar se os alarmes de latência P99 disparam em menos de 1 minuto."

```json
{
  "actions": {
    "terminate-instances": {
      "actionId": "aws:ec2:terminate-instances",
      "parameters": {},
      "targets": { "Instances": "my-asg-instances" }
    }
  },
  "stopConditions": [
    { "source": "aws:cloudwatch:alarm", "value": "arn:aws:cloudwatch:..." }
  ]
}
```

#### 4. Observabilidade Resiliente

Se durante um desastre seu sistema de monitoramento também cair (porque roda na mesma região), você está voando às cegas.

- **Cross-Region Logging**: Configurar CloudWatch para replicar logs críticos e métricas para uma região de "Observabilidade" separada.
- **Synthetic Canaries**: Usar AWS CloudWatch Synthetics para simular tráfego de usuário real de fora da sua VPC, validando que o fluxo (Login -> Checkout) funciona mesmo se suas métricas internas dizem "tudo OK".

#### 5. Banco de Dados Resiliente (Drizzle + Aurora Global)

O banco de dados é geralmente o ponto único de falha.

- **Aurora Global Database**: Replica dados fisicamente para outra região com < 1s de latência.
- **Drizzle Read Replicas**:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const primaryPool = new Pool({ connectionString: process.env.DB_PRIMARY });
const replicaPool = new Pool({ connectionString: process.env.DB_REPLICA });

// Drizzle suporta nativamente separar leitura/escrita conceitualmente
export const db = drizzle(primaryPool, {
  logger: true,
});

async function getProduct(id: number) {
    // Usar explicitamente a réplica para leituras massivas
    return await drizzle(replicaPool).select().from(products)...;
}
```

#### Conclusão

A resiliência na AWS não é comprada, é projetada. Requer uma mudança de mentalidade: de "evitar que falhe" para "mitigar o impacto quando falhar". Adotando padrões multi-região, circuit breakers e chaos engineering, transformamos aplicações frágeis em sistemas antifrágeis que melhoram sob estresse.

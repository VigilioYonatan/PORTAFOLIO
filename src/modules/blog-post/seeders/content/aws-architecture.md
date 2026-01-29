### ESPAÑOL (ES)

Diseñar arquitectura en AWS para 2024 va más allá de lanzar instancias EC2. Se trata de construir sistemas serverless o basados en contenedores que sean resilientes, rentables y seguros por diseño. En este artículo, desglosaremos una arquitectura de referencia para una aplicación empresarial de alta escala utilizando el "Well-Architected Framework", integrando servicios como Lambda, Fargate, Aurora Serverless v2 y EventBridge.

#### 1. Compute: De EC2 a Fargate y Lambda

![AWS Compute Evolution](./images/aws-architecture/compute.png)

Para cargas de trabajo modernas, evitamos gestionar servidores (EC2) directamente.

- **API REST/GraphQL**: Desplegamos nuestros servicios NestJS en **AWS Fargate** (ECS). Fargate elimina la gestión del clúster subyacente, permitiéndonos definir simplemente CPU y RAM en la definición de tarea.
- **Procesamiento de Eventos**: Para disparadores asíncronos (S3 uploads, DynamoDB Streams), **AWS Lambda** es insuperable.
- **Cold Starts**: Mitigamos los arranques en frío de Lambda usando _Provisioned Concurrency_ para funciones críticas o migrando a Fargate para cargas constantes.

#### 2. Base de Datos: Aurora Serverless v2

El cuello de botella tradicional de escalabilidad es la base de datos relacional. **Aurora Serverless v2** cambia el juego escalando verticalmente (ACUs) en milisegundos, no minutos.

```typescript
// infrastructure-cdk.ts
const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_2,
  }),
  serverlessV2MinCapacity: 0.5, // Escalado hasta 0.5 ACU (1GB RAM) para ahorrar costos en idle
  serverlessV2MaxCapacity: 16, // Escalado automático hasta 32GB RAM bajo carga
  writers: rds.ClusterInstance.serverlessV2("Writer"),
  readers: [
    rds.ClusterInstance.serverlessV2("Reader", { scaleWithWriter: true }),
  ],
});
```

Integramos esto con **RDS Proxy** para gestionar el pool de conexiones, vital cuando miles de Lambdas intentan conectar simultáneamente.

#### 3. Event-Driven Architecture con EventBridge

En lugar de llamadas HTTP síncronas entre microservicios (que crean acoplamiento temporal), usamos **EventBridge**.

- **Schema Registry**: Definimos esquemas de eventos estrictos.
- **Rules**: El servicio de "Pedidos" emite un evento `OrderPlaced`. EventBridge lo enruta a 3 destinos: Servicio de Facturación, Servicio de Logística y un Firehose data lake para analítica. Todo sin que el Servicio de Pedidos conozca a los consumidores.

#### 4. Seguridad y Networking (VPC Lattice)

La seguridad perimetral es crítica. Implementamos una estrategia de **Defense in Depth**:

- **WAF (Web Application Firewall)**: Frente al ALB/API Gateway para bloquear inyecciones SQL y ataques XSS.
- **Private Subnets**: Todas las bases de datos y lógica de negocio viven en subredes privadas sin acceso directo a internet (usando NAT Gateway para salidas).
- **VPC Lattice**: La nueva forma moderna de conectar servicios. A diferencia de VPC Peering o Transit Gateway, Lattice opera en la capa de aplicación, permitiendo políticas de autenticación (IAM) granulares entre servicios ("El servicio A solo puede llamar GET /products en el servicio B").

#### 5. Infraestructura como Código (IaC) con CDK

No hacemos clic en la consola. Toda la infraestructura se define en TypeScript usando **AWS CDK**.

```typescript
// Definiendo una pila de infraestructura segura
export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MainVPC", {
      maxAzs: 3, // Alta disponibilidad en 3 zonas
      natGateways: 1,
    });

    // ... más recursos definidos con tipado fuerte
  }
}
```

Esta arquitectura no solo es escalable, sino que es auditable, reproducible y resiliente a fallos de zona.

---

### ENGLISH (EN)

Designing AWS architecture for 2024 goes beyond launching EC2 instances. It is about building serverless or container-based systems that are resilient, cost-effective, and secure by design. In this article, we will break down a reference architecture for a high-scale enterprise application using the "Well-Architected Framework," integrating services like Lambda, Fargate, Aurora Serverless v2, and EventBridge.

#### 1. Compute: From EC2 to Fargate and Lambda

![AWS Compute Evolution](./images/aws-architecture/compute.png)

For modern workloads, we avoid managing servers (EC2) directly.

- **REST/GraphQL API**: We deploy our NestJS services on **AWS Fargate** (ECS). Fargate eliminates underlying cluster management, allowing us to simply define CPU and RAM in the task definition.
- **Event Processing**: For asynchronous triggers (S3 uploads, DynamoDB Streams), **AWS Lambda** is unbeaten.
- **Cold Starts**: We mitigate Lambda cold starts using _Provisioned Concurrency_ for critical functions or migrating to Fargate for consistent loads.

#### 2. Database: Aurora Serverless v2

The traditional scalability bottleneck is the relational database. **Aurora Serverless v2** changes the game by scaling vertically (ACUs) in milliseconds, not minutes.

```typescript
// infrastructure-cdk.ts
const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_2,
  }),
  serverlessV2MinCapacity: 0.5, // Scale down to 0.5 ACU (1GB RAM) to save costs on idle
  serverlessV2MaxCapacity: 16, // Auto-scale up to 32GB RAM under load
  writers: rds.ClusterInstance.serverlessV2("Writer"),
  readers: [
    rds.ClusterInstance.serverlessV2("Reader", { scaleWithWriter: true }),
  ],
});
```

We integrate this with **RDS Proxy** to manage connection pooling, vital when thousands of Lambdas attempt to connect simultaneously.

#### 3. Event-Driven Architecture with EventBridge

Instead of synchronous HTTP calls between microservices (which create temporal coupling), we use **EventBridge**.

- **Schema Registry**: We define strict event schemas.
- **Rules**: The "Orders" service emits an `OrderPlaced` event. EventBridge routes it to 3 destinations: Billing Service, Logistics Service, and a Firehose data lake for analytics. All without the Orders Service knowing the consumers.

#### 4. Security and Networking (VPC Lattice)

Perimeter security is critical. We implement a **Defense in Depth** strategy:

- **WAF (Web Application Firewall)**: Fronting the ALB/API Gateway to block SQL injections and XSS attacks.
- **Private Subnets**: All databases and business logic live in private subnets with no direct internet access (using NAT Gateway for egress).
- **VPC Lattice**: The new modern way to connect services. Unlike VPC Peering or Transit Gateway, Lattice operates at the application layer, allowing granular authentication policies (IAM) between services ("Service A can only call GET /products on Service B").

#### 5. Infrastructure as Code (IaC) with CDK

We do not click in the console. All infrastructure is defined in TypeScript using **AWS CDK**.

```typescript
// Defining a secure infrastructure stack
export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MainVPC", {
      maxAzs: 3, // High availability across 3 zones
      natGateways: 1,
    });

    // ... more resources defined with strong typing
  }
}
```

This architecture is not only scalable but also auditable, reproducible, and resilient to zone failures.

---

### PORTUGUÊS (PT)

Projetar arquitetura na AWS para 2024 vai além de lançar instâncias EC2. Trata-se de construir sistemas serverless ou baseados em contêineres que sejam resilientes, econômicos e seguros por design. Neste artigo, detalharemos uma arquitetura de referência para uma aplicação empresarial de alta escala usando o "Well-Architected Framework", integrando serviços como Lambda, Fargate, Aurora Serverless v2 e EventBridge.

#### 1. Computação: De EC2 para Fargate e Lambda

![AWS Compute Evolution](./images/aws-architecture/compute.png)

Para cargas de trabalho modernas, evitamos gerenciar servidores (EC2) diretamente.

- **API REST/GraphQL**: Implantamos nossos serviços NestJS no **AWS Fargate** (ECS). O Fargate elimina o gerenciamento do cluster subjacente, permitindo-nos definir simplesmente CPU e RAM na definição da tarefa.
- **Processamento de Eventos**: Para gatilhos assíncronos (uploads S3, DynamoDB Streams), o **AWS Lambda** é imbatível.
- **Cold Starts**: Mitigamos as inicializações a frio do Lambda usando _Provisioned Concurrency_ para funções críticas ou migrando para Fargate para cargas constantes.

#### 2. Banco de Dados: Aurora Serverless v2

O gargalo tradicional de escalabilidade é o banco de dados relacional. **Aurora Serverless v2** muda o jogo escalando verticalmente (ACUs) em milissegundos, não minutos.

```typescript
// infrastructure-cdk.ts
const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_2,
  }),
  serverlessV2MinCapacity: 0.5, // Escalonamento até 0.5 ACU (1GB RAM) para economizar custos em ociosidade
  serverlessV2MaxCapacity: 16, // Escalonamento automático até 32GB RAM sob carga
  writers: rds.ClusterInstance.serverlessV2("Writer"),
  readers: [
    rds.ClusterInstance.serverlessV2("Reader", { scaleWithWriter: true }),
  ],
});
```

Integramos isso com **RDS Proxy** para gerenciar o pool de conexões, vital quando milhares de Lambdas tentam verificar simultaneamente.

#### 3. Arquitetura Orientada a Eventos com EventBridge

Em vez de chamadas HTTP síncronas entre microsserviços (que criam acoplamento temporal), usamos **EventBridge**.

- **Schema Registry**: Definimos esquemas de eventos estritos.
- **Rules**: O serviço de "Pedidos" emite um evento `OrderPlaced`. O EventBridge o roteia para 3 destinos: Serviço de Faturamento, Serviço de Logística e um data lake Firehose para análise. Tudo sem que o Serviço de Pedidos conheça os consumidores.

#### 4. Segurança e Rede (VPC Lattice)

A segurança perimetral é crítica. Implementamos uma estratégia de **Defesa em Profundidade**:

- **WAF (Web Application Firewall)**: Frente ao ALB/API Gateway para bloquear injeções SQL e ataques XSS.
- **Private Subnets**: Todos os bancos de dados e lógica de negócios residem em sub-redes privadas sem acesso direto à internet (usando NAT Gateway para saída).
- **VPC Lattice**: A nova forma moderna de conectar serviços. Ao contrário do VPC Peering ou Transit Gateway, o Lattice opera na camada de aplicação, permitindo políticas de autenticação (IAM) granulares, entre serviços ("O serviço A só pode chamar GET /products no serviço B").

#### 5. Infraestrutura como Código (IaC) com CDK

Não clicamos no console. Toda a infraestrutura é definida em TypeScript usando **AWS CDK**.

```typescript
// Definindo uma pilha de infraestrutura segura
export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MainVPC", {
      maxAzs: 3, // Alta disponibilidade em 3 zonas
      natGateways: 1,
    });

    // ... mais recursos definidos com tipagem forte
  }
}
```

Esta arquitetura não é apenas escalável, mas também auditável, reproduzível e resiliente a falhas de zona.

### ESPAÑOL (ES)

El mantra de la nube es "todo falla todo el tiempo". Creer que `us-east-1` es invencible es ingenuo; la historia ha demostrado que regiones enteras pueden desaparecer por horas. La recuperación ante desastres (DR) no es una póliza de seguro, es una característica de ingeniería.

No se trata solo de backups. Se trata de **RTO** (Objetivo de Tiempo de Recuperación) y **RPO** (Objetivo de Punto de Recuperación). ¿Cuántos datos puedes perder? ¿Cuánto tiempo puedes estar offline?

#### 1. Estrategias de DR: Costo vs. Disponibilidad

![Disaster Recovery Strategies](./images/cloud-native-disaster-recovery/dr-strategies.png)

1.  **Backup & Restore (RTO: Horas, RPO: 24h)**: Barato. Recuperar desde S3 Glacier. Solo para sistemas no críticos.
2.  **Pilot Light (RTO: Minutos)**: Datos replicados en tiempo real, compute apagado. La "llama piloto" está encendida.
3.  **Warm Standby**: Compute escalado al mínimo en la región DR.
4.  **Multi-Site Active-Active (RTO: ~0)**: Carísimo. Tráfico balanceado entre regiones.

Para la mayoría de empresas Tier-1, **Pilot Light** es el balance perfecto costo-beneficio.

#### 2. La Capa de Datos: Replicación Global

La parte más difícil del DR es el estado (State). El código es fácil de replicar, los datos no.

**Amazon Aurora Global Database**
Utiliza replicación física a nivel de almacenamiento (no lógica SQL), logrando una latencia de replicación de < 1 segundo entre continentes con un impacto insignificante en el rendimiento del primario.

```hcl
# Terraform: Aurora Global Cluster
resource "aws_rds_global_cluster" "main" {
  global_cluster_identifier = "global-db"
  engine                    = "aurora-postgresql"
  engine_version            = "14.5"
  storage_encrypted         = true
}
```

En caso de desastre, promover la región secundaria (`failover-global-cluster`) toma menos de 1 minuto.

#### 3. Infraestructura como Código (IaC) Multi-Región

No intentes recrear tu infraestructura manualmente durante un incendio. Tu código Terraform debe ser agnóstico de la región.

```hcl
# main.tf
module "app_primary" {
  source = "./modules/app"
  providers = { aws = aws.us_east_1 }
  db_cluster_arn = aws_rds_global_cluster.main.arn
}

module "app_dr" {
  source = "./modules/app"
  providers = { aws = aws.us_west_2 }
  # En modo DR, escalamos a 0 para ahorrar
  instance_count = var.disaster_mode ? 10 : 0
  db_cluster_arn = aws_rds_global_cluster.main.arn
}
```

#### 4. El "Botón Rojo": Ruteo de Tráfico Resiliente

Si Route53 (el servicio DNS) falla, perderás el control. AWS ofrece **Route53 Application Recovery Controller (ARC)**, un conjunto de APIs y clusters físicos dedicados exclusivamente a redirigir tráfico durante desastres, independientes del plano de control normal.

Configuramos "Routing Controls" (switches on/off) para redirigir el tráfico globalmente de `us-east-1` a `us-west-2` sin esperar la propagación DNS TTL tradicional, usando Anycast.

#### 5. Chaos Engineering: Validando la Teoría

Si no pruebas tu DR, no tienes DR. Tienes una esperanza.
Netflix inventó Chaos Monkey para matar servidores aleatoriamente. Hoy usamos **AWS Fault Injection Simulator (FIS)**.

**Experimento**:

1.  Detener todas las instancias EC2 en la zona A.
2.  Inyectar latencia de 500ms en la conexión a la base de datos.
3.  Cortar la conectividad entre microservicios.

Tu sistema debe ser capaz de autocurarse o degradarse graciosamente sin intervención humana.

---

### ENGLISH (EN)

The cloud mantra is "everything fails all the time." Believing `us-east-1` is invincible is naive; history has shown entire regions can vanish for hours. Disaster Recovery (DR) is not an insurance policy, it is an engineering feature.

It's not just about backups. It's about **RTO** (Recovery Time Objective) and **RPO** (Recovery Point Objective). How much data can you lose? How long can you be offline?

#### 1. DR Strategies: Cost vs. Availability

![Disaster Recovery Strategies](./images/cloud-native-disaster-recovery/dr-strategies.png)

1.  **Backup & Restore (RTO: Hours, RPO: 24h)**: Cheap. Restore from S3 Glacier. Only for non-critical systems.
2.  **Pilot Light (RTO: Minutes)**: Data replicated in real-time, compute off. The "pilot light" is lit.
3.  **Warm Standby**: Compute scaled to minimum in DR region.
4.  **Multi-Site Active-Active (RTO: ~0)**: Very expensive. Traffic balanced between regions.

For most Tier-1 companies, **Pilot Light** is the perfect cost-benefit balance.

#### 2. The Data Layer: Global Replication

The hardest part of DR is State. Code is easy to replicate, data is not.

**Amazon Aurora Global Database**
Uses physical replication at the storage level (not SQL logical), achieving < 1 second replication latency between continents with negligible performance impact on the primary.

```hcl
# Terraform: Aurora Global Cluster
resource "aws_rds_global_cluster" "main" {
  global_cluster_identifier = "global-db"
  engine                    = "aurora-postgresql"
  engine_version            = "14.5"
  storage_encrypted         = true
}
```

In a disaster, promoting the secondary region (`failover-global-cluster`) takes less than 1 minute.

#### 3. Multi-Region Infrastructure as Code (IaC)

Do not try to recreate your infrastructure manually during a fire. Your Terraform code must be region-agnostic.

```hcl
# main.tf
module "app_primary" {
  source = "./modules/app"
  providers = { aws = aws.us_east_1 }
  db_cluster_arn = aws_rds_global_cluster.main.arn
}

module "app_dr" {
  source = "./modules/app"
  providers = { aws = aws.us_west_2 }
  # In DR mode, we scale to 0 to save money
  instance_count = var.disaster_mode ? 10 : 0
  db_cluster_arn = aws_rds_global_cluster.main.arn
}
```

#### 4. The "Red Button": Resilient Traffic Routing

If Route53 (the DNS service) fails, you lose control. AWS offers **Route53 Application Recovery Controller (ARC)**, a set of APIs and physical clusters dedicated exclusively to rerouting traffic during disasters, independent of the normal control plane.

We configure "Routing Controls" (on/off switches) to globally redirect traffic from `us-east-1` to `us-west-2` without waiting for traditional DNS TTL propagation, using Anycast.

#### 5. Chaos Engineering: Validating Theory

If you don't test your DR, you don't have DR. You have hope.
Netflix invented Chaos Monkey to randomly kill servers. Today we use **AWS Fault Injection Simulator (FIS)**.

**Experiment**:

1.  Stop all EC2 instances in Zone A.
2.  Inject 500ms latency into database connection.
3.  Cut connectivity between microservices.

Your system must be able to self-heal or degrade gracefully without human intervention.

---

### PORTUGUÊS (PT)

O mantra da nuvem é "tudo falha o tempo todo". Acreditar que `us-east-1` é invencível é ingênuo; a história mostrou que regiões inteiras podem desaparecer por horas. A Recuperação de Desastres (DR) não é uma apólice de seguro, é um recurso de engenharia.

Não se trata apenas de backups. Trata-se de **RTO** (Objetivo de Tempo de Recuperação) e **RPO** (Objetivo de Ponto de Recuperação). Quantos dados você pode perder? Quanto tempo você pode ficar offline?

#### 1. Estratégias de DR: Custo vs. Disponibilidade

![Disaster Recovery Strategies](./images/cloud-native-disaster-recovery/dr-strategies.png)

1.  **Backup & Restore (RTO: Horas, RPO: 24h)**: Barato. Restaurar do S3 Glacier. Apenas para sistemas não críticos.
2.  **Pilot Light (RTO: Minutos)**: Dados replicados em tempo real, computação desligada. A "chama piloto" está acesa.
3.  **Warm Standby**: Computação escalada para o mínimo na região de DR.
4.  **Multi-Site Active-Active (RTO: ~0)**: Muito caro. Tráfego balanceado entre regiões.

Para a maioria das empresas Tier-1, **Pilot Light** é o equilíbrio perfeito entre custo e benefício.

#### 2. A Camada de Dados: Replicação Global

A parte mais difícil do DR é o Estado (State). O código é fácil de replicar, os dados não.

**Amazon Aurora Global Database**
Utiliza replicação física no nível de armazenamento (não lógica SQL), alcançando latência de replicação < 1 segundo entre continentes com impacto insignificante no desempenho do primário.

```hcl
# Terraform: Aurora Global Cluster
resource "aws_rds_global_cluster" "main" {
  global_cluster_identifier = "global-db"
  engine                    = "aurora-postgresql"
  engine_version            = "14.5"
  storage_encrypted         = true
}
```

Em caso de desastre, promover a região secundária (`failover-global-cluster`) leva menos de 1 minuto.

#### 3. Infraestrutura como Código (IaC) Multi-Região

Não tente recriar sua infraestrutura manualmente durante um incêndio. Seu código Terraform deve ser agnóstico quanto à região.

```hcl
# main.tf
module "app_primary" {
  source = "./modules/app"
  providers = { aws = aws.us_east_1 }
  db_cluster_arn = aws_rds_global_cluster.main.arn
}

module "app_dr" {
  source = "./modules/app"
  providers = { aws = aws.us_west_2 }
  # No modo DR, escalamos para 0 para economizar
  instance_count = var.disaster_mode ? 10 : 0
  db_cluster_arn = aws_rds_global_cluster.main.arn
}
```

#### 4. O "Botão Vermelho": Roteamento de Tráfego Resiliente

Se o Route53 (o serviço DNS) falhar, você perde o controle. A AWS oferece o **Route53 Application Recovery Controller (ARC)**, um conjunto de APIs e clusters físicos dedicados exclusivamente a redirecionar o tráfego durante desastres, independentes do plano de controle normal.

Configuramos "Controles de Roteamento" (switches liga/desliga) para redirecionar globalmente o tráfego de `us-east-1` para `us-west-2` sem esperar a propagação tradicional de TTL de DNS, usando Anycast.

#### 5. Engenharia do Caos: Validando a Teoria

Se você não testar seu DR, você não tem DR. Você tem esperança.
A Netflix inventou o Chaos Monkey para matar servidores aleatoriamente. Hoje usamos **AWS Fault Injection Simulator (FIS)**.

**Experimento**:

1.  Parar todas as instâncias EC2 na Zona A.
2.  Injetar latência de 500ms na conexão com o banco de dados.
3.  Cortar conectividade entre microsserviços.

Seu sistema deve ser capaz de se autocurar ou degradar graciosamente sem intervenção humana.

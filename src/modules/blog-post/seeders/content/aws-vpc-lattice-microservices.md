### ESPAÑOL (ES)

La conectividad de microservicios en AWS ha sido históricamente un rompecabezas de infraestructura. VPC Peering no escala más allá de unas pocas docenas de VPCs, Transit Gateway añade latencia y complejidad de enrutamiento, y PrivateLink requiere endpoints específicos por servicio. Además, el modelo de seguridad basado en IPs (Security Groups) se rompe en entornos dinámicos como Kubernetes.

**AWS VPC Lattice** es la respuesta de AWS para modernizar esta capa. No es solo un "load balancer"; es una red de superposición a nivel de aplicación (L7) que abstrae la topología de red subyacente. En este artículo, analizaremos cómo Lattice elimina la necesidad de sidecars (como Istio) y simplifica drásticamente la conectividad Multi-Cuenta.

#### 1. Service Network: El Nuevo Bus de Servicios

![AWS VPC Lattice Architecture](./images/aws-vpc-lattice-microservices/architecture.png)

Lattice introduce el concepto de **Service Network**, un dominio lógico administrativo.

- **Topología Plana**: Servicios en diferentes VPCs y diferentes Cuentas AWS pueden comunicarse como si estuvieran en la misma red local, siempre que estén asociados a la misma Service Network.
- **DNS Global**: Lattice asigna nombres DNS únicos y gestionados.
  - `https://payment-service.0123456789abcdef.lattice-1.us-east-1.on.aws`
  - También soporta **CNAMEs personalizados** (ej: `https://payments.internal`), manejando automáticamente los certificados SSL/TLS.

#### 2. Integración con EKS (Kubernetes Gateway API)

Lattice no requiere que cambies tu código, pero brilla cuando se integra con EKS mediante el **AWS Gateway API Controller**.
En lugar de crear `Ingress` objetos (ALB), defines `HTTPRoute` y `Gateway`.

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: checkout-route
  annotations:
    application-networking.k8s.aws/lattice-target-group-name: checkout-tg
spec:
  parentRefs:
    - name: my-hotel-gateway
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /checkout
      backendRefs:
        - name: checkout-service
          port: 8080
```

Esta configuración crea automáticamente el Servicio Lattice, los Target Groups y asocia los Pods de Kubernetes directamente como targets (IP mode), eliminando saltos innecesarios (NodePort).

#### 3. Autenticación Zero Trust con IAM (SigV4)

Olvídate de mTLS y la pesadilla de rotar certificados. Lattice utiliza **AWS IAM** para autenticación servicio-a-servicio.
El "caller" (ej. una Lambda o un Pod con IAM Role) firma la petición HTTP usando Signature Version 4 (SigV4).

**Política de Autenticación Granular**:
Puedes definir políticas que parecen reglas de firewall, pero operan sobre identidades y rutas HTTP.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReportsService",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/ReportsServiceRole"
      },
      "Action": "vpc-lattice-svcs:Invoke",
      "Resource": "*",
      "Condition": {
        "StringEquals": { "vpc-lattice-svcs:RequestMethod": "GET" }
      }
    }
  ]
}
```

Si un servicio no autorizado intenta un `POST`, Lattice rechaza la conexión en el borde (**403 Forbidden**), protegiendo tus recursos computacionales de ataques DDoS internos.

#### 4. Compartición Multi-Cuenta con AWS RAM

En empresas grandes, los servicios viven en cuentas AWS separadas.
Lattice se integra con **AWS Resource Access Manager (RAM)**.

1.  La cuenta de "Plataforma" crea la Service Network.
2.  Comparte la red con la Organización AWS o OUs específicas.
3.  Las cuentas "Producto" asocian sus VPCs y Servicios a esa red compartida.
    **Resultado**: Conectividad instantánea cross-account sin tocar tablas de rutas, VPC Peering ni complejas configuraciones de Transit Gateway.

#### 5. Costos y Consideraciones

Lattice no es barato.

- **Cargo por servicio**: ~$0.025/hora por servicio provisionado.
- **Cargo por tráfico**: ~$0.025/GB procesado.

**Comparativa**:

- **VPC Peering**: Gratis (solo transferencia de datos). Complejo de gestionar a escala.
- **PrivateLink**: Caro por endpoint. Unidireccional.
- **Transit Gateway**: Caro por attachment + tráfico. Latencia añadida.
- **Lattice**: Costo medio-alto, pero ahorro masivo en horas de ingeniería y mantenimiento de Service Mesh (Istio/Linkerd).

Para arquitecturas modernas serverless o basadas en contenedores distribuidos, el ahorro en complejidad operativa justifica la inversión en Lattice.

---

### ENGLISH (EN)

Connecting microservices in AWS has historically been an infrastructure puzzle. VPC Peering doesn't scale beyond a few dozen VPCs, Transit Gateway adds latency and routing complexity, and PrivateLink requires specific endpoints per service. Furthermore, the IP-based security model (Security Groups) breaks down in dynamic environments like Kubernetes.

**AWS VPC Lattice** is AWS's answer to modernizing this layer. It is not just a "load balancer"; it is an application-layer (L7) overlay network that abstracts the underlying network topology. In this article, we will analyze how Lattice eliminates the need for sidecars (like Istio) and drastically simplifies Multi-Account connectivity.

#### 1. Service Network: The New Service Bus

![AWS VPC Lattice Architecture](./images/aws-vpc-lattice-microservices/architecture.png)

Lattice introduces the concept of **Service Network**, a logical administrative domain.

- **Flat Topology**: Services in different VPCs and different AWS Accounts can communicate as if they were on the same local network, providing they are associated with the same Service Network.
- **Global DNS**: Lattice assigns unique, managed DNS names.
  - `https://payment-service.0123456789abcdef.lattice-1.us-east-1.on.aws`
  - It also supports **Custom CNAMEs** (e.g., `https://payments.internal`), automatically handling SSL/TLS certificates.

#### 2. EKS Integration (Kubernetes Gateway API)

Lattice doesn't require you to change your code, but it shines when integrated with EKS via the **AWS Gateway API Controller**.
Instead of creating `Ingress` objects (ALB), you define `HTTPRoute` and `Gateway`.

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: checkout-route
  annotations:
    application-networking.k8s.aws/lattice-target-group-name: checkout-tg
spec:
  parentRefs:
    - name: my-hotel-gateway
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /checkout
      backendRefs:
        - name: checkout-service
          port: 8080
```

This configuration automatically creates the Lattice Service, Target Groups, and associates Kubernetes Pods directly as targets (IP mode), eliminating unnecessary hops (NodePort).

#### 3. Zero Trust Authentication with IAM (SigV4)

Forget mTLS and the nightmare of rotating certificates. Lattice uses **AWS IAM** for service-to-service authentication.
The "caller" (e.g., a Lambda or a Pod with an IAM Role) signs the HTTP request using Signature Version 4 (SigV4).

**Granular Auth Policy**:
You can define policies that look like firewall rules but operate on identities and HTTP routes.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReportsService",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/ReportsServiceRole"
      },
      "Action": "vpc-lattice-svcs:Invoke",
      "Resource": "*",
      "Condition": {
        "StringEquals": { "vpc-lattice-svcs:RequestMethod": "GET" }
      }
    }
  ]
}
```

If an unauthorized service attempts a `POST`, Lattice rejects the connection at the edge (**403 Forbidden**), protecting your compute resources from internal DDoS attacks.

#### 4. Multi-Account Sharing with AWS RAM

In large enterprises, services live in separate AWS accounts.
Lattice integrates with **AWS Resource Access Manager (RAM)**.

1.  The "Platform" account creates the Service Network.
2.  Shares the network with the AWS Organization or specific OUs.
3.  "Product" accounts associate their VPCs and Services with that shared network.
    **Result**: Instant cross-account connectivity without touching route tables, VPC Peering, or complex Transit Gateway configurations.

#### 5. Costs and Considerations

Lattice is not cheap.

- **Service Charge**: ~$0.025/hour per provisioned service.
- **Traffic Charge**: ~$0.025/GB processed.

**Comparison**:

- **VPC Peering**: Free (data transfer only). Complex to manage at scale.
- **PrivateLink**: Expensive per endpoint. Unidirectional.
- **Transit Gateway**: Expensive per attachment + traffic. Added latency.
- **Lattice**: Medium-High cost, but massive savings in engineering hours and Service Mesh maintenance (Istio/Linkerd).

For modern serverless or distributed container architectures, the savings in operational complexity justify the investment in Lattice.

---

### PORTUGUÊS (PT)

A conectividade de microsserviços na AWS historicamente tem sido um quebra-cabeça de infraestrutura. VPC Peering não escala além de algumas dezenas de VPCs, Transit Gateway adiciona latência e complexidade de roteamento, e PrivateLink requer endpoints específicos por serviço. Além disso, o modelo de segurança baseado em IPs (Security Groups) quebra em ambientes dinâmicos como Kubernetes.

**AWS VPC Lattice** é a resposta da AWS para modernizar essa camada. Não é apenas um "balanceador de carga"; é uma rede de sobreposição de nível de aplicação (L7) que abstrai a topologia de rede subjacente. Neste artigo, analisaremos como o Lattice elimina a necessidade de sidecars (como Istio) e simplifica drasticamente a conectividade Multi-Conta.

#### 1. Service Network: O Novo Barramento de Serviços

![AWS VPC Lattice Architecture](./images/aws-vpc-lattice-microservices/architecture.png)

O Lattice introduz o conceito de **Service Network**, um domínio administrativo lógico.

- **Topologia Plana**: Serviços em diferentes VPCs e diferentes Contas AWS podem se comunicar como se estivessem na mesma rede local, desde que estejam associados à mesma Service Network.
- **DNS Global**: O Lattice atribui nomes DNS únicos e gerenciados.
  - `https://payment-service.0123456789abcdef.lattice-1.us-east-1.on.aws`
  - Também suporta **CNAMEs personalizados** (ex: `https://payments.internal`), lidando automaticamente com certificados SSL/TLS.

#### 2. Integração com EKS (Kubernetes Gateway API)

O Lattice não exige que você altere seu código, mas brilha quando integrado com EKS via **AWS Gateway API Controller**.
Em vez de criar objetos `Ingress` (ALB), você define `HTTPRoute` e `Gateway`.

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: checkout-route
  annotations:
    application-networking.k8s.aws/lattice-target-group-name: checkout-tg
spec:
  parentRefs:
    - name: my-hotel-gateway
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /checkout
      backendRefs:
        - name: checkout-service
          port: 8080
```

Essa configuração cria automaticamente o Serviço Lattice, Target Groups e associa os Pods do Kubernetes diretamente como alvos (modo IP), eliminando saltos desnecessários (NodePort).

#### 3. Autenticação Zero Trust com IAM (SigV4)

Esqueça o mTLS e o pesadelo de rotacionar certificados. O Lattice usa **AWS IAM** para autenticação serviço-a-serviço.
O "chamador" (ex: uma Lambda ou um Pod com IAM Role) assina a requisição HTTP usando Signature Version 4 (SigV4).

**Política de Autenticação Granular**:
Você pode definir políticas que parecem regras de firewall, mas operam sobre identidades e rotas HTTP.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReportsService",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/ReportsServiceRole"
      },
      "Action": "vpc-lattice-svcs:Invoke",
      "Resource": "*",
      "Condition": {
        "StringEquals": { "vpc-lattice-svcs:RequestMethod": "GET" }
      }
    }
  ]
}
```

Se um serviço não autorizado tentar um `POST`, o Lattice rejeita a conexão na borda (**403 Forbidden**), protegendo seus recursos computacionais de ataques DDoS internos.

#### 4. Compartilhamento Multi-Conta com AWS RAM

Em grandes empresas, os serviços vivem em contas AWS separadas.
O Lattice se integra com **AWS Resource Access Manager (RAM)**.

1.  A conta "Plataforma" cria a Service Network.
2.  Compartilha a rede com a Organização AWS ou OUs específicas.
3.  As contas "Produto" associam suas VPCs e Serviços a essa rede compartilhada.
    **Resultado**: Conectividade instantânea cross-account sem tocar em tabelas de rotas, VPC Peering ou configurações complexas de Transit Gateway.

#### 5. Custos e Considerações

O Lattice não é barato.

- **Cobrança por serviço**: ~$0.025/hora por serviço provisionado.
- **Cobrança por tráfego**: ~$0.025/GB processado.

**Comparação**:

- **VPC Peering**: Gratuito (apenas transferência de dados). Complexo de gerenciar em escala.
- **PrivateLink**: Caro por endpoint. Unidirecional.
- **Transit Gateway**: Caro por anexo + tráfego. Latência adicionada.
- **Lattice**: Custo médio-alto, mas economia massiva em horas de engenharia e manutenção de Service Mesh (Istio/Linkerd).

Para arquiteturas modernas serverless ou baseadas em contêineres distribuídos, a economia em complexidade operacional justifica o investimento no Lattice.

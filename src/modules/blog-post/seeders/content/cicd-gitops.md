### ESPAÑOL (ES)

El modelo tradicional de CI/CD (Jenkins enviando comandos SSH o `kubectl apply` imperativo desde el pipeline) es frágil, inseguro y difícil de auditar. "ClickOps" y cambios manuales en el cluster llevan al temido **Configuration Drift**.

**GitOps** es el estándar moderno para Continuous Delivery en Kubernetes: **Git es la única fuente de la verdad**. Si no está en Git, no existe. Usamos un operador en el cluster (ArgoCD o Flux) para reconciliar el estado deseado con el estado real.

#### 1. Separación de Responsabilidades: CI vs CD

![GitOps Workflow](./images/cicd-gitops/gitops-workflow.png)

- **Continuous Integration (CI)**: GitHub Actions / GitLab CI.
  - Responsabilidad: Ejecutar tests, linting, compilar código y **construir un artefacto inmutable (Docker Image)**.
  - Salida: Una imagen Docker tageada con el Commit SHA (NUNCA `latest`).
- **Continuous Delivery (CD)**: ArgoCD.
  - Responsabilidad: Monitorear el repo de infraestructura (`infra-repo`) y aplicar cambios al cluster K8s.

#### 2. El Loop de Retroalimentación

No hacemos push directo al cluster. El CI hace un commit al repositorio de configuración:

```yaml
# .github/workflows/deploy.yaml
jobs:
  update-manifest:
    steps:
      - name: Update Image Tag
        run: |
          yq e -i '.spec.template.spec.containers[0].image = "my-app:${{ github.sha }}"' k8s/deployment.yaml
          git commit -am "Bump image version to ${{ github.sha }}"
          git push
```

ArgoCD detecta este cambio en Git y sincroniza el cluster automáticamente.

#### 3. ArgoCD: El Reconciliador y Self-Healing

ArgoCD no solo aplica cambios; protege el cluster. Si un desarrollador "cowboy" edita un recurso manualmente (`kubectl edit deployment`), ArgoCD detectará el estado "OutOfSync" y revertirá el cambio inmediatamente al estado definido en Git.

**Sincronización Avanzada con Sync Waves**:
Podemos orquestar el orden de despliegue usando anotaciones:

- `argocd.argoproj.io/sync-wave: "-1"` (Migración de BD)
- `argocd.argoproj.io/sync-wave: "0"` (Deployment de App)

#### 4. Progressive Delivery: Argo Rollouts

Desplegar al 100% de los usuarios de golpe es arriesgado. Kubernetes nativo solo ofrece `RollingUpdate`. Con **Argo Rollouts**, implementamos Canary Releases inteligentes.

1.  Desplegar v2 al 5% del tráfico.
2.  Esperar 5 minutos.
3.  Consultar Prometheus: `sum(rate(http_requests_total{status=~"5.*"}[1m]))`.
4.  Si la tasa de error < 1%, promover al 20%; si no, **Rollback Automático**.

```yaml
# rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: { duration: 1h }
        - analysis:
            templates:
              - templateName: success-rate
```

#### 5. Gestión de Secretos en GitOps

Nunca comiteamos secretos en texto plano.

- **Sealed Secrets**: Cifrado asimétrico. Solo el controlador en el cluster puede descifrar.
- **External Secrets Operator**: La mejor práctica empresarial. Los secretos viven en AWS Secrets Manager o HashiCorp Vault. El operador los sincroniza a `Secret` de K8s.

GitOps transforma la operación de Kubernetes de una tarea manual propensa a errores a un proceso de software auditable, versionado y automatizado.

---

### ENGLISH (EN)

The traditional CI/CD model (Jenkins sending SSH commands or imperative `kubectl apply` from the pipeline) is fragile, insecure, and hard to audit. "ClickOps" and manual changes in the cluster lead to the dreaded **Configuration Drift**.

**GitOps** is the modern standard for Continuous Delivery in Kubernetes: **Git is the single source of truth**. If it's not in Git, it doesn't exist. We use an in-cluster operator (ArgoCD or Flux) to reconcile the desired state with the actual state.

#### 1. Separation of Concerns: CI vs CD

![GitOps Workflow](./images/cicd-gitops/gitops-workflow.png)

- **Continuous Integration (CI)**: GitHub Actions / GitLab CI.
  - Responsibility: Run tests, linting, compile code, and **build an immutable artifact (Docker Image)**.
  - Output: A Docker image tagged with the Commit SHA (NEVER `latest`).
- **Continuous Delivery (CD)**: ArgoCD.
  - Responsibility: Monitor the infrastructure repo (`infra-repo`) and apply changes to the K8s cluster.

#### 2. The Feedback Loop

We don't push directly to the cluster. The CI pushes a commit to the configuration repository:

```yaml
# .github/workflows/deploy.yaml
jobs:
  update-manifest:
    steps:
      - name: Update Image Tag
        run: |
          yq e -i '.spec.template.spec.containers[0].image = "my-app:${{ github.sha }}"' k8s/deployment.yaml
          git commit -am "Bump image version to ${{ github.sha }}"
          git push
```

ArgoCD detects this change in Git and automatically syncs the cluster.

#### 3. ArgoCD: The Reconciler and Self-Healing

ArgoCD doesn't just apply changes; it protects the cluster. If a "cowboy" developer edits a resource manually (`kubectl edit deployment`), ArgoCD will detect the "OutOfSync" state and immediately revert the change to the state defined in Git.

**Advanced Syncing with Sync Waves**:
We can orchestrate deployment order using annotations:

- `argocd.argoproj.io/sync-wave: "-1"` (DB Migration)
- `argocd.argoproj.io/sync-wave: "0"` (App Deployment)

#### 4. Progressive Delivery: Argo Rollouts

Deploying to 100% of users at once is risky. Native Kubernetes only offers `RollingUpdate`. With **Argo Rollouts**, we implement intelligent Canary Releases.

1.  Deploy v2 to 5% of traffic.
2.  Wait 5 minutes.
3.  Query Prometheus: `sum(rate(http_requests_total{status=~"5.*"}[1m]))`.
4.  If error rate < 1%, promote to 20%; otherwise, **Automatic Rollback**.

```yaml
# rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: { duration: 1h }
        - analysis:
            templates:
              - templateName: success-rate
```

#### 5. Secrets Management in GitOps

We never commit secrets in plain text.

- **Sealed Secrets**: Asymmetric encryption. Only the in-cluster controller can decrypt.
- **External Secrets Operator**: The enterprise best practice. Secrets live in AWS Secrets Manager or HashiCorp Vault. The operator syncs them to K8s `Secret`.

GitOps transforms Kubernetes operations from a manual, error-prone task into an auditable, versioned, and automated software process.

---

### PORTUGUÊS (PT)

O modelo tradicional de CI/CD (Jenkins enviando comandos SSH ou `kubectl apply` imperativo do pipeline) é frágil, inseguro e difícil de auditar. "ClickOps" e mudanças manuais no cluster levam ao temido **Configuration Drift** (Desvio de Configuração).

**GitOps** é o padrão moderno para Entrega Contínua (Continuous Delivery) no Kubernetes: **Git é a única fonte da verdade**. Se não estiver no Git, não existe. Usamos um operador no cluster (ArgoCD ou Flux) para reconciliar o estado desejado com o estado real.

#### 1. Separação de Responsabilidades: CI vs CD

![GitOps Workflow](./images/cicd-gitops/gitops-workflow.png)

- **Continuous Integration (CI)**: GitHub Actions / GitLab CI.
  - Responsabilidade: Executar testes, linting, compilar código e **construir um artefato imutável (Imagem Docker)**.
  - Saída: Uma imagem Docker marcada com o Commit SHA (NUNCA `latest`).
- **Continuous Delivery (CD)**: ArgoCD.
  - Responsabilidade: Monitorar o repositório de infraestrutura (`infra-repo`) e aplicar alterações ao cluster K8s.

#### 2. O Loop de Retroalimentação

Não fazemos push direto para o cluster. O CI faz um commit no repositório de configuração:

```yaml
# .github/workflows/deploy.yaml
jobs:
  update-manifest:
    steps:
      - name: Update Image Tag
        run: |
          yq e -i '.spec.template.spec.containers[0].image = "my-app:${{ github.sha }}"' k8s/deployment.yaml
          git commit -am "Bump image version to ${{ github.sha }}"
          git push
```

O ArgoCD detecta essa mudança no Git e sincroniza o cluster automaticamente.

#### 3. ArgoCD: O Reconciliador e Auto-Cura (Self-Healing)

O ArgoCD não apenas aplica mudanças; ele protege o cluster. Se um desenvolvedor "cowboy" editar um recurso manualmente (`kubectl edit deployment`), o ArgoCD detectará o estado "OutOfSync" e reverterá a mudança imediatamente para o estado definido no Git.

**Sincronização Avançada com Sync Waves**:
Podemos orquestrar a ordem de implantação usando anotações:

- `argocd.argoproj.io/sync-wave: "-1"` (Migração de BD)
- `argocd.argoproj.io/sync-wave: "0"` (Implantação de App)

#### 4. Entrega Progressiva: Argo Rollouts

Implantar para 100% dos usuários de uma vez é arriscado. O Kubernetes nativo oferece apenas `RollingUpdate`. Com **Argo Rollouts**, implementamos Lançamentos Canários inteligentes.

1.  Implantar v2 para 5% do tráfego.
2.  Aguardar 5 minutos.
3.  Consultar Prometheus: `sum(rate(http_requests_total{status=~"5.*"}[1m]))`.
4.  Se a taxa de erro < 1%, promover para 20%; caso contrário, **Rollback Automático**.

```yaml
# rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: { duration: 1h }
        - analysis:
            templates:
              - templateName: success-rate
```

#### 5. Gerenciamento de Segredos no GitOps

Nunca commitamos segredos em texto simples.

- **Sealed Secrets**: Criptografia assimétrica. Apenas o controlador no cluster pode descriptografar.
- **External Secrets Operator**: A melhor prática empresarial. Os segredos vivem no AWS Secrets Manager ou HashiCorp Vault. O operador os sincroniza para `Secret` do K8s.

O GitOps transforma as operações do Kubernetes de uma tarefa manual propensa a erros em um processo de software auditável, versionado e automatizado.

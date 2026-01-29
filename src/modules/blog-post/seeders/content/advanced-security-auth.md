### ESPAÑOL (ES)

"La seguridad no es una característica funcional, es un estado mental". En aplicaciones modernas, confiar solo en HTTPS y contraseñas fuertes es negligente. Debemos operar bajo el modelo **Zero Trust**: asumir que la red es hostil, que los perímetros van a fallar y que el atacante podría ya estar dentro de tu VPC.

En este artículo, cubriremos autenticación moderna (OIDC), autorización granular (ABAC), gestión de secretos y auditoría en un entorno Node.js/NestJS de alto nivel.

#### 1. OAuth 2.0 y OIDC: El Estándar de Oro

![OAuth2 Authorization Code Flow](./images/advanced-security-auth/oauth-flow.png)

Nunca implementes tu propio sistema de login desde cero si puedes evitarlo. Gestionar contraseñas, rotación de claves, MFA y recuperación de cuentas es un campo minado. Usa **OpenID Connect (OIDC)** delegando en proveedores como Auth0, Cognito o Keycloak.

Para SPAs (Single Page Apps) y Aplicaciones Móviles, el único flujo seguro es **Authorization Code Flow con PKCE** (Proof Key for Code Exchange).

**¿Por qué PKCE?**
El flujo "Implicit" antiguo devolvía el Access Token en la URL (`#access_token=...`), exponiéndolo en el historial del navegador y logs de proxy.
PKCE mitiga esto:

1.  Cliente genera un secreto aleatorio (`code_verifier`) y su hash (`code_challenge`).
2.  Cliente envía el hash al iniciar el login.
3.  Cliente intercambia el Authorization Code + `code_verifier` original por el token.
4.  El servidor verifica que `hash(verifier) === challenge`. Esto asegura que solo quien inició el flujo puede terminarlo.

#### 2. Estrategia de Tokens: Cookies HttpOnly vs Bearer

Un JWT (JSON Web Token) es como dinero en efectivo. Quien lo tiene, lo gasta. Si lo guardas en `localStorage`, cualquier librería de terceros comprometida (`npm install malicious-lib`) puede leerlo (XSS) y exfiltrarlo.

**Mejores Prácticas**:

1.  **Frontend**: Nunca ve el Access Token.
2.  **Backend (BFF)**: Recibe el token del Provider y lo establece como **Cookie HttpOnly**.
3.  **Cookie Flags**: `HttpOnly; Secure; SameSite=Strict`.

```typescript
// NestJS: AuthController.ts
@Get('callback')
async callback(@Query('code') code: string, @Res() res: Response) {
  const tokens = await this.authService.exchangeCode(code);

  res.cookie("access_token", tokens.access_token, {
    httpOnly: true, // JS no puede leerla
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS
    sameSite: "strict", // Previene CSRF
    maxAge: 3600 * 1000,
  });

  res.redirect('/dashboard');
}
```

#### 3. ABAC: Autorización Basada en Atributos (Más allá de Roles)

**RBAC (Role-Based Access Control)** es insuficiente para casos reales.

- _RBAC_: "¿Es un Manager? Sí. Entra."
- _Caso Real_: "Un Manager solo puede editar contratos de SU departamento y que sumen menos de $10k."

Para esto usamos **ABAC** con la librería **CASL**. Define permisos basados en atributos del Usuario (Subject), el Recurso (Object) y el Entorno (Environment).

```typescript
// abilities.factory.ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function createForUser(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.isAdmin) {
    can("manage", "all");
  } else {
    can("read", "Contract");
    // Regla compleja: Update si es del mismo depto Y monto < 10k
    can("update", "Contract", {
      departmentId: user.departmentId,
      amount: { $lt: 10000 },
    });
  }

  return build();
}
```

**Guard Genérico en NestJS**:

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<PolicyRule[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];
    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslFactory.createForUser(user);

    return rules.every((rule) => rule(ability));
  }
}
```

#### 4. Audit Logging: ¿Quién hizo qué y cuándo?

En sistemas regulados (Fintech, Salud), no basta con bloquear accesos no autorizados. Debes registrar **inmutablemente** cada acción crítica.
Un simple `console.log` no sirve (se pierde, se puede borrar). Usa un patrón de **Interceptor**.

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Inject("AUDIT_QUEUE") private auditQueue: Queue) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap((response) => {
        // Enviamos a una cola asíncrona (SQS/RabbitMQ) para no bloquear
        this.auditQueue.add("audit_log", {
          userId: user.id,
          action: `${method} ${url}`,
          resourceId: req.params.id,
          payload: req.body, // ¡Cuidado con PII!
          status: "SUCCESS",
          timestamp: new Date(),
          ip: req.ip,
        });
      }),
    );
  }
}
```

#### 5. Gestión de Secretos: Adiós .env

En producción, los archivos `.env` son un riesgo (se copian por error, quedan en imágenes Docker).
Usa gestores de secretos dedicados como **AWS Secrets Manager** o **HashiCorp Vault**.
La aplicación, al arrancar, pide sus secretos a la API segura en memoria, nunca los escribe en disco.

La seguridad es una carrera armamentista constante. Mantén tus dependencias actualizadas (`npm audit`), rota tus claves criptográficas regularmente y educa a tu equipo.

---

### ENGLISH (EN)

"Security is not a functional feature, it's a state of mind." In modern applications, relying only on HTTPS and strong passwords is negligent. We must operate under the **Zero Trust** model: assume the network is hostile, perimeters will fail, and the attacker might already be inside your VPC.

In this article, we'll cover modern authentication (OIDC), granular authorization (ABAC), secret management, and auditing in a high-level Node.js/NestJS environment.

#### 1. OAuth 2.0 and OIDC: The Gold Standard

![OAuth2 Authorization Code Flow](./images/advanced-security-auth/oauth-flow.png)

Never implement your own login system from scratch if you can avoid it. Managing passwords, key rotation, MFA, and account recovery is a minefield. Use **OpenID Connect (OIDC)** delegating to providers like Auth0, Cognito, or Keycloak.

For SPAs (Single Page Apps) and Mobile Apps, the only secure flow is **Authorization Code Flow with PKCE** (Proof Key for Code Exchange).

**Why PKCE?**
The old "Implicit" flow returned the Access Token in the URL (`#access_token=...`), exposing it in browser history and proxy logs.
PKCE mitigates this:

1.  Client generates a random secret (`code_verifier`) and its hash (`code_challenge`).
2.  Client sends the hash when starting login.
3.  Client exchanges the Authorization Code + original `code_verifier` for the token.
4.  Server verifies that `hash(verifier) === challenge`. This ensures only the initiator can complete the flow.

#### 2. Token Strategy: HttpOnly Cookies vs Bearer

A JWT (JSON Web Token) is like cash. Whoever holds it, spends it. If you store it in `localStorage`, any compromised third-party library (`npm install malicious-lib`) can read it (XSS) and exfiltrate it.

**Best Practices**:

1.  **Frontend**: Never sees the Access Token.
2.  **Backend (BFF)**: Receives token from Provider and sets it as **HttpOnly Cookie**.
3.  **Cookie Flags**: `HttpOnly; Secure; SameSite=Strict`.

```typescript
// NestJS: AuthController.ts
@Get('callback')
async callback(@Query('code') code: string, @Res() res: Response) {
  const tokens = await this.authService.exchangeCode(code);

  res.cookie("access_token", tokens.access_token, {
    httpOnly: true, // JS cannot read it
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: "strict", // Prevents CSRF
    maxAge: 3600 * 1000,
  });

  res.redirect('/dashboard');
}
```

#### 3. ABAC: Attribute-Based Access Control (Beyond Roles)

**RBAC (Role-Based Access Control)** is insufficient for real cases.

- _RBAC_: "Is he a Manager? Yes. Enter."
- _Real Case_: "A Manager can only edit contracts from WITHIN their department AND totaling less than $10k."

For this, we use **ABAC** with the **CASL** library. It defines permissions based on attributes of the User (Subject), the Resource (Object), and the Environment.

```typescript
// abilities.factory.ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function createForUser(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.isAdmin) {
    can("manage", "all");
  } else {
    can("read", "Contract");
    // Complex rule: Update if same dept AND amount < 10k
    can("update", "Contract", {
      departmentId: user.departmentId,
      amount: { $lt: 10000 },
    });
  }

  return build();
}
```

**Generic Guard in NestJS**:

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<PolicyRule[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];
    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslFactory.createForUser(user);

    return rules.every((rule) => rule(ability));
  }
}
```

#### 4. Audit Logging: Who did what and when?

In regulated systems (Fintech, Health), blocking unauthorized access isn't enough. You must **immutably** record every critical action.
A simple `console.log` won't cut it (it gets lost, can be deleted). Use an **Interceptor** pattern.

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Inject("AUDIT_QUEUE") private auditQueue: Queue) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap((response) => {
        // Send to async queue (SQS/RabbitMQ) to avoid blocking
        this.auditQueue.add("audit_log", {
          userId: user.id,
          action: `${method} ${url}`,
          resourceId: req.params.id,
          payload: req.body, // Careful with PII!
          status: "SUCCESS",
          timestamp: new Date(),
          ip: req.ip,
        });
      }),
    );
  }
}
```

#### 5. Secret Management: Goodbye .env

In production, `.env` files are a risk (accidentally committed, left in Docker images).
Use dedicated secret managers like **AWS Secrets Manager** or **HashiCorp Vault**.
The application, upon startup, requests its secrets from the secure API into memory, never writing them to disk.

Security is a constant arms race. Keep dependencies updated (`npm audit`), rotate cryptographic keys regularly, and educate your team.

---

### PORTUGUÊS (PT)

"Segurança não é uma funcionalidade, é um estado mental". Em aplicações modernas, confiar apenas em HTTPS e senhas fortes é negligência. Devemos operar sob o modelo **Zero Trust**: assumir que a rede é hostil, que os perímetros falharão e que o atacante pode já estar dentro de sua VPC.

Neste artigo, cobriremos autenticação moderna (OIDC), autorização granular (ABAC), gerenciamento de segredos e auditoria em um ambiente Node.js/NestJS de alto nível.

#### 1. OAuth 2.0 e OIDC: O Padrão Ouro

![OAuth2 Authorization Code Flow](./images/advanced-security-auth/oauth-flow.png)

Nunca implemente seu próprio sistema de login do zero se puder evitar. Gerenciar senhas, rotação de chaves, MFA e recuperação de contas é um campo minado. Use **OpenID Connect (OIDC)** delegando a provedores como Auth0, Cognito ou Keycloak.

Para SPAs (Single Page Apps) e Aplicativos Móveis, o único fluxo seguro é **Authorization Code Flow com PKCE** (Proof Key for Code Exchange).

**Por que PKCE?**
O antigo fluxo "Implícito" retornava o Access Token na URL (`#access_token=...`), expondo-o no histórico do navegador e logs de proxy.
O PKCE mitiga isso:

1.  Cliente gera um segredo aleatório (`code_verifier`) e seu hash (`code_challenge`).
2.  Cliente envia o hash ao iniciar o login.
3.  Cliente troca o Authorization Code + `code_verifier` original pelo token.
4.  O servidor verifica se `hash(verifier) === challenge`. Isso garante que apenas quem iniciou o fluxo possa terminá-lo.

#### 2. Estratégia de Tokens: Cookies HttpOnly vs Bearer

Um JWT (JSON Web Token) é como dinheiro vivo. Quem tem, gasta. Se você guardá-lo no `localStorage`, qualquer biblioteca de terceiros comprometida (`npm install malicious-lib`) pode lê-lo (XSS) e exfiltrá-lo.

**Melhores Práticas**:

1.  **Frontend**: Nunca vê o Access Token.
2.  **Backend (BFF)**: Recebe o token do Provider e o define como **Cookie HttpOnly**.
3.  **Flags de Cookie**: `HttpOnly; Secure; SameSite=Strict`.

```typescript
// NestJS: AuthController.ts
@Get('callback')
async callback(@Query('code') code: string, @Res() res: Response) {
  const tokens = await this.authService.exchangeCode(code);

  res.cookie("access_token", tokens.access_token, {
    httpOnly: true, // JS não pode ler
    secure: process.env.NODE_ENV === 'production', // Apenas HTTPS
    sameSite: "strict", // Previne CSRF
    maxAge: 3600 * 1000,
  });

  res.redirect('/dashboard');
}
```

#### 3. ABAC: Autorização Baseada em Atributos (Além de Roles)

**RBAC (Role-Based Access Control)** é insuficiente para casos reais.

- _RBAC_: "Ele é Gerente? Sim. Entre."
- _Caso Real_: "Um Gerente só pode editar contratos do SEU departamento E que somem menos de $10k."

Para isso usamos **ABAC** com a biblioteca **CASL**. Define permissões baseadas em atributos do Usuário (Subject), do Recurso (Object) e do Ambiente.

```typescript
// abilities.factory.ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function createForUser(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.isAdmin) {
    can("manage", "all");
  } else {
    can("read", "Contract");
    // Regra complexa: Atualizar se for do mesmo depto E valor < 10k
    can("update", "Contract", {
      departmentId: user.departmentId,
      amount: { $lt: 10000 },
    });
  }

  return build();
}
```

**Guard Genérico em NestJS**:

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<PolicyRule[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];
    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslFactory.createForUser(user);

    return rules.every((rule) => rule(ability));
  }
}
```

#### 4. Audit Logging: Quem fez o quê e quando?

Em sistemas regulamentados (Fintech, Saúde), não basta bloquear acessos não autorizados. Você deve registrar **imutavelmente** cada ação crítica.
Um simples `console.log` não serve (ele se perde, pode ser apagado). Use um padrão de **Interceptor**.

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Inject("AUDIT_QUEUE") private auditQueue: Queue) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap((response) => {
        // Envia para fila assíncrona (SQS/RabbitMQ) para não bloquear
        this.auditQueue.add("audit_log", {
          userId: user.id,
          action: `${method} ${url}`,
          resourceId: req.params.id,
          payload: req.body, // Cuidado com PII!
          status: "SUCCESS",
          timestamp: new Date(),
          ip: req.ip,
        });
      }),
    );
  }
}
```

#### 5. Gerenciamento de Segredos: Adeus .env

Em produção, arquivos `.env` são um risco (copiados por erro, deixados em imagens Docker).
Use gerenciadores de segredos dedicados como **AWS Secrets Manager** ou **HashiCorp Vault**.
A aplicação, ao iniciar, pede seus segredos à API segura em memória, nunca os escrevendo em disco.

A segurança é uma corrida armamentista constante. Mantenha suas dependências atualizadas (`npm audit`), alterne suas chaves criptográficas regularmente e eduque sua equipe.

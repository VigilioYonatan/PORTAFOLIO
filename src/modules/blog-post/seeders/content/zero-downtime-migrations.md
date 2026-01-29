### ESPAÑOL (ES)

En el mundo de las startups en etapa inicial, poner un cartel de "Estamos en mantenimiento" a las 3 AM es aceptable. Pero para sistemas globales que operan 24/7 o aplicaciones financieras críticas, el tiempo de inactividad (downtime) no es una opción.

El desafío es doble:

1.  **Bloqueos de Base de Datos**: Operaciones como `ALTER TABLE` pueden adquirir bloqueos exclusivos (`ACCESS EXCLUSIVE LOCK`), deteniendo todas las lecturas y escrituras en una tabla durante horas si esta es muy grande.
2.  **Despliegue de Código**: Durante un despliegue rodante (Rolling Update) en Kubernetes, tendrás pods ejecutando la versión antigua (v1) y la nueva (v2) simultáneamente. Si la v2 cambia el esquema de la base de datos de una manera incompatible, la v1 comenzará a fallar (500 Error) antes de que termine el despliegue.

Para resolver esto, los ingenieros senior utilizan el patrón **Expand-Contract** (o Parallel Change).

#### 1. El Patrón Expand-Contract: Anatomía de un Cambio Seguro

![Expand-Contract Pattern](./images/zero-downtime-migrations/expand-contract.png)

Tomemos un ejemplo clásico: Queremos renombrar la columna `name` a `full_name` en la tabla `users` (que tiene 100 millones de filas).
Si ejecutas `ALTER TABLE users RENAME COLUMN name TO full_name`, la aplicación v1 fallará inmediatamente porque sus queries `SELECT name` ya no encontrarán la columna.

**Fase 1: Expand (Expansión)**
El objetivo es hacer cambios aditivos.

1.  **Migración**: Añadir la columna `full_name` como `NULLABLE`.
    ```sql
    ALTER TABLE users ADD COLUMN full_name TEXT;
    ```
    _Nota_: En Postgres 11+, añadir una columna con valor por defecto es rápido, pero en versiones anteriores requería reescribir toda la tabla.
2.  **Código v1.1**: Desplegar una versión que escribe en **ambos** lugares (Dual Write) pero sigue leyendo del viejo.
    ```typescript
    // Dual Write
    await db.insert(users).values({
      name: "Juan Perez", // Legacy
      fullName: "Juan Perez", // New
    });
    ```

**Fase 2: Migrate (Migración de Datos)**
Ahora tenemos datos nuevos en ambas columnas, pero los registros antiguos tienen `full_name` como NULL.
Debemos hacer un "Backfill" sin bloquear la base de datos.
_Estrategia_: Script en segundo plano que actualiza lotes de 1000 filas con pausas.

```typescript
async function backfill() {
  let cursor = 0;
  while (true) {
    const batch = await db
      .select()
      .from(users)
      .where(and(isNull(users.fullName), gt(users.id, cursor)))
      .limit(1000); // Lotes pequeños para evitar bloqueos largos

    if (!batch.length) break;

    for (const user of batch) {
      await db
        .update(users)
        .set({ fullName: user.name })
        .where(eq(users.id, user.id));
    }
    cursor = batch[batch.length - 1].id;
    await sleep(50); // Dar respiro a la CPU de la DB
  }
}
```

**Fase 3: Contract (Contracción)**

1.  **Código v2**: Desplegar versión que ahora **lee** de `full_name` y escribe solo en `full_name` (o sigue escribiendo en ambos si necesitas rollback seguro).
2.  Ahora la columna `name` es técnicamente "basura" o está deprecada.

**Fase 4: Cleanup (Limpieza)**
Semanas después (cuando es seguro que no habrá rollback):

1.  **Migración**: Eliminar la columna `name`.
    ```sql
    ALTER TABLE users DROP COLUMN name;
    ```
2.  **Mantenimiento**: Ejecutar `pg_repack` (extensión externa) o `VACUUM FULL` para recuperar espacio físico en disco. _Cuidado_: `VACUUM FULL` bloquea la tabla; `pg_repack` no.

#### 2. Drizzle Kit en Arquitecturas Zero-Downtime

Drizzle Kit es excelente, pero por defecto genera migraciones que pueden ser peligrosas.
**Recomendación**: Nunca apliques migraciones automáticamente al iniciar la app (`migrate()`) en producción.
Úsalo en un paso de CD (Continuous Delivery) separado antes del despliegue de los pods.

#### 3. Tipos de Cambios y su Riesgo

| Cambio                        | Riesgo  | Estrategia                                                                                         |
| :---------------------------- | :------ | :------------------------------------------------------------------------------------------------- |
| `ADD COLUMN` (nullable)       | Bajo    | Seguro.                                                                                            |
| `Assuming COLUMN` (not null)  | Alto    | Requiere valor default. Puede bloquear. Hazlo nullable primero, llena datos, luego `SET NOT NULL`. |
| `DROP COLUMN`                 | Crítico | Rompe código viejo. Usar Expand-Contract.                                                          |
| `RENAME COLUMN`               | Crítico | Rompe código viejo. Nunca uses rename directo. Crea nueva, copia datos, borra vieja.               |
| `CHANGE TYPE` (int -> bigint) | Medio   | Requiere reescritura de tabla entera. Usar nueva columna.                                          |

#### 4. Bloqueos y Timeouts

Configura siempre `lock_timeout` en tus migraciones para evitar que una migración espere eternamente por un bloqueo, deteniendo otras transacciones.

```sql
SET lock_timeout = '2s';
ALTER TABLE items ADD COLUMN category_id INT;
```

Si no puede adquirir el bloqueo en 2 segundos, fallará. Es mejor fallar rápido y reintentar que detener la producción.

---

### ENGLISH (EN)

In the early-stage startup world, putting up a "We are under maintenance" sign at 3 AM is acceptable. But for global systems operating 24/7 or critical financial applications, downtime is not an option.

The challenge is twofold:

1.  **Database Locks**: Operations like `ALTER TABLE` can acquire exclusive locks (`ACCESS EXCLUSIVE LOCK`), halting all reads and writes on a table for hours if it is very large.
2.  **Code Deployment**: During a rolling update in Kubernetes, you will have pods running the old version (v1) and the new version (v2) simultaneously. If v2 changes the database schema in an incompatible way, v1 will start failing (500 Error) before the deployment finishes.

To solve this, senior engineers use the **Expand-Contract** (or Parallel Change) pattern.

#### 1. The Expand-Contract Pattern: Anatomy of a Safe Change

![Expand-Contract Pattern](./images/zero-downtime-migrations/expand-contract.png)

Let's take a classic example: We want to rename the `name` column to `full_name` in the `users` table (which has 100 million rows).
If you execute `ALTER TABLE users RENAME COLUMN name TO full_name`, the v1 application will fail immediately because its `SELECT name` queries will no longer find the column.

**Phase 1: Expand**
The goal is to make additive changes.

1.  **Migration**: Add the `full_name` column as `NULLABLE`.
    ```sql
    ALTER TABLE users ADD COLUMN full_name TEXT;
    ```
    _Note_: In Postgres 11+, adding a column with a default value is fast, but in earlier versions, it required rewriting the entire table.
2.  **Code v1.1**: Deploy a version that writes to **both** places (Dual Write) but continues reading from the old one.
    ```typescript
    // Dual Write
    await db.insert(users).values({
      name: "Juan Perez", // Legacy
      fullName: "Juan Perez", // New
    });
    ```

**Phase 2: Migrate (Data Backfill)**
Now we have correct new data, but old records have `full_name` as NULL.
We must run a "Backfill" without locking the database.
_Strategy_: Background script updating batches of 1000 rows with pauses.

```typescript
async function backfill() {
  let cursor = 0;
  while (true) {
    const batch = await db
      .select()
      .from(users)
      .where(and(isNull(users.fullName), gt(users.id, cursor)))
      .limit(1000); // Small batches to avoid long locks

    if (!batch.length) break;

    for (const user of batch) {
      await db
        .update(users)
        .set({ fullName: user.name })
        .where(eq(users.id, user.id));
    }
    cursor = batch[batch.length - 1].id;
    await sleep(50); // Give DB CPU a breather
  }
}
```

**Phase 3: Contract**

1.  **Code v2**: Deploy version that now **reads** from `full_name` and writes only to `full_name` (or keeps writing to both if you need safe rollback).
2.  Now the `name` column is technically "garbage" or deprecated.

**Phase 4: Cleanup**
Weeks later (when it is certain there will be no rollback):

1.  **Migration**: Remove the `name` column.
    ```sql
    ALTER TABLE users DROP COLUMN name;
    ```
2.  **Maintenance**: Run `pg_repack` (external extension) or `VACUUM FULL` to reclaim physical disk space. _Warning_: `VACUUM FULL` locks the table; `pg_repack` does not.

#### 2. Drizzle Kit in Zero-Downtime Architectures

Drizzle Kit is excellent, but by default, it generates migrations that can be dangerous.
**Recommendation**: Never apply migrations automatically on app start (`migrate()`) in production.
Use it in a separate CD (Continuous Delivery) step before pod deployment.

#### 3. Types of Changes and Their Risk

| Change                        | Risk     | Strategy                                                                              |
| :---------------------------- | :------- | :------------------------------------------------------------------------------------ |
| `ADD COLUMN` (nullable)       | Low      | Safe.                                                                                 |
| `ADD COLUMN` (not null)       | High     | Requires default value. Can lock. Make nullable first, backfill, then `SET NOT NULL`. |
| `DROP COLUMN`                 | Critical | Breaks old code. Use Expand-Contract.                                                 |
| `RENAME COLUMN`               | Critical | Breaks old code. Never use direct rename. Create new, copy data, delete old.          |
| `CHANGE TYPE` (int -> bigint) | Medium   | Requires rewriting the entire table. Use new column approach.                         |

#### 4. Locks and Timeouts

Always configure `lock_timeout` in your migrations to prevent a migration from waiting eternally for a lock, halting other transactions.

```sql
SET lock_timeout = '2s';
ALTER TABLE items ADD COLUMN category_id INT;
```

If it cannot acquire the lock in 2 seconds, it will fail. It is better to fail fast and retry than to halt production.

---

### PORTUGUÊS (PT)

No mundo das startups em estágio inicial, colocar uma placa de "Estamos em manutenção" às 3 da manhã é aceitável. Mas para sistemas globais operando 24/7 ou aplicações financeiras críticas, o tempo de inatividade (downtime) não é uma opção.

O desafio é duplo:

1.  **Bloqueios de Banco de Dados**: Operações como `ALTER TABLE` podem adquirir bloqueios exclusivos (`ACCESS EXCLUSIVE LOCK`), interrompendo todas as leituras e gravações em uma tabela por horas se ela for muito grande.
2.  **Implantação de Código**: Durante uma atualização gradual (Rolling Update) no Kubernetes, você terá pods executando a versão antiga (v1) e a nova (v2) simultaneamente. Se a v2 alterar o esquema do banco de dados de maneira incompatível, a v1 começará a falhar (Erro 500) antes que a implantação termine.

Para resolver isso, engenheiros seniores usam o padrão **Expand-Contract** (ou Parallel Change).

#### 1. O Padrão Expand-Contract: Anatomia de uma Mudança Segura

![Expand-Contract Pattern](./images/zero-downtime-migrations/expand-contract.png)

Vamos pegar um exemplo clássico: Queremos renomear a coluna `name` para `full_name` na tabela `users` (que tem 100 milhões de linhas).
Se você executar `ALTER TABLE users RENAME COLUMN name TO full_name`, a aplicação v1 falhará imediatamente porque suas consultas `SELECT name` não encontrarão mais a coluna.

**Fase 1: Expand (Expandir)**
O objetivo é fazer alterações aditivas.

1.  **Migração**: Adicionar a coluna `full_name` como `NULLABLE`.
    ```sql
    ALTER TABLE users ADD COLUMN full_name TEXT;
    ```
    _Nota_: No Postgres 11+, adicionar uma coluna com valor padrão é rápido, mas em versões anteriores, exigia reescrever a tabela inteira.
2.  **Código v1.1**: Implantar uma versão que escreve em **ambos** os lugares (Dual Write), mas continua lendo do antigo.
    ```typescript
    // Dual Write
    await db.insert(users).values({
      name: "Juan Perez", // Legado
      fullName: "Juan Perez", // Novo
    });
    ```

**Fase 2: Migrate (Migração de Dados)**
Agora temos novos dados corretos, mas registros antigos têm `full_name` como NULL.
Devemos executar um "Backfill" sem bloquear o banco de dados.
_Estratégia_: Script em segundo plano atualizando lotes de 1000 linhas com pausas.

```typescript
async function backfill() {
  let cursor = 0;
  while (true) {
    const batch = await db
      .select()
      .from(users)
      .where(and(isNull(users.fullName), gt(users.id, cursor)))
      .limit(1000); // Lotes pequenos para evitar bloqueos longos

    if (!batch.length) break;

    for (const user of batch) {
      await db
        .update(users)
        .set({ fullName: user.name })
        .where(eq(users.id, user.id));
    }
    cursor = batch[batch.length - 1].id;
    await sleep(50); // Dar um respiro à CPU do DB
  }
}
```

**Fase 3: Contract (Contrair)**

1.  **Código v2**: Implantar versão que agora **lê** de `full_name` e escreve apenas em `full_name` (ou continua escrevendo em ambos se precisar de rollback seguro).
2.  Agora a coluna `name` é tecnicamente "lixo" ou depreciada.

**Fase 4: Cleanup (Limpeza)**
Semanas depois (quando tiver certeza de que não haverá rollback):

1.  **Migração**: Remover a coluna `name`.
    ```sql
    ALTER TABLE users DROP COLUMN name;
    ```
2.  **Manutenção**: Executar `pg_repack` (extensão externa) ou `VACUUM FULL` para recuperar espaço físico em disco. _Aviso_: `VACUUM FULL` bloqueia a tabela; `pg_repack` não.

#### 2. Drizzle Kit em Arquiteturas Zero-Downtime

O Drizzle Kit é excelente, mas por padrão, gera migrações que podem ser perigosas.
**Recomendação**: Nunca aplique migrações automaticamente na inicialização do app (`migrate()`) em produção.
Use-o em uma etapa separada de CD (Entrega Contínua) antes da implantação dos pods.

#### 3. Tipos de Alterações e seus Riscos

| Alteração                     | Risco   | Estratégia                                                                                   |
| :---------------------------- | :------ | :------------------------------------------------------------------------------------------- |
| `ADD COLUMN` (nullable)       | Baixo   | Seguro.                                                                                      |
| `ADD COLUMN` (not null)       | Alto    | Requer valor padrão. Pode bloquear. Faça nullable primeiro, backfill, depois `SET NOT NULL`. |
| `DROP COLUMN`                 | Crítico | Quebra código antigo. Use Expand-Contract.                                                   |
| `RENAME COLUMN`               | Crítico | Quebra código antigo. Nunca use renomeação direta. Crie nova, copie dados, delete antiga.    |
| `CHANGE TYPE` (int -> bigint) | Médio   | Requer reescrita da tabela inteira. Use abordagem de nova coluna.                            |

#### 4. Bloqueios e Timeouts

Sempre configure `lock_timeout` em suas migrações para evitar que uma migração espere eternamente por um bloqueio, interrompendo outras transações.

```sql
SET lock_timeout = '2s';
ALTER TABLE items ADD COLUMN category_id INT;
```

Se não conseguir adquirir o bloqueio em 2 segundos, falhará. É melhor falhar rápido e tentar novamente do que parar a produção.

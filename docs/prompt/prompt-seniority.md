# 🚀 Seniority Backend Practices (NestJS)

> **28 prácticas avanzadas** para optimización, resiliencia y ahorro de recursos en backend.

---

## 📦 SQL Practice (`sql-practice`)

### 01. Partial Indexes (Índices Parciales)

- **Qué es**: Índices que solo cubren filas que cumplen una condición (`WHERE active = true`).
  > ✅ **Usar**: Tablas con 90% filas inactivas, solo consultas sobre activos.
  > ❌ **No usar**: Consultas que abarcan todos los registros.

### 02. Covering Indexes (INCLUDE)

- **Qué es**: Incluir columnas extra en el índice para evitar ir al heap.
  > ✅ **Usar**: Queries frecuentes que solo leen 2-3 columnas.
  > ❌ **No usar**: Tablas pequeñas (<1000 filas) o muchas columnas.

### 03. Keyset Pagination (Cursor)

- **Qué es**: Paginación con `WHERE id > :lastId` en lugar de `OFFSET`.
  > ✅ **Usar**: Paginación profunda (página 1000+), feeds infinitos.
  > ❌ **No usar**: Cuando necesitas "saltar" a página arbitraria.

### 04. Concurrent Indexing

- **Qué es**: `CREATE INDEX CONCURRENTLY` sin bloquear escrituras.
  > ✅ **Usar**: Producción con tráfico 24/7, zero-downtime.
  > ❌ **No usar**: Migraciones en mantenimiento programado.

### 05. Count Estimation (reltuples)

- **Qué es**: Usar `pg_class.reltuples` para conteo aproximado instantáneo.
  > ✅ **Usar**: Admin panels, "~10M registros", paginación totals.
  > ❌ **No usar**: Reportes financieros que requieren exactitud.

### 06. Upsert (ON CONFLICT)

- **Qué es**: `INSERT ... ON CONFLICT DO UPDATE` atómico.
  > ✅ **Usar**: Sincronización de APIs, webhooks, idempotencia.
  > ❌ **No usar**: Cuando necesitas saber si fue insert o update.

### 07. Lock Timeout

- **Qué es**: `SET LOCAL lock_timeout` para fail-fast en locks.
  > ✅ **Usar**: Migraciones en prod, operaciones críticas.
  > ❌ **No usar**: Transacciones que DEBEN completarse.

---

## 🔴 Cache Practice (`cache-practice`)

### 01. Cache-Aside (Read-Through)

- **Qué es**: Leer caché → Si no existe → DB → Guardar en caché.
  > ✅ **Usar**: Datos leídos frecuentemente, cambian poco.
  > ❌ **No usar**: Datos que cambian cada request.

### 02. Jitter Expiration

- **Qué es**: Aleatorizar TTL para evitar cache stampede.
  > ✅ **Usar**: Miles de keys que podrían expirar juntas.
  > ❌ **No usar**: Keys individuales sin correlación.

### 03. Write-Behind Caching

- **Qué es**: Escribir en caché, responder, persistir async.
  > ✅ **Usar**: Contadores, analytics, datos no críticos.
  > ❌ **No usar**: Transacciones financieras, datos críticos.

### 04. Bloom Filters

- **Qué es**: Filtro probabilístico para saber si "NO existe".
  > ✅ **Usar**: Prevenir ataques con IDs falsos, validar existencia.
  > ❌ **No usar**: Cuando falsos positivos son inaceptables.

### 05. Rate Limiting Distribuido

- **Qué es**: Limitar requests con Lua scripts atómicos en Redis.
  > ✅ **Usar**: APIs públicas, múltiples réplicas del servidor.
  > ❌ **No usar**: Apps single-instance (usar memoria local).

---

## ⚡ Backend Practice (`backend-practice`)

### 01. Stream Backend

- **Qué es**: Procesar datos con Node.js Streams sin cargar en memoria.
  > ✅ **Usar**: Archivos grandes, CSVs, logs, ETL.
  > ❌ **No usar**: Datos pequeños (<1MB).

### 02. Backpressure

- **Qué es**: Control de flujo cuando el productor es más rápido que el consumidor.
  > ✅ **Usar**: Streams, colas, procesamiento en batch.
  > ❌ **No usar**: Operaciones síncronas simples.

### 03. BullMQ (Job Queues)

- **Qué es**: Colas de trabajo con reintentos, delays, prioridades.
  > ✅ **Usar**: Emails, procesamiento async, tareas programadas.
  > ❌ **No usar**: Operaciones que deben ser síncronas.

### 05. Dead Letter Queue (DLQ)

- **Qué es**: Cola para mensajes que fallaron N veces.
  > ✅ **Usar**: Sistemas de mensajería, jobs importantes.
  > ❌ **No usar**: Tareas descartables.

### 06. Worker Threads

- **Qué es**: Hilos para cómputo CPU-intensive sin bloquear event loop.
  > ✅ **Usar**: Encriptación, parsing pesado, cálculos matemáticos.
  > ❌ **No usar**: Operaciones I/O (ya son async).

### 07. Request Deduplication

- **Qué es**: Agrupar requests idénticas en una sola query.
  > ✅ **Usar**: Endpoints "calientes" (home, trending, productos populares).
  > ❌ **No usar**: Datos personalizados por usuario.

### 08. Connection Pooling

- **Qué es**: Reutilizar conexiones de DB en lugar de abrir/cerrar.
  > ✅ **Usar**: **SIEMPRE** en producción.
  > ❌ **No usar**: Nunca desactivar en prod.

### 09. Streaming (Files)

- **Qué es**: Enviar archivos sin cargar en RAM.
  > ✅ **Usar**: Descargas, uploads, videos, PDFs.
  > ❌ **No usar**: Archivos pequeños embebidos en JSON.

### 10. Compression (gzip/brotli)

- **Qué es**: Comprimir respuestas HTTP 70-85%.
  > ✅ **Usar**: APIs con JSON grande, HTML, CSS.
  > ❌ **No usar**: Imágenes/videos (ya comprimidos).

### 11. Memoization

- **Qué es**: Cachear resultados de funciones puras en memoria.
  > ✅ **Usar**: Cálculos repetitivos con mismos parámetros.
  > ❌ **No usar**: Funciones con efectos secundarios.

### 12. Circuit Breaker

- **Qué es**: Cortar llamadas a servicios caídos para evitar cascadas.
  > ✅ **Usar**: Llamadas a microservicios externos.
  > ❌ **No usar**: Operaciones locales sin dependencias.

### 13. Graceful Degradation

- **Qué es**: Fallback a datos alternativos cuando algo falla.
  > ✅ **Usar**: Features no críticas (recomendaciones, analytics).
  > ❌ **No usar**: Funcionalidad core del negocio.

### 14. Request Batching (DataLoader)

- **Qué es**: Agrupar N queries en una sola con `WHERE id IN (...)`.
  > ✅ **Usar**: GraphQL resolvers, N+1 queries.
  > ❌ **No usar**: Queries ya optimizadas con JOINs.

### 15. Lazy Loading

- **Qué es**: Solo cargar datos cuando realmente se necesitan.
  > ✅ **Usar**: APIs con campos opcionales, GraphQL.
  > ❌ **No usar**: Cuando siempre se necesitan todos los campos.

### 16. ETag / Conditional GET

- **Qué es**: Responder 304 Not Modified si el cliente ya tiene los datos.
  > ✅ **Usar**: Recursos que cambian poco, APIs REST.
  > ❌ **No usar**: Datos real-time que cambian cada segundo.

FROM node:24-alpine AS base

# 1. Instalar dumb-init y actualizaciones
RUN apk update && apk upgrade --no-cache && apk add --no-cache dumb-init

# 2. Configurar pnpm (Esto es suficiente, no hace falta config set)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
# AQUÍ ESTÁ LA CLAVE: El target debe coincidir con donde pnpm guarda las cosas por defecto bajo PNPM_HOME
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM base AS build
WORKDIR /usr/src/app
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
ARG PORT=4000
ENV PORT=$PORT

ARG NAME_APP
ENV NAME_APP=$NAME_APP

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG VAPID_EMAIL
ENV VAPID_EMAIL=$VAPID_EMAIL

ARG VAPID_PUBLIC_KEY
ENV VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY

ARG STORAGE_URL
ENV STORAGE_URL=$STORAGE_URL

ARG STORAGE_CDN_URL
ENV STORAGE_CDN_URL=$STORAGE_CDN_URL

# Cacheamos también la instalación final de producción
RUN pnpm run build:client && \
    pnpm run build:serve && \
    rm -rf node_modules && \
    pnpm install --prod --no-frozen-lockfile --ignore-scripts

# Production stage
FROM base AS production
WORKDIR /usr/src/app
ARG PORT=4000
ENV PORT=$PORT
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -S -h /usr/src/app cearjs

RUN mkdir -p logs && \
    chown -R cearjs:nodejs logs && \
    chmod -R 755 logs

COPY --chown=cearjs:nodejs --from=build /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml ./
COPY --chown=cearjs:nodejs --from=build /usr/src/app/node_modules ./node_modules/
COPY --chown=cearjs:nodejs --from=build /usr/src/app/dist ./dist/
COPY --chown=cearjs:nodejs --from=build /usr/src/app/public ./public/
COPY --chown=cearjs:nodejs --from=build /usr/src/app/drizzle.config.ts ./drizzle.config.ts
COPY --chown=cearjs:nodejs --from=build /usr/src/app/drizzle ./drizzle/

USER cearjs

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["pnpm", "run", "start"]
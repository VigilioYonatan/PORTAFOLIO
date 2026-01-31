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
# Cacheamos también la instalación final de producción
RUN pnpm run build:client && \
    pnpm run build:serve && \
    rm -rf node_modules && \
    pnpm install --prod --no-frozen-lockfile --ignore-scripts

# Production stage
FROM base AS production
WORKDIR /usr/src/app
ARG PORT=8000
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
COPY --chown=cearjs:nodejs --from=build /usr/src/app/drizzle ./drizzle/
RUN apk add --no-cache curl unzip

# 2. Descargamos la carpeta (Dropbox la envía como ZIP al usar dl=1)
# Usamos -L para seguir redirecciones y -o para nombrar el archivo temporalmente
RUN apk add --no-cache curl

# 2. Creamos la carpeta de destino
RUN mkdir -p public/video

# 3. Bajamos cada video individualmente
# IMPORTANTE: Reemplaza estos links con los links de "Compartir" de CADA ARCHIVO 
# y asegúrate de que terminen en &dl=1
RUN curl -L -o public/video/insolation.mp4 "https://www.dropbox.com/scl/fi/ovl3sv1qc3w001coj5o4r/insolation.mp4?rlkey=glwr55jj7z85ju5m4med13jui&st=0pgi9si7&dl=0" && \
    curl -L -o public/video/ballena.mp4 "https://www.dropbox.com/scl/fi/gm78ppmfossbtww1ubaf3/ballena.mp4?rlkey=25bf0i4bwfzl2uvfvxbxtm3qs&st=ljd7t9hm&dl=0" && \
    curl -L -o public/video/bird.mp4 "https://www.dropbox.com/scl/fi/wga8wsfc95acsjtfoaj3g/bird.mp4?rlkey=0tqn130hiugw8tgwudbuao9s1&st=45csamjt&dl=0" && \
    curl -L -o public/video/reaper_car.mp4 "https://www.dropbox.com/scl/fi/qwb3bx5musukru72841cl/reaper_car.mp4?rlkey=m49zxhtu6z0fjzx0trp5eorvz&st=wu1evd7c&dl=0" && \
    curl -L -o public/video/reaper_ninja.mp4 "https://www.dropbox.com/scl/fi/6iy6mshvffb169sc8act2/reaper_ninja.mp4?rlkey=crw011mb3lw2xs5zn7yje7fac&st=o6ov0o0y&dl=0" && \
    curl -L -o public/video/reaper_ovni.mp4 "https://www.dropbox.com/scl/fi/hpjjelww6ch61npvnf5t1/reaper_ovni.mp4?rlkey=tdt37s55kwhbvfhoez156ye4f&st=6j07pruw&dl=0" && \
    curl -L -o public/video/wolf.mp4 "https://www.dropbox.com/scl/fi/ru4ouu0yk0adqk50gnd6q/wolf.mp4?rlkey=9xsuhqttsssz2l8drwr56cmjb&st=963adti7&dl=0"
# COPY --chown=cearjs:nodejs --from=build /usr/src/app/src/assets/temp ./src/assets/temp/

USER cearjs

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["pnpm", "run", "start"]
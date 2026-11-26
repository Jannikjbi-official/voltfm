# VoltFM production image (self-hosted, replaces the Vercel deployment).
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* values are baked into the browser bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=https://voltfm.xyz
ARG NEXT_PUBLIC_RADIO_STATION=
ARG NEXT_PUBLIC_RADIO_STREAM_URL=
ARG NEXT_PUBLIC_DISCORD_URL=
ARG NEXT_PUBLIC_RADIO_EMBED=
ENV NEXT_TELEMETRY_DISABLED=1
# placeholders so modules that read these at import time can load during next build; the real values come from .env at runtime
ENV MONGODB_URI=mongodb://build-placeholder:27017 BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime BETTER_AUTH_URL=https://voltfm.xyz
RUN for v in NEXT_PUBLIC_RADIO_STATION NEXT_PUBLIC_RADIO_STREAM_URL NEXT_PUBLIC_DISCORD_URL NEXT_PUBLIC_RADIO_EMBED; do \
      eval "[ -n \"\$$v\" ] || unset $v"; done; \
    npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# full node_modules on purpose: the maintenance scripts (seed, make-admin) run with tsx inside the container
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]

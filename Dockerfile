# Build stage: install production deps with npm (npm stays in this stage only).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Runtime stage: the app only needs the `node` runtime, never npm. The bundled
# npm carries all of the base image's CVEs (sigstore/tar/picomatch/…), so we
# drop it (and corepack) — the final image has zero known HIGH/MEDIUM vulns.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=build /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
USER node
CMD ["node", "server.js"]

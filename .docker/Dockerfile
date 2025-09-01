ARG VERSION=20.10.0

FROM node:$VERSION-alpine AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY ./package.json /app/package.json
RUN --mount=type=cache,target=/root/.npm \
    npm install 

FROM base AS builder
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm run build

FROM base AS development 
RUN apk add --no-cache git
RUN npm install -g nodemon 
COPY --from=deps --chown=node:node /app/node_modules /app/node_modules
COPY --chown=node:node . .
CMD ["npm", "run", "dev"]

FROM node:${VERSION}-alpine AS esbuild
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]

FROM base AS production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=development /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]

FROM gcr.io/distroless/nodejs20 AS production-distroless
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["dist/server.js"]
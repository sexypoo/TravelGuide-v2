FROM node:20-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS dependencies
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
ARG API_INTERNAL_URL=http://localhost:3001
ENV API_INTERNAL_URL=$API_INTERNAL_URL
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

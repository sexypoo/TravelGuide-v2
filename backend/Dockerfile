FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache openssl && corepack enable

FROM base AS build

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src
RUN yarn db:generate && yarn build

FROM base AS runtime

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn workspaces focus --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

EXPOSE 3001
CMD ["sh", "-c", "yarn db:deploy && yarn db:seed && node dist/main.js"]

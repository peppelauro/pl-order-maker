FROM node:20-bookworm-slim AS build

WORKDIR /app

ENV EXPO_NO_TELEMETRY=1 \
    CI=1 \
    EXPO_PUBLIC_BACKEND_URL=

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

COPY . .
RUN yarn expo export --platform web

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

FROM node:18-alpine as build

RUN mkdir -p /opt/alertra-promtheus-exporter
WORKDIR /src

COPY package*.json tsconfig.json app.ts ./
COPY lib lib/
RUN tree ./
RUN npm install --unsafe-perm
RUN npm exec tsc

FROM node:18-alpine
WORKDIR /opt/alertra-prometheus-exporter
COPY --from=build /src/package*.json /src/dist ./
RUN tree ./
RUN npm ci --omit=dev && npm cache clean --force && find -name "*.ts" -delete
RUN tree ./
ENV PORT=13964
EXPOSE 13964
CMD ["node", "app.js"]

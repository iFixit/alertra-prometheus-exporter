FROM node:18-alpine
RUN mkdir -p /opt/alertra-promtheus-exporter
WORKDIR /opt/alertra-prometheus-exporter

COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . ./
RUN npm exec tsc
ENV PORT=13964
EXPOSE 13964
ENTRYPOINT ["node", "dist/app.js"]

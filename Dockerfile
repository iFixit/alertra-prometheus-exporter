FROM node:18-alpine

RUN mkdir -p /opt/alertra-promtheus-exporter
WORKDIR /opt/alertra-promtheus-exporter

COPY package*.json tsconfig.json app.ts /opt/alertra-promtheus-exporter/
COPY lib /opt/alertra-promtheus-exporter/lib/
RUN tree ./
RUN npm install --unsafe-perm
RUN npm exec tsc

ENV PORT=13964
EXPOSE 13964
CMD ["node dist/app.js"]

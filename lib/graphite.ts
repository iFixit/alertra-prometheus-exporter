import type { Labels, Metric } from "./metrics.js";

export function getGraphiteBodyForMetrics(metrics: Metric[]): string {
  const output: string[] = [];
  const ts = Math.round(Date.now() / 1000);
  metrics.forEach(({name, values}) => {
    values.forEach(([labels, value]) => {
      output.push(metric(name, labels, value, ts))
    });
  });
  return output.join("\n");
}

function safeLabel(label: string) {
  return label.replace(/[;!^= ]+/g, "_");
}

function safeLabelValue(value: string) {
  return value.replace(/^~|[; ]+/g, "_");
}

function toLabelString(labels: Labels) {
  return Object.entries(labels).map(
    ([name, value]) => `${safeLabel(name)}=${safeLabelValue(value)}`
  ).join(";");
}

function metric(name: string, labels: Labels, value: number, timestamp: number) {
   const graphiteName = name.replace(/^alertra_/, "alertra.");
   return `${graphiteName};${toLabelString(labels)} ${value} ${timestamp}`;
}
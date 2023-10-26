import type { Labels, Metric } from "./metrics.js";

export function getPromtheusResponseForMetrics(metrics: Metric[]): string {
  const output = [
    help('alertra_check_time', "Time in seconds of segements of the request"),
    type("alertra_check_time", "gauge"),
    help('alertra_check_total_time', "Time in seconds of the whole request"),
    type("alertra_check_total_time", "gauge"),
    help('alertra_check_response_bytes', "Number of bytes in the response"),
    type("alertra_check_response_bytes", "gauge"),
  ];

  metrics.forEach(({name, values}) => {
    values.forEach(([labels, value]) => {
      output.push(metric(name, labels, value))
    });
  });
  return output.join("\n");
}

function toLabelString(labels: Labels) {
  return Object.entries(labels).map(
    ([key, value]) => `${key}="${value}"`
  ).join(",");
}

function metric(name: string, labels: Labels, value: number) {
   return `${name}{${toLabelString(labels)} ${value}`;
}

function help(name: string, help: string) {
  return `HELP ${name} ${help}`;
}

function type(name: string, type: string) {
  return `TYPE ${name} ${type}`;
}
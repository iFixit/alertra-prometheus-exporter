import { Alertra, CheckRecord } from './lib/alertra/alertra.js';
import { ChecksByDeviceAndLocation, getChecksByDeviceAndLocationLoader } from './lib/alertra/alertra-checks.js';
import * as http from "http";
import * as net from "net";
import { getPromtheusResponseForMetrics } from './lib/prometheus.js';
import { getMetricsFromDevices } from './lib/metrics.js';
import { getGraphiteBodyForMetrics } from './lib/graphite.js';

const httpPort = Number(process.env.PORT) || 13964;
const cacheTTL = Number(process.env.METRIC_CACHE_TTL) || 10 * 60;

const alertra = new Alertra(String(process.env.ALERTRA_API_KEY));
const getChecksByDevice = getChecksByDeviceAndLocationLoader(alertra, cacheTTL);

http.createServer(async (req, res) => {
  try {
    const devices = await getChecksByDevice();
    const metrics = getMetricsFromDevices(devices);
    res.end(getPromtheusResponseForMetrics(metrics));
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    if (e instanceof Error) {
      res.write("# " + e.message);
    }
  }
  res.end();
}).listen(httpPort);

console.log("Listening for requests on port " + httpPort);

const graphiteHost = String(process.env.GRAPHITE_HOST);
if (graphiteHost) {
  const graphitePort = Number(process.env.GRAPHITE_PORT) || 2003;
  const graphiteInterval = Number(process.env.GRAPHITE_INTERVAL_S) || 60;
  console.log(`Reporting metrics to Graphite at ${graphiteHost}:${graphitePort} every ${graphiteInterval} seconds`);
  setInterval(async () => {
    try {
      const devices = await getChecksByDevice();
      const metrics = getMetricsFromDevices(devices);
      const graphiteSocket = net.createConnection(graphitePort, graphiteHost);
      graphiteSocket.on("connect", () => {
        graphiteSocket.end(getGraphiteBodyForMetrics(metrics));
      });
      graphiteSocket.on("error", (e: Error) => {
        console.error(`Failed to connect or write graphite metrics to ${graphiteHost}:${graphitePort}: ${e.message}`);
        graphiteSocket.destroy();
      });
    } catch (e) {
      console.error(e);
    }
  }, graphiteInterval * 1000);
}
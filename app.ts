import { Alertra, CheckRecord } from './lib/alertra/alertra.js';
import { ChecksByDeviceAndLocation, getChecksByDeviceAndLocationLoader } from './lib/alertra/alertra-checks.js';
import * as http from "http";
import { getPromtheusResponseForMetrics } from './lib/prometheus.js';
import { getMetricsFromDevices } from './lib/metrics.js';

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
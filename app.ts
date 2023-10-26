import { Alertra, CheckRecord } from './lib/alertra/alertra.js';
import { ChecksByDeviceAndLocation, getChecksByDeviceAndLocationLoader } from './lib/alertra/alertra-checks.js';
import * as http from "http";

const httpPort = Number(process.env.PORT) || 13964;
const cacheTTL = Number(process.env.METRIC_CACHE_TTL) || 10 * 60;

const alertra = new Alertra(String(process.env.ALERTRA_API_KEY));
const getChecksByDevice = getChecksByDeviceAndLocationLoader(alertra, cacheTTL);

function writeMetrics(res: http.ServerResponse, devices: ChecksByDeviceAndLocation) {
  const output = [
    help('alertra_check_time', "Time in seconds of segements of the request"),
    type("alertra_check_time", "gauge"),
    help('alertra_check_total_time', "Time in seconds of the whole request"),
    type("alertra_check_total_time", "gauge"),
    help('alertra_check_response_bytes', "Number of bytes in the response"),
    type("alertra_check_response_bytes", "gauge"),
  ];
  devices.forEach(device => {
    device.checksByLocation.forEach((check, location) => {
      const labels = [
        label("device", device.ShortName),
        label("location", location)
      ];
      output.push(
        ...metric('alertra_check_time',
          [
            [[...labels, label('component', 'DNS')], msToS(check.DNSTime)],
            [[...labels, label('component', 'Connect')], msToS(check.ConnectTime)],
            [[...labels, label('component', 'SSL')], msToS(check.SSLTime)],
            [[...labels, label('component', 'TTFB')], msToS(check.TTFB)],
            [[...labels, label('component', 'TTLB')], msToS(check.TTLB)],
          ]
        ),

        ...metric('alertra_check_total_time', [[labels, msToS(check.RequestTime)]]),
        ...metric('alertra_check_response_bytes', [[labels, check.DataSize]])
      );
    });
  });
  res.write(output.join("\n"));
}

function label(key: string, value: string) {
  return `${key}="${value}"`;
}

function metric(name: string, values: Array<[string[],number]>) {
  return values.map(([labels, value]) => {
    return `${name}{${labels.join(",")}} ${value}`;
  });
}

function help(name: string, help: string) {
  return `HELP ${name} ${help}`;
}

function type(name: string, type: string) {
  return `TYPE ${name} ${type}`;
}

function msToS(ms: number) {
  return ms / 1000;
}

http.createServer(async (req, res) => {
  try {
    const devices = await getChecksByDevice();
    writeMetrics(res, devices);
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
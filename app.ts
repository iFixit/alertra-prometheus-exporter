import express from 'express';
import { Alertra, CheckRecord } from './alertra/alertra.js';
import { cachedGetAllDevices, getAllDevicesAndChecks } from './alertra/alertra-checks.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const a = new Alertra(String(process.env.ALERTRA_API_KEY));
const getDevices = cachedGetAllDevices(a, 60);

getDevices().then(devices => {
  devices.map(device => {
    const checksByLocation = new Map<string, CheckRecord>();
    device.checks.forEach(check => {
      if (!checksByLocation.has(check.Location)) {
        checksByLocation.set(check.Location, check);
      }
    });
    return {
      ShortName: device.ShortName,
      checksByLocation,
    };
  }).forEach(device => {
    device.checksByLocation.forEach((check, location) => {
      const labels = [
        label("device", device.ShortName),
        label("location", location)
      ];
      const output = [
        help('alertra_check_time', "Time in seconds of segements of the request"),
        type("alertra_check_time", "gauge"),
        ...metric('alertra_check_time',
          [
            [[...labels, label('component', 'DNS')], msToS(check.DNSTime)],
            [[...labels, label('component', 'Connect')], msToS(check.ConnectTime)],
            [[...labels, label('component', 'SSL')], msToS(check.SSLTime)],
            [[...labels, label('component', 'TTFB')], msToS(check.TTFB)],
            [[...labels, label('component', 'TTLB')], msToS(check.TTLB)],
          ]
        ),

        help('alertra_check_total_time', "Time in seconds of the whole request"),
        type("alertra_check_total_time", "gauge"),
        ...metric('alertra_check_total_time', [[labels, msToS(check.RequestTime)]]),

        help('alertra_check_response_bytes', "Number of bytes in the response"),
        type("alertra_check_response_bytes", "gauge"),
        ...metric('alertra_check_response_bytes', [[labels, check.DataSize]]),
      ];
      console.log(output.join("\n"));
    });
  });
  process.exit();
});

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

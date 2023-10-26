import { ChecksByDeviceAndLocation } from "./alertra/alertra-checks";

export type Labels = Record<string, string>;
export type Metric = {
   name: string;
   values: Array<[Record<string, string>, number]>;
}

export function getMetricsFromDevices(devices: ChecksByDeviceAndLocation): Metric[] {
  const metrics: Metric[] = [];
  devices.forEach(device => {
    device.checksByLocation.forEach((check, location) => {
      const labels = {
        device: device.ShortName,
        location,
      };

      metrics.push(
        {name: 'alertra_check_time', values: 
          [
            [{...labels, component: 'DNS'}, msToS(check.DNSTime)],
            [{...labels, component: 'Connect'}, msToS(check.ConnectTime)],
            [{...labels, component: 'SSL'}, msToS(check.SSLTime)],
            [{...labels, component: 'TTFB'}, msToS(check.TTFB)],
            [{...labels, component: 'TTLB'}, msToS(check.TTLB)],
          ]
        },
        {name: 'alertra_check_total_time', values: [[labels, msToS(check.RequestTime)]]},
        {name: 'alertra_check_response_bytes', values: [[labels, check.DataSize]]}
      );
    });
  });
  return metrics;
}

function msToS(ms: number) {
  return ms / 1000;
}

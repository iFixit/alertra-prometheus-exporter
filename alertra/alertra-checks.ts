import { Alertra, CheckRecord } from "./alertra";

const devicesToFetch = 30;
const checksToFetch = 30;

export function getAllDevicesAndChecks(alertra: Alertra) {
   return alertra.devices(devicesToFetch).then(devices => {
      return Promise.all(devices.map(device => {
         return alertra.checks(device.device_id, checksToFetch).then(checks => {
            return {...device, checks};
         });
      }));
   });
}

export function getChecksByDeviceAndLocation(alertra: Alertra) {
   return getAllDevicesAndChecks(alertra).then(devices =>
      devices.map(device => (
         {
            ShortName: device.ShortName,
            checksByLocation: mostRecentCheckPerLocation(device.checks),
         }
      ))
   );
}

function mostRecentCheckPerLocation(checks: CheckRecord[]) {
   const checksByLocation = new Map<string, CheckRecord>();
   checks.sort((a, b) => compDesc(a.Timestamp, b.Timestamp));
   checks.forEach(check => {
      if (!checksByLocation.has(check.Location)) {
         checksByLocation.set(check.Location, check);
      }
   });
   return checksByLocation;
}

function compDesc(a: string, b: string): number {
   return a === b ? 0 : (a > b ? -1 : 1);
}

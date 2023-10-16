import { Alertra, CheckRecord } from "./alertra";

export function getAllDevicesAndChecks(alertra: Alertra) {
   return alertra.devices(1).then(devices => {
      return Promise.all(devices.map(device => {
         return alertra.checks(device.device_id, 30).then(checks => {
            return {...device, checks};
         });
      }));
   });
}

function debounce<T>(fn: () => T, delay: number): () => T {
   let lastCall = 0;
   let value: T|null = null;
   return (() => {
      if (Date.now() > lastCall + delay || value === null) {
         value = fn();
         lastCall = Date.now();
      }
      return value;
   });
}

export function cachedGetChecksByDeviceAndLocation(alertra: Alertra, refetchSeconds: number) {
   function fetchDevices() {
      return getAllDevicesAndChecks(alertra).then(devices =>
         devices.map(device => (
            {
               ShortName: device.ShortName,
               checksByLocation: mostRecentCheckPerLocation(device.checks),
            }
         ))
      )
   }
   return debounce(fetchDevices, refetchSeconds * 1000);
}

function mostRecentCheckPerLocation(checks: CheckRecord[]) {
   const checksByLocation = new Map<string, CheckRecord>();
   checks.forEach(check => {
      if (!checksByLocation.has(check.Location)) {
         checksByLocation.set(check.Location, check);
      }
   });
   return checksByLocation;
}
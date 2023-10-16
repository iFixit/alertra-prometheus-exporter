import { Alertra } from "./alertra";

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

export function cachedGetAllDevices(alertra: Alertra, refetchSeconds: number) {
   function fetchDevices() {
      return getAllDevicesAndChecks(alertra);
   }
   return debounce(fetchDevices, refetchSeconds * 1000);
}
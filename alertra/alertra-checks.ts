import { type } from "os";
import { Alertra, CheckRecord } from "./alertra";

const devicesToFetch = 30;
const checksToFetch = 30;
const ignoreChecksOlderThanMs = 3600 * 1000;

export type ChecksByDeviceAndLocation = Awaited<ReturnType<typeof getChecksByDeviceAndLocation>>;

export function getChecksByDeviceAndLocationLoader(alertra: Alertra, cacheTTL: number) {
   let lastFetch = 0;
   let checks: null|Promise<ChecksByDeviceAndLocation> = null;
   const cacheTTLms = cacheTTL * 1000;
   return (): Promise<ChecksByDeviceAndLocation> => {
      if (!checks || (Date.now() - lastFetch) > cacheTTLms) {
         lastFetch = Date.now();
         checks = getChecksByDeviceAndLocation(alertra);
         checks.then(() => console.log("Devices and Checks fetched from Alertra in " + (Date.now() - lastFetch) / 1000 + "s"));
      }
      return checks;
   };
}

function getAllDevicesAndChecks(alertra: Alertra) {
   return alertra.devices(devicesToFetch).then(devices => {
      return Promise.all(devices.map(device => {
         return alertra.checks(device.device_id, checksToFetch).then(checks => {
            const recentChecks = checks.filter(isCheckRecent);
            return {...device, checks: recentChecks};
         });
      }));
   });
}

function getChecksByDeviceAndLocation(alertra: Alertra) {
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

function isCheckRecent(check: CheckRecord): boolean {
   const checkDate = new Date(check.Timestamp);
   return (Date.now() - checkDate.getTime()) < ignoreChecksOlderThanMs;
}

function compDesc(a: string, b: string): number {
   return a === b ? 0 : (a > b ? -1 : 1);
}

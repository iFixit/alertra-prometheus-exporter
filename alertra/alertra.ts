import fetch from 'node-fetch';

type DeviceRecord = {
   id: string;
   ShortName: string;
};

export class Alertra {
   #apiKey: string;
   #fetchOptions: {headers?: Record<string,string>} = {};

   constructor(apiKey: string) {
      this.#apiKey = apiKey;
      this.#fetchOptions = {
         headers: {
            "Alertra-API-Key": this.#apiKey,
         }
      };
   }

   devices(maxRecords: number) {
      return this.paginate<DeviceRecord>("https://api.alertra.com/v1.1/devices", maxRecords);
   }

   async paginate<ResponseRecord>(url: string, maxRecords: number) {
      var results: ResponseRecord[] = [];
      let page = 0;
      const pageSize = 50;
      const getPaginatedUrl = urlPaginator(url, pageSize);
      while (true) {
         const response = await fetch(getPaginatedUrl(page), this.#fetchOptions);
         const resultPage = await response.json() as ResponseRecord[];
         results = results.concat(resultPage.slice(0, pageSize));
         if (resultPage.length <= pageSize || results.length >= maxRecords) {
            break;
         }
         page++;
      }
      return results;
   }
}

function urlPaginator(url: string, pageSize: number) {
   return function (page: number) {
      return `${url}?Limit=${pageSize+1}&Offset=${page * pageSize}`;
   }
}
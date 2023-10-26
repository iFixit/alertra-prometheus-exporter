## alertra-prometheus-reporter

[Alertra](https://alertra.com) repeatedly pings urls from around the globe and records stats about the
responses (timing, bytes, location, ...). This tool uses alertra's API to pull
down check data for all devices (urls its configured to ping) and expose that
as prometheus and graphite metrics.

Specifically, this exposes three prometheus gauge metrics:
   
    # Reported once per device and location and component (DNS, TTFB, ...) such that
    #    sum by (device, location)(alertra_check_time) of these should match the
    # alertra_check_total_time metric below.
    HELP alertra_check_time Time in seconds of segements of the request
    TYPE alertra_check_time gauge

    # Reported once per device and location
    HELP alertra_check_total_time Time in seconds of the whole request
    TYPE alertra_check_total_time gauge

    # Reported once per device and location
    HELP alertra_check_response_bytes Number of bytes in the response
    TYPE alertra_check_response_bytes gauge

The same information is reported to graphite if configured as three gauge metrics:

    alertra.check_time
    alertra.check_total_time
    alertra.check_response_bytes

### Config

* env: `ALERTRA_API_KEY`
* env: `PORT` (default 13964) tcp port on which to listen for http requests
* env: `METRIC_CACHE_TTL` (default 600) Cache lifetime for alertra data
    * After this many seconds have passed since the data was fetch, it'll be fetched again on the next request
* env: `GRAPHITE_HOST` (default null) hostname of graphite server
    * If not null, this server will also report these stats to graphite
* env: `GRAPHITE_PORT` (default 2003) port number of graphite server
* env: `GRAPHITE_INTERVAL_S` (default 10s) How often in seconds to report these metrics to graphite

### Usage

* `npm run start`
* OR `npm run build` then `node dist/app.js`

If errors are encoutered they are printed on stderr and the client will
receieve a 500.

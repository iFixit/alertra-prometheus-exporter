## alertra-prometheus-reporter

[Alertra](https://alertra.com) repeatedly pings urls from around the globe and records stats about the
responses (timing, bytes, location, ...). This tool uses alertra's API to pull
down check data for all devices (urls its configured to ping) and expose that
as prometheus metrics.

Specifically, this exposes three gauge metrics:
   
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

### Usage

Set the `ALERTRA_API_KEY` env variable and run `npm run start` (in dev mode) or
`node dist/app.js` if it's already been built to print the prometheus metics.
The metrics are delievered on stdout, debug, progress, or error messages are
written to stderr.

To use it in production, set up a cron job like so:

    */10 * * * * cd /path/to/app && node ./dist/app.ts > metrics.list

The configure something like a [prometheus file exporter](https://github.com/weibeld/file-exporter)
to serve that to prometheus.


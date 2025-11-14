# NeretvaLive

Real-time weather for Croatia’s Neretva River Delta.

## Known Limitations

- The MET Norway forecast now loads purely in the browser. We no longer add cache headers, retries, or a custom `User-Agent` like the previous server load did. Plan: stand up a tiny proxy (Edge/Function) that restores the shared cache and headers, then point the client loader at it.

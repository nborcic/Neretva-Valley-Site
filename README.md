# NeretvaLive 🌤️

Real-time weather conditions and forecasts for the Neretva River Delta region in Croatia.

## Features

- Interactive weather map with location details
- 2-day hourly forecast with temperature, precipitation, and wind
- Multi-language support (English, Croatian)
- YR.no integration and weather meteogram
- Mobile-friendly responsive design

## Tech Stack

SvelteKit 2.0 • Tailwind CSS v4 • Leaflet.js • svelte-i18n • Open-Meteo API • YR.no

## Quick Start

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```sh
npm run build
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── components/WeatherMap.svelte
│   ├── locales/              # EN, HR translations
│   └── services/weatherService.js
└── routes/
    ├── +page.svelte          # Main dashboard
    └── privacy/+page.svelte
```

---

Built with ❤️ for the Neretva River Delta community

// @ts-expect-error: Type definitions for './$types' may not be available during linting
import type { PageServerLoad } from './$types';

type Timeseries = {
    time: string;
    data: {
        instant: { details: { air_temperature: number; wind_speed: number } };
        next_1_hours?: {
            summary: { symbol_code: string };
            details?: { precipitation_amount: number };
        };
    };
};
type MetResponse = { properties: { timeseries: Timeseries[] } };

const toISO = (d: Date) => d.toISOString().slice(0, 10);

function icon(symbol?: string | null): string {
    if (!symbol) return "•";
    if (symbol.includes("clearsky")) return symbol.includes("night") ? "🌙" : "☀️";
    if (symbol.includes("fair")) return "🌤️";
    if (symbol.includes("partlycloudy")) return "⛅";
    if (symbol.includes("cloudy")) return "☁️";
    if (symbol.includes("rain")) return "🌧️";
    if (symbol.includes("snow")) return "🌨️";
    if (symbol.includes("thunder")) return "⛈️";
    return "•";
}

function pickSymbol(ts: Timeseries[], dayISO: string, hour: number) {
    const rows = ts.filter((t) => t.time.startsWith(dayISO));
    if (!rows.length) return "clearsky_day";
    let best: Timeseries | null = null;
    let bestDelta = 99;
    for (const r of rows) {
        const h = new Date(r.time).getHours(); // local hour
        const d = Math.abs(h - hour);
        if (d < bestDelta) {
            bestDelta = d;
            best = r;
        }
    }
    const s = best?.data.next_1_hours?.summary.symbol_code;
    if (s) return s;
    const alt = rows.find((r) => r.data.next_1_hours?.summary.symbol_code);
    return alt?.data.next_1_hours?.summary.symbol_code ?? "clearsky_day";
}

export const load: PageServerLoad = async ({ fetch }) => {
    const lat = 42.65, lon = 18.09; // Dubrovnik
    const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        { headers: { "User-Agent": "Neretva-Weather-App/1.0 (neretvalive@proton.me)" } }
    );
    const json = (await res.json()) as MetResponse;
    const ts = json.properties.timeseries;

    const byDay = new Map<string, { min: number; max: number; wind: number[]; precip: number[] }>();
    for (const t of ts) {
        const d = toISO(new Date(t.time));
        const temp = t.data.instant.details.air_temperature;
        const wind = t.data.instant.details.wind_speed;
        const pr = t.data.next_1_hours?.details?.precipitation_amount ?? 0;
        const cur = byDay.get(d) ?? { min: temp, max: temp, wind: [], precip: [] };
        cur.min = Math.min(cur.min, temp);
        cur.max = Math.max(cur.max, temp);
        cur.wind.push(wind);
        cur.precip.push(pr);
        byDay.set(d, cur);
    }

    const today = toISO(new Date());
    const tomorrow = toISO(new Date(Date.now() + 86400000));

    const makeDay = (dayISO: string, label: string) => {
        const s = byDay.get(dayISO);
        if (!s) return null;
        return {
            date: dayISO,
            label,
            night: icon(pickSymbol(ts, dayISO, 0)),
            morning: icon(pickSymbol(ts, dayISO, 6)),
            afternoon: icon(pickSymbol(ts, dayISO, 12)),
            evening: icon(pickSymbol(ts, dayISO, 18)),
            hi: Math.round(s.max),
            lo: Math.round(s.min),
            precip: Math.round(s.precip.reduce((a, b) => a + b, 0)),
            wind: Math.round(s.wind.reduce((a, b) => a + b, 0) / s.wind.length)
        };
    };

    return {
        days: [makeDay(today, "Today"), makeDay(tomorrow, "Tomorrow")].filter(Boolean)
    };
};

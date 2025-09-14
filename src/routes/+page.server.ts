import type { PageServerLoad } from './$types';

type Town = {
	key: string;
	name: string;
	subtitle: string;
	lat: number;
	lon: number;
};

type HourChip = {
	time: string; // HH:mm
	tempC: number;
	symbol: string;
};

type DayOutlook = {
	date: string; // YYYY-MM-DD
	highC: number;
	lowC: number;
	symbol: string;
	text: string;
};

type TownWeather = {
	town: Town;
	current: {
		tempC: number;
		windKmh: number;
		precipLastHourMm: number | null;
		cloudPercent: number | null;
		humidityPercent: number | null;
		symbol: string;
		feelsLikeC: number | null;
		uvIndex: number | null;
		sunrise?: string | null; // ISO
		sunset?: string | null;  // ISO
	};
	hours: HourChip[];
	days: DayOutlook[];
	error?: string;
};

const MET_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const SUN_BASE = 'https://api.met.no/weatherapi/sunrise/3.0/sun';
const USER_AGENT = 'neretva-weather/1.0 your-email@example.com';

const TOWNS: Town[] = [
	{ key: 'opuzen', name: 'Opuzen', subtitle: 'Dubrovnik–Neretva, HR', lat: 43.015, lon: 17.565 },
	{ key: 'metkovic', name: 'Metković', subtitle: 'Dubrovnik–Neretva, HR', lat: 43.054, lon: 17.648 },
	{ key: 'ploce', name: 'Ploče', subtitle: 'Dubrovnik–Neretva, HR', lat: 43.056, lon: 17.431 }
];

function msToKmh(ms: number): number {
	return Math.round(ms * 3.6);
}

function cToFeltLike(tempC: number, windMs?: number, humidity?: number): number | null {
	// Simple approximation: wind chill for <= 10C; humidex for >= 20C; otherwise null
	if (typeof tempC !== 'number') return null;
	if (tempC <= 10 && typeof windMs === 'number') {
		const v = Math.max(windMs * 3.6, 4.8); // km/h, floor to 4.8 to avoid extreme values
		const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(v, 0.16) + 0.3965 * tempC * Math.pow(v, 0.16);
		return Math.round(wc);
	}
	if (tempC >= 20 && typeof humidity === 'number') {
		// very rough: feels like increases with humidity
		const felt = tempC + (humidity - 50) * 0.05;
		return Math.round(felt);
	}
	return null;
}

function symbolToTextHr(symbol: string): string {
	const map: Record<string, string> = {
		clearsky_day: 'sunčano',
		clearsky_night: 'vedro',
		fair_day: 'vedro',
		fair_night: 'vedro',
		partlycloudy_day: 'djelom. oblačno',
		partlycloudy_night: 'djelom. oblačno',
		cloudy: 'oblačno',
		lightrain: 'slaba kiša',
		rain: 'kiša',
		heavyrain: 'obilna kiša',
		snow: 'snijeg',
		snowshowers_day: 'snijeg',
		fog: 'magla'
	};
	return map[symbol] || 'promjenjivo';
}

type CacheEntry = { timestamp: number; data: TownWeather[] };
let cache: CacheEntry | null = null;
const TEN_MIN = 10 * 60 * 1000;

async function fetchMet(lat: number, lon: number) {
	const res = await fetch(`${MET_BASE}?lat=${lat}&lon=${lon}`, {
		headers: { 'User-Agent': USER_AGENT }
	});
	if (!res.ok) throw new Error(`MET ${res.status}`);
	return res.json();
}

async function fetchSun(lat: number, lon: number, dateIso: string, offset = '+00:00') {
	const url = `${SUN_BASE}?lat=${lat}&lon=${lon}&date=${dateIso}&offset=${encodeURIComponent(offset)}`;
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) return null;
	return res.json();
}

function toHour(t: string): string {
	return new Date(t).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

function toDate(t: string): string {
	return new Date(t).toISOString().slice(0, 10);
}

function dailyBuckets(timeseries: any[]): Record<string, any[]> {
	return timeseries.reduce((acc, entry) => {
		const day = toDate(entry.time);
		(acc[day] ||= []).push(entry);
		return acc;
	}, {} as Record<string, any[]>);
}

async function buildTownWeather(town: Town): Promise<TownWeather> {
	try {
		const met = await fetchMet(town.lat, town.lon);
		const series: any[] = met.properties.timeseries || [];
		const now = series[0];
		const nowDetails = now?.data?.instant?.details || {};
		const nextHours = series.slice(0, 8);
		const hours: HourChip[] = nextHours.map((e) => ({
			time: toHour(e.time),
			tempC: Math.round(e.data.instant?.details?.air_temperature ?? NaN),
			symbol: e.data.next_1_hours?.summary?.symbol_code || e.data.next_6_hours?.summary?.symbol_code || 'partlycloudy_day'
		}));

		const buckets = dailyBuckets(series.slice(0, 24 * 4)); // next ~4 days
		const dayKeys = Object.keys(buckets).slice(0, 3);
		const days: DayOutlook[] = dayKeys.map((d) => {
			const entries = buckets[d];
			let high = -Infinity;
			let low = Infinity;
			let symbol = 'partlycloudy_day';
			for (const e of entries) {
				const t = e.data.instant?.details?.air_temperature;
				if (typeof t === 'number') {
					high = Math.max(high, t);
					low = Math.min(low, t);
				}
				const s = e.data.next_6_hours?.summary?.symbol_code || e.data.next_12_hours?.summary?.symbol_code || e.data.next_1_hours?.summary?.symbol_code;
				if (s) symbol = s;
			}
			if (!isFinite(high)) high = Math.round(nowDetails.air_temperature ?? 0);
			if (!isFinite(low)) low = Math.round(nowDetails.air_temperature ?? 0);
			return {
				date: d,
				highC: Math.round(high),
				lowC: Math.round(low),
				symbol,
				text: symbolToTextHr(symbol)
			};
		});

		const symbol = now?.data?.next_1_hours?.summary?.symbol_code || now?.data?.next_6_hours?.summary?.symbol_code || 'partlycloudy_day';
		const windMs = nowDetails.wind_speed as number | undefined;
		const humidity = nowDetails.relative_humidity as number | undefined;
		const feels = cToFeltLike(nowDetails.air_temperature, windMs, humidity);

		// precip last hour if available
		const precip = now?.data?.next_1_hours?.details?.precipitation_amount
			?? now?.data?.previous_1_hours?.details?.precipitation_amount
			?? null;

		// sunrise/sunset for today
		const dateIso = new Date().toISOString().slice(0, 10);
		const sun = await fetchSun(town.lat, town.lon, dateIso);
		const sunriseIso = sun?.properties?.sunrise?.time || null;
		const sunsetIso = sun?.properties?.sunset?.time || null;

		const data: TownWeather = {
			town,
			current: {
				tempC: Math.round(nowDetails.air_temperature ?? NaN),
				windKmh: msToKmh(windMs ?? 0),
				precipLastHourMm: typeof precip === 'number' ? Math.round(precip * 10) / 10 : null,
				cloudPercent: typeof nowDetails.cloud_area_fraction === 'number' ? Math.round(nowDetails.cloud_area_fraction) : null,
				humidityPercent: typeof humidity === 'number' ? Math.round(humidity) : null,
				symbol,
				feelsLikeC: feels,
				uvIndex: null,
				sunrise: sunriseIso,
				sunset: sunsetIso
			},
			hours,
			days
		};
		return data;
	} catch (e: any) {
		return {
			town,
			current: {
				tempC: NaN,
				windKmh: 0,
				precipLastHourMm: null,
				cloudPercent: null,
				humidityPercent: null,
				symbol: 'partlycloudy_day',
				feelsLikeC: null,
				uvIndex: null,
				sunrise: null,
				sunset: null
			},
			hours: [],
			days: [],
			error: 'Nema podataka. Pokušaj ponovno.'
		};
	}
}

export const load: PageServerLoad = async () => {
	if (cache && Date.now() - cache.timestamp < TEN_MIN) {
		return { towns: cache.data };
	}
	const results = await Promise.all(TOWNS.map((t) => buildTownWeather(t)));
	cache = { timestamp: Date.now(), data: results };
	return { towns: results };
};


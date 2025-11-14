import type { PageLoad } from './$types';

type Timeseries = {
	time: string;
	data: {
		instant: { details: { air_temperature: number; wind_speed: number } };
		next_1_hours?: {
			summary?: { symbol_code: string };
			details?: { precipitation_amount: number };
		};
	};
};

type MetResponse = { properties: { timeseries: Timeseries[] } };

const MET_FORECAST_URL =
	'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=43.05&lon=17.6';
const MET_FORECAST_TIMEOUT_MS = 7_000;

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const parseTimeseriesEntry = (entry: unknown): Timeseries | null => {
	if (!entry || typeof entry !== 'object') return null;
	const record = entry as Record<string, unknown>;

	const time = record.time;
	if (typeof time !== 'string') return null;

	const data = record.data;
	if (!data || typeof data !== 'object') return null;
	const dataRecord = data as Record<string, unknown>;

	const instant = dataRecord.instant;
	if (!instant || typeof instant !== 'object') return null;
	const instantRecord = instant as Record<string, unknown>;

	const details = instantRecord.details;
	if (!details || typeof details !== 'object') return null;
	const detailsRecord = details as Record<string, unknown>;

	const airTemperature = detailsRecord.air_temperature;
	const windSpeed = detailsRecord.wind_speed;
	if (!isFiniteNumber(airTemperature) || !isFiniteNumber(windSpeed)) return null;

	const next1Raw = dataRecord.next_1_hours;
	let next1: Timeseries['data']['next_1_hours'];
	if (next1Raw && typeof next1Raw === 'object') {
		const nextRecord = next1Raw as Record<string, unknown>;
		const summaryRaw = nextRecord.summary;
		const detailsRaw = nextRecord.details;

		const summary =
			summaryRaw && typeof summaryRaw === 'object'
				? (summaryRaw as Record<string, unknown>).symbol_code
				: undefined;
		const precipitation =
			detailsRaw && typeof detailsRaw === 'object'
				? (detailsRaw as Record<string, unknown>).precipitation_amount
				: undefined;

		next1 =
			(summary && typeof summary === 'string') || isFiniteNumber(precipitation)
				? {
						summary: typeof summary === 'string' ? { symbol_code: summary } : undefined,
						details: isFiniteNumber(precipitation)
							? { precipitation_amount: precipitation }
							: undefined
					}
				: undefined;
	}

	return {
		time,
		data: {
			instant: { details: { air_temperature: airTemperature, wind_speed: windSpeed } },
			next_1_hours: next1
		}
	};
};

const parseMetResponse = (raw: unknown): MetResponse => {
	if (!raw || typeof raw !== 'object') {
		throw new Error('MET response was not an object');
	}

	const properties = (raw as Record<string, unknown>).properties;
	if (!properties || typeof properties !== 'object') {
		throw new Error('MET response missing "properties"');
	}

	const timeseriesRaw = (properties as Record<string, unknown>).timeseries;
	if (!Array.isArray(timeseriesRaw)) {
		throw new Error('MET response missing "timeseries" array');
	}

	const timeseries = timeseriesRaw
		.map((entry) => parseTimeseriesEntry(entry))
		.filter((entry): entry is Timeseries => entry !== null);

	if (!timeseries.length) {
		throw new Error('MET response contained no usable timeseries entries');
	}

	return { properties: { timeseries } };
};

function icon(symbol?: string | null): string {
	if (!symbol) return '•';
	if (symbol.includes('clearsky')) return symbol.includes('night') ? '🌙' : '☀️';
	if (symbol.includes('fair')) return '🌤️';
	if (symbol.includes('partlycloudy')) return '⛅';
	if (symbol.includes('cloudy')) return '☁️';
	if (symbol.includes('rain')) return '🌧️';
	if (symbol.includes('snow')) return '🌨️';
	if (symbol.includes('thunder')) return '⛈️';
	return '•';
}

function pickSymbol(ts: Timeseries[], dayISO: string, hour: number) {
	const rows = ts.filter((t) => t.time.startsWith(dayISO));
	if (!rows.length) return 'clearsky_day';
	let best: Timeseries | null = null;
	let bestDelta = 99;
	for (const r of rows) {
		const h = new Date(r.time).getHours();
		const d = Math.abs(h - hour);
		if (d < bestDelta) {
			bestDelta = d;
			best = r;
		}
	}
	const s = best?.data.next_1_hours?.summary?.symbol_code;
	if (s) return s;
	const alt = rows.find((r) => r.data.next_1_hours?.summary?.symbol_code);
	return alt?.data.next_1_hours?.summary?.symbol_code ?? 'clearsky_day';
}

const toISO = (d: Date) => d.toISOString().slice(0, 10);

const fetchMetForecast = async (): Promise<MetResponse> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), MET_FORECAST_TIMEOUT_MS);

	try {
		const response = await fetch(MET_FORECAST_URL, {
			signal: controller.signal,
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`MET API responded with ${response.status}`);
		}

		const payload = await response.json();
		return parseMetResponse(payload);
	} finally {
		clearTimeout(timeout);
	}
};

export const ssr = false;

type ForecastDay = {
	date: string;
	labelKey: string;
	night: string;
	morning: string;
	afternoon: string;
	evening: string;
	hi: number;
	lo: number;
	precip: number;
	wind: number;
};

export const load: PageLoad = async () => {
	try {
		const { properties } = await fetchMetForecast();
		const ts = properties.timeseries;

		const byDay = new Map<
			string,
			{ min: number; max: number; wind: number[]; precip: number[] }
		>();
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
		const tomorrow = toISO(new Date(Date.now() + 86_400_000));

		const makeDay = (dayISO: string, labelKey: string): ForecastDay | null => {
			const s = byDay.get(dayISO);
			if (!s) return null;
			const precipTotal = Math.round(s.precip.reduce((a, b) => a + b, 0));
			const windAvg =
				s.wind.length > 0 ? Math.round(s.wind.reduce((a, b) => a + b, 0) / s.wind.length) : 0;
			return {
				date: dayISO,
				labelKey,
				night: icon(pickSymbol(ts, dayISO, 0)),
				morning: icon(pickSymbol(ts, dayISO, 6)),
				afternoon: icon(pickSymbol(ts, dayISO, 12)),
				evening: icon(pickSymbol(ts, dayISO, 18)),
				hi: Math.round(s.max),
				lo: Math.round(s.min),
				precip: precipTotal,
				wind: windAvg
			};
		};

		const days = [
			makeDay(today, 'forecast.today'),
			makeDay(tomorrow, 'forecast.tomorrow')
		].filter((day): day is ForecastDay => Boolean(day));

		return { days };
	} catch (error) {
		console.error('Failed to load MET forecast', error);
		return { days: [] };
	}
};


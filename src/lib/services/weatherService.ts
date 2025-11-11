const YR_NO_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const API_HEADERS: HeadersInit = {
	'User-Agent': 'Neretva-Weather-App/1.0 (neretvalive@proton.me)'
};

export type WeatherCondition =
	| 'sunny'
	| 'partly-cloudy'
	| 'cloudy'
	| 'rainy'
	| 'snow'
	| 'storm';

export type WeatherObservation = {
	name: string;
	temp: string | null;
	weather: WeatherCondition | null;
	wind: string | null;
	lat: number;
	lon: number;
	x?: number;
	y?: number;
};

export type WeatherLocation = {
	name: string;
	lat: number;
	lon: number;
	x?: number;
	y?: number;
};

type YrNoDetails = {
	air_temperature: number;
	wind_speed: number;
	wind_from_direction: number;
};

type YrNoTimeseriesEntry = {
	time: string;
	data: {
		instant: { details: YrNoDetails };
		next_1_hours?: {
			summary?: { symbol_code?: string };
			details?: { precipitation_amount?: number };
		};
	};
};

type YrNoResponse = {
	properties: {
		timeseries: YrNoTimeseriesEntry[];
	};
};

type OpenWeatherResponse = {
	main: { temp: number };
	weather: Array<{ main: string }>;
	wind: { speed: number; deg: number };
};

const NERETVA_LOCATIONS: WeatherLocation[] = [
	{ name: 'Ploče', lat: 43.0561, lon: 17.4333 },
	{ name: 'Blace', lat: 43.45, lon: 17.95 },
	{ name: 'Opuzen', lat: 43.3, lon: 18.1 },
	{ name: 'Duba', lat: 43.3, lon: 17.7 },
	{ name: 'Komin', lat: 42.35, lon: 19.15 },
	{ name: 'Krvavac', lat: 43.45, lon: 17.9 },
	{ name: 'Kula Norinska', lat: 43.4, lon: 17.85 },
	{ name: 'Vlaka', lat: 43.45, lon: 18.0 },
	{ name: 'Mlinište', lat: 43.3, lon: 18.15 },
	{ name: 'Rogotnski Most', lat: 17.48, lon: 17.48 }
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const windDirections = [
	'N',
	'NNE',
	'NE',
	'ENE',
	'E',
	'ESE',
	'SE',
	'SSE',
	'S',
	'SSW',
	'SW',
	'WSW',
	'W',
	'WNW',
	'NW',
	'NNW'
] as const;

const weatherCodeMap: Record<string, WeatherCondition> = {
	clearsky_day: 'sunny',
	clearsky_night: 'sunny',
	fair_day: 'sunny',
	fair_night: 'sunny',
	partlycloudy_day: 'partly-cloudy',
	partlycloudy_night: 'partly-cloudy',
	cloudy: 'cloudy',
	rainshowers_day: 'rainy',
	rainshowers_night: 'rainy',
	rain: 'rainy',
	lightrain: 'rainy',
	heavyrain: 'rainy',
	heavyrainshowers_day: 'rainy',
	heavyrainshowers_night: 'rainy',
	rainshowers: 'rainy',
	drizzle: 'rainy',
	// Snow variations
	snow: 'snow',
	lightsnow: 'snow',
	heavysnow: 'snow',
	snowshowers_day: 'snow',
	snowshowers_night: 'snow',
	snowshowers: 'snow',
	snowandthunder: 'snow',
	lightsnowandthunder: 'snow',
	heavysnowandthunder: 'snow',
	sleet: 'snow',
	lightsleet: 'snow',
	heavysleet: 'snow',
	sleetshowers_day: 'snow',
	sleetshowers_night: 'snow',
	sleetshowers: 'snow',
	// Thunderstorm variations
	thunderstorm: 'storm',
	thunder: 'storm',
	thunderstormwithlightdrizzle: 'storm',
	thunderstormwithdrizzle: 'storm',
	thunderstormwithheavydrizzle: 'storm',
	thunderstormwithlightrain: 'storm',
	thunderstormwithrain: 'storm',
	thunderstormwithheavyrain: 'storm',
	thunderstormwithlightsnow: 'storm',
	thunderstormwithsnow: 'storm',
	thunderstormwithheavysnow: 'storm',
	thunderstormwithlightmixedprecipitation: 'storm',
	thunderstormwithmixedprecipitation: 'storm',
	thunderstormwithheavymixedprecipitation: 'storm',
	rainandthunder: 'storm',
	heavyrainandthunder: 'storm',
	lightsleetandthunder: 'storm',
	lightsnowshowersandthunder_day: 'storm',
	lightsnowshowersandthunder_night: 'storm',
	heavyrainshowersandthunder_day: 'storm',
	heavyrainshowersandthunder_night: 'storm',
	rainshowersandthunder_day: 'storm',
	rainshowersandthunder_night: 'storm'
};

const getWindDirection = (degrees: number): string => {
	const index = Math.round(degrees / 22.5) % windDirections.length;
	return windDirections[index];
};

const msToKnots = (ms: number): number => Math.round(ms * 1.944);

const getWeatherCondition = (code: string | undefined): WeatherCondition | null =>
	(code && weatherCodeMap[code]) || null;

const parseYrNoResponse = (raw: unknown): YrNoResponse => {
	if (!isRecord(raw)) {
		throw new Error('Unexpected MET response');
	}

	const properties = raw.properties;
	if (!isRecord(properties)) {
		throw new Error('MET response missing properties');
	}

	const timeseries = properties.timeseries;
	if (!Array.isArray(timeseries)) {
		throw new Error('MET response missing timeseries');
	}

	const entries = timeseries
		.map((entry): Record<string, unknown> | null => (isRecord(entry) ? entry : null))
		.filter((entry): entry is Record<string, unknown> => entry !== null)
		.map((entry): YrNoTimeseriesEntry | null => {
			if (typeof entry.time !== 'string') {
				return null;
			}

			if (!isRecord(entry.data)) {
				return null;
			}

			const instant = entry.data.instant;
			if (!isRecord(instant) || !isRecord(instant.details)) {
				return null;
			}

			const details = instant.details;
			const airTemperature = details.air_temperature;
			const windSpeed = details.wind_speed;
			const windDirection = details.wind_from_direction;
			if (
				!isFiniteNumber(airTemperature) ||
				!isFiniteNumber(windSpeed) ||
				!isFiniteNumber(windDirection)
			) {
				return null;
			}

			let next1Hours: YrNoTimeseriesEntry['data']['next_1_hours'];
			if (isRecord(entry.data.next_1_hours)) {
				const summaryRaw = entry.data.next_1_hours.summary;
				const detailsRaw = entry.data.next_1_hours.details;

				next1Hours = {
					summary:
						isRecord(summaryRaw) && typeof summaryRaw.symbol_code === 'string'
							? { symbol_code: summaryRaw.symbol_code }
							: undefined,
					details:
						isRecord(detailsRaw) && isFiniteNumber(detailsRaw.precipitation_amount)
							? { precipitation_amount: detailsRaw.precipitation_amount }
							: undefined
				};
			}

			return {
				time: entry.time,
				data: {
					instant: {
						details: {
							air_temperature: airTemperature,
							wind_speed: windSpeed,
							wind_from_direction: windDirection
						}
					},
					next_1_hours: next1Hours
				}
			} satisfies YrNoTimeseriesEntry;
		})
		.filter((entry): entry is YrNoTimeseriesEntry => entry !== null);

	if (!entries.length) {
		throw new Error('MET timeseries contained no usable entries');
	}

	return {
		properties: {
			timeseries: entries
		}
	};
};

const parseOpenWeatherResponse = (raw: unknown): OpenWeatherResponse => {
	if (!isRecord(raw)) {
		throw new Error('OpenWeatherMap response was malformed');
	}

	const main = raw.main;
	const weather = raw.weather;
	const wind = raw.wind;

	if (!isRecord(main) || !isFiniteNumber(main.temp)) {
		throw new Error('OpenWeatherMap response missing temperature');
	}

	if (!Array.isArray(weather) || weather.length === 0) {
		throw new Error('OpenWeatherMap response missing weather summary');
	}

	const firstWeather = weather[0];
	if (!isRecord(firstWeather) || typeof firstWeather.main !== 'string') {
		throw new Error('OpenWeatherMap weather summary malformed');
	}

	if (!isRecord(wind) || !isFiniteNumber(wind.speed) || !isFiniteNumber(wind.deg)) {
		throw new Error('OpenWeatherMap wind data malformed');
	}

	return {
		main: { temp: main.temp },
		weather: [{ main: firstWeather.main }],
		wind: { speed: wind.speed, deg: wind.deg }
	};
};

const createEmptyObservation = (location: WeatherLocation): WeatherObservation => ({
	name: location.name,
	temp: null,
	weather: null,
	wind: null,
	lat: location.lat,
	lon: location.lon,
	x: location.x,
	y: location.y
});

const formatTempRange = (a: number, b?: number): string => {
	const min = Math.round(Math.min(a, b ?? a));
	const max = Math.round(Math.max(a, b ?? a));
	return min === max ? `${min}°` : `${min}°–${max}°`;
};

const fetchYrNoWeather = async (location: WeatherLocation): Promise<WeatherObservation> => {
	try {
		const response = await fetch(`${YR_NO_BASE_URL}?lat=${location.lat}&lon=${location.lon}`, {
			headers: API_HEADERS
		});

		if (!response.ok) {
			throw new Error(`MET API responded with ${response.status}`);
		}

		const data = parseYrNoResponse(await response.json());
		const [current, next] = data.properties.timeseries;
		const condition = getWeatherCondition(
			current?.data.next_1_hours?.summary?.symbol_code ??
				next?.data.next_1_hours?.summary?.symbol_code
		);

		const details = current?.data.instant.details;
		const nextDetails = next?.data.instant.details;

		if (!details) {
			return createEmptyObservation(location);
		}

		const windDirection = getWindDirection(details.wind_from_direction);
		const windSpeedKnots = msToKnots(details.wind_speed);

		return {
			name: location.name,
			temp: formatTempRange(details.air_temperature, nextDetails?.air_temperature),
			weather: condition,
			wind: `${windDirection} ${windSpeedKnots}kt`,
			lat: location.lat,
			lon: location.lon,
			x: location.x,
			y: location.y
		};
	} catch (error) {
		console.error(`Error fetching MET weather for ${location.name}`, error);
		return createEmptyObservation(location);
	}
};

const fetchOpenWeatherMap = async (
	location: WeatherLocation,
	apiKey: string
): Promise<WeatherObservation> => {
	try {
		const response = await fetch(
			`${OPENWEATHER_BASE_URL}?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
		);

		if (!response.ok) {
			throw new Error(`OpenWeatherMap responded with ${response.status}`);
		}

		const data = parseOpenWeatherResponse(await response.json());
		const windDirection = getWindDirection(data.wind.deg);
		const windSpeedKnots = msToKnots(data.wind.speed);

		return {
			name: location.name,
			temp: `${Math.round(data.main.temp)}°`,
			weather: getWeatherCondition(data.weather[0].main.toLowerCase()),
			wind: `${windDirection} ${windSpeedKnots}kt`,
			lat: location.lat,
			lon: location.lon,
			x: location.x,
			y: location.y
		};
	} catch (error) {
		console.error(`Error fetching OpenWeatherMap data for ${location.name}`, error);
		return createEmptyObservation(location);
	}
};

export const fetchAllWeatherData = async (
	useOpenWeather = false,
	apiKey: string | null = null
): Promise<WeatherObservation[]> => {
	const locations = [...NERETVA_LOCATIONS];

	if (useOpenWeather && !apiKey) {
		console.warn('OpenWeatherMap API key not provided, falling back to MET');
		useOpenWeather = false;
	}

	const fetchers = locations.map((location) =>
		useOpenWeather && apiKey ? fetchOpenWeatherMap(location, apiKey) : fetchYrNoWeather(location)
	);

	const weatherData = await Promise.all(fetchers);

	return weatherData.filter(
		(entry) => entry.temp !== null || entry.weather !== null || entry.wind !== null
	);
};

export type ForecastPeriod = {
	icon: string | null;
	temp: number | null;
};

export type ForecastEntry = {
	date: string;
	night: ForecastPeriod;
	morning: ForecastPeriod;
	afternoon: ForecastPeriod;
	evening: ForecastPeriod;
	tempHigh: number | null;
	tempLow: number | null;
	precipitationMm: number | null;
	windMs: number | null;
};

const formatDateLabel = (date: Date, dayOffset: number): string => {
	const formatted = date.toLocaleString('en', { day: 'numeric', month: 'short' });
	if (dayOffset === 0) return `Today ${formatted}`;
	if (dayOffset === 1) {
		return `${date.toLocaleString('en', { weekday: 'long' })} ${formatted}`;
	}
	return `${date.toLocaleString('en', { weekday: 'long' })} ${formatted}`;
};

const findDataForTime = (
	timeSeries: YrNoTimeseriesEntry[],
	targetDate: Date,
	hour: number
): YrNoTimeseriesEntry['data'] | null => {
	const target = new Date(targetDate);
	target.setHours(hour, 0, 0, 0);

	let candidate: YrNoTimeseriesEntry['data'] | null = null;
	let smallestDiff = Number.POSITIVE_INFINITY;

	for (const entry of timeSeries) {
		const entryTime = new Date(entry.time);
		const diff = Math.abs(entryTime.getTime() - target.getTime());
		if (diff < smallestDiff) {
			smallestDiff = diff;
			candidate = entry.data;
		}
	}

	return candidate;
};

const getWeatherSymbol = (
	data: YrNoTimeseriesEntry['data'] | null,
	isNight: boolean
): string | null => {
	const symbol = data?.next_1_hours?.summary?.symbol_code;
	if (!symbol) return null;
	return isNight ? symbol.replace('_day', '_night') : symbol.replace('_night', '_day');
};

const calculateDayPrecipitation = (
	timeSeries: YrNoTimeseriesEntry[],
	date: Date
): number | null => {
	if (!timeSeries.length) return null;

	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const end = new Date(date);
	end.setHours(23, 59, 59, 999);

	let total = 0;
	let hasData = false;

	for (const entry of timeSeries) {
		const entryTime = new Date(entry.time);
		if (entryTime >= start && entryTime <= end) {
			const amount = entry.data.next_1_hours?.details?.precipitation_amount;
			if (isFiniteNumber(amount)) {
				total += amount;
				hasData = true;
			}
		}
	}

	return hasData ? Math.round(total * 10) / 10 : null;
};

export const fetchNeretvaForecast = async (): Promise<ForecastEntry[]> => {
	try {
		const lat = 43.33;
		const lon = 17.88;

		const response = await fetch(`${YR_NO_BASE_URL}?lat=${lat}&lon=${lon}`, {
			headers: API_HEADERS
		});

		if (!response.ok) {
			throw new Error(`MET API responded with ${response.status}`);
		}

		const data = parseYrNoResponse(await response.json());
		const timeSeries = data.properties.timeseries;

		const today = new Date();
		const forecast: ForecastEntry[] = [];

		for (let dayOffset = 0; dayOffset < 9; dayOffset += 1) {
			const targetDate = new Date(today);
			targetDate.setDate(today.getDate() + dayOffset);

			const night = findDataForTime(timeSeries, targetDate, 2);
			const morning = findDataForTime(timeSeries, targetDate, 8);
			const afternoon = findDataForTime(timeSeries, targetDate, 14);
			const evening = findDataForTime(timeSeries, targetDate, 20);

			const hourlyTemps: number[] = [];
			for (let hour = 0; hour < 24; hour += 1) {
				const record = findDataForTime(timeSeries, targetDate, hour);
				const temp = record?.instant.details.air_temperature;
				if (isFiniteNumber(temp)) {
					hourlyTemps.push(temp);
				}
			}

			const tempHigh = hourlyTemps.length > 0 ? Math.round(Math.max(...hourlyTemps)) : null;
			const tempLow = hourlyTemps.length > 0 ? Math.round(Math.min(...hourlyTemps)) : null;

			const precipitationMm = calculateDayPrecipitation(timeSeries, targetDate);
			const windMs = afternoon ? Math.round(afternoon.instant.details.wind_speed) : null;

			forecast.push({
				date: formatDateLabel(targetDate, dayOffset),
				night: {
					icon: getWeatherSymbol(night, true),
					temp: night ? Math.round(night.instant.details.air_temperature) : null
				},
				morning: {
					icon: getWeatherSymbol(morning, false),
					temp: morning ? Math.round(morning.instant.details.air_temperature) : null
				},
				afternoon: {
					icon: getWeatherSymbol(afternoon, false),
					temp: afternoon ? Math.round(afternoon.instant.details.air_temperature) : null
				},
				evening: {
					icon: getWeatherSymbol(evening, true),
					temp: evening ? Math.round(evening.instant.details.air_temperature) : null
				},
				tempHigh,
				tempLow,
				precipitationMm,
				windMs
			});
		}

		return forecast;
	} catch (error) {
		console.error('Error fetching Neretva forecast', error);
		return [];
	}
};

export { NERETVA_LOCATIONS };

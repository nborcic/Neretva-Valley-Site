import { env } from '$env/dynamic/private';

type Coordinates = { lat: number; lon: number };

const FALLBACK_COORDINATES: Coordinates = { lat: 43.05, lon: 17.6 };
const FALLBACK_USER_AGENT = 'Neretva-Weather-App/1.0 (neretvalive@proton.me)';
const FALLBACK_MAX_ATTEMPTS = 3;
const FALLBACK_TIMEOUT_MS = 7000;
const FALLBACK_CACHE_TTL_SECONDS = 15 * 60;
const FALLBACK_CACHE_SECONDS = 5 * 60;
const FALLBACK_CACHE_SWR_SECONDS = 15 * 60;
const FALLBACK_API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

const toNumber = (value: string | undefined, fallback: number, options?: { min?: number; max?: number; integer?: boolean; label: string }): number => {
	if (!value) return fallback;
	const parsed = options?.integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
	if (!Number.isFinite(parsed)) {
		throw new Error(`Invalid ${options?.label ?? 'numeric'} value provided via environment variable.`);
	}
	if (options?.min !== undefined && parsed < options.min) {
		throw new Error(`${options.label} must be >= ${options.min}.`);
	}
	if (options?.max !== undefined && parsed > options.max) {
		throw new Error(`${options.label} must be <= ${options.max}.`);
	}
	return parsed;
};

const toCoordinates = (): Coordinates => {
	const lat = toNumber(env.MET_LAT, FALLBACK_COORDINATES.lat, { label: 'MET_LAT', min: -90, max: 90 });
	const lon = toNumber(env.MET_LON, FALLBACK_COORDINATES.lon, { label: 'MET_LON', min: -180, max: 180 });
	return { lat, lon };
};

const sanitizeString = (value: string | undefined, fallback: string, label: string): string => {
	if (!value) return fallback;
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(`${label} cannot be empty.`);
	}
	return trimmed;
};

export const MET_FORECAST_COORDINATES = toCoordinates();
const apiBaseUrl = sanitizeString(env.MET_API_BASE_URL, FALLBACK_API_BASE_URL, 'MET_API_BASE_URL');

export const MET_FORECAST_URL = `${apiBaseUrl}?lat=${MET_FORECAST_COORDINATES.lat}&lon=${MET_FORECAST_COORDINATES.lon}`;
export const MET_FORECAST_USER_AGENT = sanitizeString(env.MET_USER_AGENT, FALLBACK_USER_AGENT, 'MET_USER_AGENT');
export const MET_FORECAST_MAX_ATTEMPTS = toNumber(env.MET_MAX_ATTEMPTS, FALLBACK_MAX_ATTEMPTS, {
	label: 'MET_MAX_ATTEMPTS',
	min: 1,
	max: 10,
	integer: true
});
export const MET_FORECAST_TIMEOUT_MS = toNumber(env.MET_TIMEOUT_MS, FALLBACK_TIMEOUT_MS, {
	label: 'MET_TIMEOUT_MS',
	min: 1000,
	max: 60000
});
export const MET_FORECAST_CACHE_TTL_MS =
	toNumber(env.MET_CACHE_TTL_SECONDS, FALLBACK_CACHE_TTL_SECONDS, {
		label: 'MET_CACHE_TTL_SECONDS',
		min: 60,
		max: 24 * 60 * 60,
		integer: true
	}) * 1000;
export const MET_FORECAST_CACHE_SECONDS = toNumber(env.MET_CACHE_SECONDS, FALLBACK_CACHE_SECONDS, {
	label: 'MET_CACHE_SECONDS',
	min: 30,
	max: 24 * 60 * 60,
	integer: true
});
export const MET_FORECAST_CACHE_SWR_SECONDS = toNumber(
	env.MET_CACHE_SWR_SECONDS,
	FALLBACK_CACHE_SWR_SECONDS,
	{
		label: 'MET_CACHE_SWR_SECONDS',
		min: 60,
		max: 24 * 60 * 60,
		integer: true
	}
);



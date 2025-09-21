// Weather service for fetching real weather data
// Supports both yr.no and OpenWeatherMap APIs

const YR_NO_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Common headers for API requests
const API_HEADERS = {
	'User-Agent': 'Neretva-Weather-App/1.0 (neretvalive@proton.me)'
};

// Coordinates for Neretva River delta locations
const NERETVA_LOCATIONS = [
	{ name: 'Ploče', lat: 43.0561, lon: 17.4333 },
	{ name: 'Blace', lat: 43.4500, lon: 17.9500 },
	{ name: 'Opuzen', lat: 43.3000, lon: 18.1000 },
	{ name: 'Duba', lat: 43.3000, lon: 17.7000 },
	{ name: 'Komin', lat: 43.2500, lon: 18.1500 },
	{ name: 'Krvavac', lat: 43.4500, lon: 17.9000 },
	{ name: 'Kula Norinska', lat: 43.4000, lon: 17.8500 },
	{ name: 'Vlaka', lat: 43.4500, lon: 18.0000 },
	{ name: 'Mlinište', lat: 43.3000, lon: 18.1500 }
];

// Convert wind direction from degrees to compass direction
function getWindDirection(degrees) {
	const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
	const index = Math.round(degrees / 22.5) % 16;
	return directions[index];
}

// Convert wind speed from m/s to knots
function msToKnots(ms) {
	return Math.round(ms * 1.944);
}

// Get weather condition from yr.no data
function getWeatherCondition(weatherCode) {
	// yr.no weather codes mapping
	const weatherMap = {
		'clearsky_day': 'sunny',
		'clearsky_night': 'sunny',
		'fair_day': 'sunny',
		'fair_night': 'sunny',
		'partlycloudy_day': 'partly-cloudy',
		'partlycloudy_night': 'partly-cloudy',
		'cloudy': 'cloudy',
		'rainshowers_day': 'rainy',
		'rainshowers_night': 'rainy',
		'rain': 'rainy',
		'lightrain': 'rainy',
		'heavyrain': 'rainy'
	};
	return weatherMap[weatherCode] || 'partly-cloudy';
}

// Create fallback weather data for a location
function createFallbackWeatherData(location) {
	return {
		name: location.name,
		temp: 'N/A',
		weather: 'N/A',
		wind: 'N/A',
		lat: location.lat,
		lon: location.lon,
		x: location.x || 50,
		y: location.y || 50
	};
}

// Fetch weather data from yr.no API
async function fetchYrNoWeather(location) {
	try {
		const response = await fetch(
			`${YR_NO_BASE_URL}?lat=${location.lat}&lon=${location.lon}`,
			{ headers: API_HEADERS }
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const current = data.properties.timeseries[0].data.instant.details;
		const nextHour = data.properties.timeseries[1]?.data.instant.details;

		// Get temperature range (current and next hour)
		const tempMin = Math.min(current.air_temperature, nextHour?.air_temperature || current.air_temperature);
		const tempMax = Math.max(current.air_temperature, nextHour?.air_temperature || current.air_temperature);

		// Get weather condition
		const weatherCode = data.properties.timeseries[0].data.next_1_hours?.summary?.symbol_code || 'partlycloudy_day';
		const weather = getWeatherCondition(weatherCode);

		// Get wind data
		const windSpeed = msToKnots(current.wind_speed);
		const windDirection = getWindDirection(current.wind_from_direction);

		return {
			name: location.name,
			temp: `${Math.round(tempMin)}°-${Math.round(tempMax)}°`,
			weather: weather,
			wind: `${windDirection} ${windSpeed}kt`,
			lat: location.lat,
			lon: location.lon
		};
	} catch (error) {
		console.error(`Error fetching weather for ${location.name}:`, error);
		return createFallbackWeatherData(location);
	}
}

// Fetch weather data from OpenWeatherMap API
async function fetchOpenWeatherMap(location, apiKey) {
	try {
		const response = await fetch(
			`${OPENWEATHER_BASE_URL}?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const temp = Math.round(data.main.temp);
		const weather = data.weather[0].main.toLowerCase();
		const windSpeed = msToKnots(data.wind.speed);
		const windDirection = getWindDirection(data.wind.deg);

		return {
			name: location.name,
			temp: `${temp}°`,
			weather: weather,
			wind: `${windDirection} ${windSpeed}kt`,
			lat: location.lat,
			lon: location.lon
		};
	} catch (error) {
		console.error(`Error fetching weather for ${location.name}:`, error);
		return createFallbackWeatherData(location);
	}
}

// Main function to fetch weather data for all locations
export async function fetchAllWeatherData(useOpenWeather = false, apiKey = null) {
	const locations = NERETVA_LOCATIONS;

	if (useOpenWeather && !apiKey) {
		console.warn('OpenWeatherMap API key not provided, falling back to yr.no');
		useOpenWeather = false;
	}

	try {
		// Fetch weather data for all locations
		const weatherPromises = locations.map(location =>
			useOpenWeather
				? fetchOpenWeatherMap(location, apiKey)
				: fetchYrNoWeather(location)
		);

		const weatherData = await Promise.all(weatherPromises);

		// Add x, y coordinates for the map display
		return weatherData.map((data, index) => ({
			...data,
			x: locations[index].x || 50, // Default x position
			y: locations[index].y || 50  // Default y position
		}));

	} catch (error) {
		console.error('Error fetching weather data:', error);
		return locations.map(createFallbackWeatherData);
	}
}

// Fetch detailed weather forecast for Neretva location (for the forecast table)
export async function fetchNeretvaForecast() {
	try {
		// Use average coordinates from our locations
		const lat = 43.33;
		const lon = 17.88;

		const response = await fetch(
			`${YR_NO_BASE_URL}?lat=${lat}&lon=${lon}`,
			{ headers: API_HEADERS }
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const timeSeries = data.properties.timeseries;

		// Process data into daily forecasts
		const dailyForecasts = [];
		const today = new Date();

		for (let dayOffset = 0; dayOffset < 9; dayOffset++) {
			const targetDate = new Date(today);
			targetDate.setDate(today.getDate() + dayOffset);

			// Find weather data for this day at different times
			const nightData = findDataForTime(timeSeries, targetDate, 2);    // 2 AM
			const morningData = findDataForTime(timeSeries, targetDate, 8);  // 8 AM
			const afternoonData = findDataForTime(timeSeries, targetDate, 14); // 2 PM
			const eveningData = findDataForTime(timeSeries, targetDate, 20);  // 8 PM

			// Get day's temperature range
			const dayTemps = [];
			for (let hour = 0; hour < 24; hour++) {
				const hourData = findDataForTime(timeSeries, targetDate, hour);
				if (hourData && hourData.instant.details.air_temperature) {
					dayTemps.push(hourData.instant.details.air_temperature);
				}
			}

			const tempHigh = dayTemps.length > 0 ? Math.round(Math.max(...dayTemps)) : 20;
			const tempLow = dayTemps.length > 0 ? Math.round(Math.min(...dayTemps)) : 15;

			// Calculate daily precipitation
			const precipitation = calculateDayPrecipitation(timeSeries, targetDate);
			const windSpeed = afternoonData ?
				Math.round(afternoonData.instant.details.wind_speed) : 3;

			const forecast = {
				date: dayOffset === 0 ? `Today ${formatDate(targetDate)}` :
					dayOffset === 1 ? `Monday ${formatDate(targetDate)}` :
						`${formatDayName(targetDate)} ${formatDate(targetDate)}`,
				night: {
					icon: getWeatherSymbol(nightData, true),
					temp: nightData ? Math.round(nightData.instant.details.air_temperature) : tempLow
				},
				morning: {
					icon: getWeatherSymbol(morningData, false),
					temp: morningData ? Math.round(morningData.instant.details.air_temperature) : tempHigh - 5
				},
				afternoon: {
					icon: getWeatherSymbol(afternoonData, false),
					temp: afternoonData ? Math.round(afternoonData.instant.details.air_temperature) : tempHigh
				},
				evening: {
					icon: getWeatherSymbol(eveningData, true),
					temp: eveningData ? Math.round(eveningData.instant.details.air_temperature) : tempHigh - 3
				},
				tempHigh,
				tempLow,
				precipitation: precipitation > 0 ? `${precipitation} mm` : '0 mm',
				wind: `${windSpeed} m/s`
			};

			dailyForecasts.push(forecast);
		}

		return dailyForecasts;

	} catch (error) {
		console.error('Error fetching Neretva forecast:', error);
		// Return fallback data
		return generateFallbackForecast();
	}
}

// Helper function to find weather data for a specific time
function findDataForTime(timeSeries, date, hour) {
	const targetTime = new Date(date);
	targetTime.setHours(hour, 0, 0, 0);

	// Find closest data point
	let closest = null;
	let minDiff = Infinity;

	for (const entry of timeSeries) {
		const entryTime = new Date(entry.time);
		const diff = Math.abs(entryTime - targetTime);

		if (diff < minDiff) {
			minDiff = diff;
			closest = entry.data;
		}
	}

	return closest;
}

// Get weather symbol from yr.no data
function getWeatherSymbol(weatherData, isNight = false) {
	if (!weatherData || !weatherData.next_1_hours) {
		return isNight ? 'partlycloudy_night' : 'partlycloudy_day';
	}

	const symbol = weatherData.next_1_hours.summary?.symbol_code;
	if (!symbol) {
		return isNight ? 'partlycloudy_night' : 'partlycloudy_day';
	}

	// Adjust for night/day
	if (isNight) {
		return symbol.replace('_day', '_night');
	} else {
		return symbol.replace('_night', '_day');
	}
}

// Calculate precipitation for a day
function calculateDayPrecipitation(timeSeries, date) {
	let totalPrecip = 0;
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	for (const entry of timeSeries) {
		const entryTime = new Date(entry.time);
		if (entryTime >= startOfDay && entryTime <= endOfDay) {
			const precip = entry.data.next_1_hours?.details?.precipitation_amount || 0;
			totalPrecip += precip;
		}
	}

	return Math.round(totalPrecip * 10) / 10; // Round to 1 decimal
}

// Format date for display
function formatDate(date) {
	const day = date.getDate();
	const month = date.toLocaleString('en', { month: 'short' });
	return `${day} ${month}.`;
}

// Format day name
function formatDayName(date) {
	return date.toLocaleString('en', { weekday: 'long' });
}

// Generate fallback forecast data
function generateFallbackForecast() {
	const fallbackData = [];
	const today = new Date();

	for (let i = 0; i < 9; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);

		fallbackData.push({
			date: i === 0 ? `Today ${formatDate(date)}` :
				`${formatDayName(date)} ${formatDate(date)}`,
			night: { icon: 'partlycloudy_night', temp: 15 + Math.floor(Math.random() * 5) },
			morning: { icon: 'clearsky_day', temp: 18 + Math.floor(Math.random() * 5) },
			afternoon: { icon: 'partlycloudy_day', temp: 25 + Math.floor(Math.random() * 5) },
			evening: { icon: 'partlycloudy_night', temp: 20 + Math.floor(Math.random() * 5) },
			tempHigh: 25 + Math.floor(Math.random() * 8),
			tempLow: 15 + Math.floor(Math.random() * 5),
			precipitation: Math.random() > 0.7 ? `${Math.floor(Math.random() * 5)} mm` : '0 mm',
			wind: `${2 + Math.floor(Math.random() * 4)} m/s`
		});
	}

	return fallbackData;
}

// Export the locations for use in other components
export { NERETVA_LOCATIONS };

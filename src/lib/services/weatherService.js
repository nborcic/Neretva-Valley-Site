// Weather service for fetching real weather data
// Supports both yr.no and OpenWeatherMap APIs

const YR_NO_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Coordinates for Neretva River delta locations
const NERETVA_LOCATIONS = [
	// Coastal/Delta towns
	{ name: 'Ploče', lat: 43.0561, lon: 17.4333 },
	{ name: 'Klek', lat: 43.1000, lon: 17.5000 },
	{ name: 'Komarna', lat: 43.1500, lon: 17.5500 },
	{ name: 'Raba', lat: 43.2000, lon: 17.6000 },
	{ name: 'Kremena', lat: 43.2500, lon: 17.6500 },
	{ name: 'Duba', lat: 43.3000, lon: 17.7000 },
	{ name: 'Tuštevac', lat: 43.3500, lon: 17.7500 },
	{ name: 'Mihalj', lat: 43.4000, lon: 17.8000 },
	{ name: 'Otok', lat: 43.4500, lon: 17.8500 },
	{ name: 'Trn', lat: 43.5000, lon: 17.9000 },
	{ name: 'Blace', lat: 43.4500, lon: 17.9500 },
	{ name: 'Pržinovac', lat: 43.4000, lon: 18.0000 },
	{ name: 'Ušće', lat: 43.3500, lon: 18.0500 },
	{ name: 'Opuzen', lat: 43.3000, lon: 18.1000 },
	{ name: 'Komin', lat: 43.2500, lon: 18.1500 },
	{ name: 'Rogotin', lat: 43.2000, lon: 18.2000 },
	
	// Inland towns
	{ name: 'Metković', lat: 43.3500, lon: 17.8000 },
	{ name: 'Kula Norinska', lat: 43.4000, lon: 17.8500 },
	{ name: 'Krvavac', lat: 43.4500, lon: 17.9000 },
	{ name: 'Buk Vlaka', lat: 43.5000, lon: 17.9500 },
	{ name: 'Vlaka', lat: 43.4500, lon: 18.0000 },
	{ name: 'Podgradina', lat: 43.4000, lon: 18.0500 },
	{ name: 'Plodine', lat: 43.3500, lon: 18.1000 },
	{ name: 'Mlinište', lat: 43.3000, lon: 18.1500 },
	{ name: 'Mislina', lat: 43.2500, lon: 18.2000 },
	{ name: 'Slivno Ravno', lat: 43.2000, lon: 18.2500 },
	{ name: 'Zavala', lat: 43.1500, lon: 18.3000 },
	
	// Upstream towns
	{ name: 'Šarić Struga', lat: 43.5000, lon: 17.7000 },
	{ name: 'Banja', lat: 43.5500, lon: 17.7500 },
	{ name: 'Strimen', lat: 43.5000, lon: 17.8000 },
	{ name: 'Desne', lat: 43.4500, lon: 17.8500 },
	{ name: 'Podrujnica', lat: 43.4000, lon: 17.9000 },
	{ name: 'Momići', lat: 43.3500, lon: 17.9500 }
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

// Fetch weather data from yr.no API
async function fetchYrNoWeather(location) {
	try {
		const response = await fetch(
			`${YR_NO_BASE_URL}?lat=${location.lat}&lon=${location.lon}`,
			{
				headers: {
					'User-Agent': 'Neretva-Weather-App/1.0 (contact@example.com)'
				}
			}
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
		// Return fallback data
		return {
			name: location.name,
			temp: 'N/A',
			weather: 'partly-cloudy',
			wind: 'N/A',
			lat: location.lat,
			lon: location.lon
		};
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
		return {
			name: location.name,
			temp: 'N/A',
			weather: 'partly-cloudy',
			wind: 'N/A',
			lat: location.lat,
			lon: location.lon
		};
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
		// Return fallback data
		return locations.map(location => ({
			name: location.name,
			temp: 'N/A',
			weather: 'partly-cloudy',
			wind: 'N/A',
			lat: location.lat,
			lon: location.lon,
			x: 50,
			y: 50
		}));
	}
}

// Export the locations for use in other components
export { NERETVA_LOCATIONS };

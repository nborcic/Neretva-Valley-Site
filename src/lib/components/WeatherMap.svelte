<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { fetchAllWeatherData, type WeatherObservation } from '$lib/services/weatherService';
	import { t } from '$lib/i18n-lib';
	import type * as Leaflet from 'leaflet';

	type WeatherMapObservation = WeatherObservation & { lng: number };

	let mapContainer: HTMLElement;
	let map: Leaflet.Map | null = null;
	let L: typeof Leaflet | null = null;
	let weatherData: WeatherMapObservation[] = [];
	let loading = true;
	let error: string | null = null;
	let markers: Leaflet.Marker[] = [];

	// Real coordinates for Croatian Neretva Delta locations
	const locationCoordinates = {
		Ploče: [43.056155, 17.431662],
		Blace: [43.000538, 17.481634],
		Opuzen: [43.017655, 17.562971],
		Duba: [42.978508, 17.493366],
		Komin: [43.041829, 17.535853],
		Krvavac: [43.026761, 17.589574],
		'Kula Norinska': [43.030123, 17.604122],
		Vlaka: [43.002431, 17.532172],
		Mlinište: [42.992633, 17.61619],
		'Rogotinski Most': [43.039721, 17.48462]
	};

	function getCoordinates(locationName: string): [number, number] {
		const coordinates = locationCoordinates[locationName];
		if (!coordinates) {
			console.warn(`No coordinates found for location: ${locationName}, using default`);
			return [43.05, 17.55]; // Default to Ploče area
		}
		return coordinates;
	}

	async function loadWeatherData() {
		try {
			loading = true;
			error = null;

			const data = await fetchAllWeatherData(false);

			weatherData = data
				.map((location) => {
					const coordinates = getCoordinates(location.name);
					const [latitude, longitude] = coordinates;
					return {
						...location,
						lat: latitude,
						lon: longitude,
						lng: longitude
					};
				})
				.filter(
					(location) =>
						location.temp !== null || location.weather !== null || location.wind !== null
				);

			if (map && L) {
				updateMapMarkers();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Error loading weather data:', err);
		} finally {
			loading = false;
		}
	}


	function getWeatherIcon(weather: WeatherObservation['weather']): string {
		if (!weather) {
			return '';
		}
		switch (weather) {
			case 'sunny':
				return '☀️';
			case 'partly-cloudy':
				return '⛅';
			case 'cloudy':
				return '☁️';
			case 'rainy':
				return '🌧️';
			case 'snow':
				return '❄️';
			case 'storm':
				return '⛈️';
			default:
				return '🌤️';
		}
	}

	function getWeatherColor(weather: WeatherObservation['weather']): string {
		/* switch (weather) {
			case 'sunny':
				return 'transparent';
			case 'partly-cloudy':
				return 'transparent';
			case 'cloudy':
				return 'transparent';
			case 'rainy':
				return 'transparent';
			case 'snow':
				return 'transparent';
			case 'storm':
				return 'transparent';
			default:
				return 'transparent';
		} */
		return 'transparent';
	}

	function updateMapMarkers() {
		if (!map || !L || !weatherData.length) return;

		markers.forEach((marker) => map.removeLayer(marker));
		markers = [];

		weatherData.forEach((city) => {
			const icon = L.divIcon({
				html: `
					<div class="weather-marker" style="
						background-color: ${getWeatherColor(city.weather)};
						border-radius: 50%;
						width: 40px;
						height: 40px;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						box-shadow: 0 2px 6px rgba(0,0,0,0.3);
						font-size: 10px;
						color: white;
						font-weight: bold;
					">
						<div style="font-size: 16px;">${getWeatherIcon(city.weather) || '—'}</div>
						<div style="font-size: 8px; margin-top: -2px; line-height: 1;">${city.name}</div>
						<div style="font-size: 10px;">${city.temp ?? '—'}</div>
					</div>
				`,
				className: 'weather-marker-container',
				iconSize: [40, 40],
				iconAnchor: [20, 30]
			});

			const marker = L.marker([city.lat, city.lng], { icon }).bindPopup(`
					<div style="text-align: center; padding: 8px;">
						<h3 style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">${city.name}</h3>
						<div style="font-size: 24px; margin: 8px 0;">${getWeatherIcon(city.weather) || '—'}</div>
						<p style="margin: 4px 0; color: #374151;"><strong>Temperature:</strong> ${city.temp ?? 'Unavailable'}</p>
						<p style="margin: 4px 0; color: #374151;"><strong>Weather:</strong> ${getWeatherDescription(city.weather)}</p>
						<p style="margin: 4px 0; color: #374151;"><strong>Wind:</strong> ${city.wind ?? 'Unavailable'}</p>
					</div>
				`);

			marker.addTo(map);
			markers.push(marker);
		});
	}

	async function initializeMap() {
		if (!browser || !mapContainer) return;

		try {
			L = (await import('leaflet')) as typeof Leaflet;

			map = L.map(mapContainer, {
				center: [43.02, 17.52], // Ploče area
				zoom: 12,
				zoomControl: true,
				attributionControl: true
			});

			// Add OpenStreetMap tiles (free)
			//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			//		attribution:
			//		'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			//		maxZoom: 18
			//	}).addTo(map);

			//Alternative tile layer options (commented out):
			//Satellite imagery from Esri (free)
			L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					attribution:
						'© Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				}
			).addTo(map);

			// Topographic map
			// L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			// 	attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
			// }).addTo(map);

			await loadWeatherData();
		} catch (err) {
			console.error('Error initializing map:', err);
			error = 'Failed to initialize map';
		}
	}

	function getWeatherDescription(weather: WeatherObservation['weather']): string {
		if (!weather) return 'Unavailable';
		switch (weather) {
			case 'sunny':
				return 'Sunny';
			case 'partly-cloudy':
				return 'Partly Cloudy';
			case 'cloudy':
				return 'Cloudy';
			case 'rainy':
				return 'Rainy';
			case 'snow':
				return 'Snow';
			case 'storm':
				return 'Storm';
			default:
				return 'Unknown';
		}
	}

	onMount(async () => {
		if (browser) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
			link.crossOrigin = '';
			document.head.appendChild(link);

			link.onload = () => {
				initializeMap();
			};
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="w-full rounded-lg bg-white p-4 shadow-md">
	<div class="relative h-96 w-full">
		<!-- Loading / Error state overlay -->
		{#if loading || error}
			<div class="absolute inset-0 z-[50] flex items-center justify-center rounded-lg bg-white/90">
				<div class="text-center">
					<div
						class="mx-auto mb-2 h-8 w-8 rounded-full border-b-2 border-blue-600"
						class:animate-spin={loading}
					></div>
					{#if loading}
						<p class="text-gray-600">{$t('map.loading')}</p>
					{/if}
					{#if error}
						<p class="mt-2 text-sm text-red-600">{$t('map.fetch_failed')}</p>
						<button
							on:click={loadWeatherData}
							class="mt-3 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							{$t('map.retry')}
						</button>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Map container -->
		<div
			bind:this={mapContainer}
			class="leaflet-container h-full w-full overflow-hidden rounded-lg"
			class:opacity-50={loading}
		></div>
	</div>
</div>

<style>
	:global(.weather-marker-container) {
		background: transparent !important;
		border: none !important;
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
	}

	:global(.leaflet-popup-tip) {
		background: white;
	}

	:global(.leaflet-control-attribution) {
		font-size: 10px;
	}
</style>

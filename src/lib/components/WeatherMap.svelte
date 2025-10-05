<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { fetchAllWeatherData } from '$lib/services/weatherService.js';

	let mapContainer: HTMLElement;
	let map: any;
	let L: any;
	let weatherData = [];
	let loading = true;
	let error = null;
	let markers: any[] = [];

	// Real coordinates for Croatian Neretva Delta locations
	const locationCoordinates = {
		Ploče: [43.0533, 17.4319],
		Blace: [43.1167, 17.6833],
		Opuzen: [43.0267, 17.5647],
		Duba: [43.075, 17.55],
		Komin: [43.02, 17.54],
		Krvavac: [43.11, 17.67],
		'Kula Norinska': [43.09, 17.62],
		Vlaka: [43.105, 17.665],
		Mlinište: [43.015, 17.535]
	};

	// Function to get coordinates for a location
	function getCoordinates(locationName: string): [number, number] {
		return locationCoordinates[locationName] || [43.05, 17.55]; // Default to Ploče area
	}

	// Load weather data
	async function loadWeatherData() {
		try {
			loading = true;
			error = null;

			// Try yr.no first (free, no API key needed)
			const data = await fetchAllWeatherData(false);

			// Merge with real coordinates
			weatherData = data.map((location) => {
				const coordinates = getCoordinates(location.name);
				return {
					...location,
					lat: coordinates[0],
					lng: coordinates[1]
				};
			});

			// Update map markers if map exists
			if (map && L) {
				updateMapMarkers();
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading weather data:', err);
		} finally {
			loading = false;
		}
	}

	// Function to get weather icon
	function getWeatherIcon(weather: string): string {
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

	// Function to get weather color
	function getWeatherColor(weather: string): string {
		switch (weather) {
			case 'sunny':
				return '#fbbf24';
			case 'partly-cloudy':
				return '#94a3b8';
			case 'cloudy':
				return '#6b7280';
			case 'rainy':
				return '#3b82f6';
			case 'snow':
				return '#e5e7eb';
			case 'storm':
				return '#7c3aed';
			default:
				return '#10b981';
		}
	}

	// Function to update map markers
	function updateMapMarkers() {
		if (!map || !L || !weatherData.length) return;

		// Clear existing markers
		markers.forEach((marker) => map.removeLayer(marker));
		markers = [];

		// Add new markers
		weatherData.forEach((city) => {
			const icon = L.divIcon({
				html: `
					<div class="weather-marker" style="
						background-color: ${getWeatherColor(city.weather)};
						border: 2px solid white;
						border-radius: 50%;
						width: 40px;
						height: 40px;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						box-shadow: 0 2px 6px rgba(0,0,0,0.3);
						font-size: 12px;
						color: white;
						font-weight: bold;
					">
						<div style="font-size: 16px;">${getWeatherIcon(city.weather)}</div>
						<div style="font-size: 10px;">${city.temp}</div>
					</div>
				`,
				className: 'weather-marker-container',
				iconSize: [40, 40],
				iconAnchor: [20, 20]
			});

			const marker = L.marker([city.lat, city.lng], { icon }).bindPopup(`
					<div style="text-align: center; padding: 8px;">
						<h3 style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">${city.name}</h3>
						<div style="font-size: 24px; margin: 8px 0;">${getWeatherIcon(city.weather)}</div>
						<p style="margin: 4px 0; color: #374151;"><strong>Temperature:</strong> ${city.temp}</p>
						<p style="margin: 4px 0; color: #374151;"><strong>Weather:</strong> ${getWeatherDescription(city.weather)}</p>
						<p style="margin: 4px 0; color: #374151;"><strong>Wind:</strong> ${city.wind}</p>
					</div>
				`);

			marker.addTo(map);
			markers.push(marker);
		});
	}

	// Initialize map
	async function initializeMap() {
		if (!browser || !mapContainer) return;

		try {
			// Dynamically import Leaflet only in browser
			L = await import('leaflet');

			// Initialize map centered on Neretva Delta region
			map = L.map(mapContainer, {
				center: [43.05, 17.55], // Ploče area
				zoom: 11,
				zoomControl: true,
				attributionControl: true
			});

			// Add OpenStreetMap tiles (free)
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 18
			}).addTo(map);

			// Alternative tile layer options (commented out):
			// Satellite imagery from Esri (free)
			// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			// 	attribution: '© Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			// }).addTo(map);

			// Topographic map
			// L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			// 	attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
			// }).addTo(map);

			// Load weather data and add markers
			await loadWeatherData();
		} catch (err) {
			console.error('Error initializing map:', err);
			error = 'Failed to initialize map';
		}
	}

	function getWeatherDescription(weather: string): string {
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
		// Import Leaflet CSS
		if (browser) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
			link.crossOrigin = '';
			document.head.appendChild(link);

			// Wait for CSS to load then initialize map
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
		<!-- Loading state -->
		{#if loading}
			<div class="absolute inset-0 z-[50] flex items-center justify-center rounded-lg bg-white/90">
				<div class="text-center">
					<div
						class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
					></div>
					<p class="text-gray-600">Loading weather map...</p>
				</div>
			</div>
		{/if}

		<!-- Error state -->
		{#if error}
			<div class="absolute inset-0 z-[50] flex items-center justify-center rounded-lg bg-white/90">
				<div class="text-center">
					<p class="mb-2 text-red-600">Error: {error}</p>
					<button
						on:click={loadWeatherData}
						class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Retry
					</button>
				</div>
			</div>
		{/if}

		<!-- Map container -->
		<div
			bind:this={mapContainer}
			class="h-full w-full overflow-hidden rounded-lg"
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

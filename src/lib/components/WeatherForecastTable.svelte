<script lang="ts">
	import { onMount } from 'svelte';
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import { fetchNeretvaForecast } from '$lib/services/weatherService.js';

	export let location: string = 'Neretva';
	export let forecastData: any[] = [];

	let weatherData: any[] = [];
	let loading: boolean = true;
	let error: string | null = null;
	
	// Tab state
	let activeTab: 'table' | 'graph' = 'table';

	// Load weather data on mount
	onMount(async () => {
		try {
			loading = true;
			error = null;
			weatherData = await fetchNeretvaForecast();
		} catch (err) {
			error = err.message;
			console.error('Error loading forecast data:', err);
			// Use fallback data
			weatherData = generateFallbackData();
		} finally {
			loading = false;
		}
	});

	function generateFallbackData(): any[] {
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

	function formatDate(date: Date): string {
		const day = date.getDate();
		const month = date.toLocaleString('en', { month: 'short' });
		return `${day} ${month}.`;
	}

	function formatDayName(date: Date): string {
		return date.toLocaleString('en', { weekday: 'long' });
	}

	async function refreshForecast(): Promise<void> {
		try {
			loading = true;
			error = null;
			weatherData = await fetchNeretvaForecast();
		} catch (err) {
			error = err.message;
			console.error('Error loading forecast data:', err);
			// Use fallback data
			weatherData = generateFallbackData();
		} finally {
			loading = false;
		}
	}

	function switchTab(tab: 'table' | 'graph'): void {
		activeTab = tab;
	}
</script>

<div class="w-full rounded-lg bg-white shadow-md">
	<!-- Header with tabs -->
	<div class="border-b border-gray-200 px-6 py-4">
		<h2 class="text-xl font-bold text-gray-900 mb-3">Weather Forecast - {location}</h2>
		<div class="flex gap-1">
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
				on:click={() => switchTab('table')}
			>
				Table
			</button>
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'graph' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
				on:click={() => switchTab('graph')}
			>
				Graph
			</button>
		</div>
	</div>

	<!-- Weather forecast table -->
	{#if activeTab === 'table'}
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p class="text-gray-600">Loading weather forecast...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<p class="mb-4 text-red-600">Error loading weather forecast</p>
					<button
						on:click={refreshForecast}
						class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Try Again
					</button>
				</div>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<!-- Header row -->
					<thead class="bg-blue-50">
						<tr class="border-b border-gray-200">
							<th class="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Night</th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Morning</th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Afternoon</th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Evening</th>
							<th class="px-4 py-3 text-center text-sm font-medium text-gray-700">Temperature high/low</th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Precip.</th>
							<th class="px-3 py-3 text-center text-sm font-medium text-gray-700">Wind</th>
						</tr>
					</thead>
					
					<!-- Weather data rows -->
					<tbody>
						{#each weatherData as day, index}
							<tr class="border-b border-gray-100 hover:bg-gray-50 {index === 0 ? 'bg-blue-50/50' : ''}">
								<!-- Date column -->
								<td class="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
									{day.date}
								</td>
								
								<!-- Night -->
								<td class="px-3 py-4 text-center">
									<div class="flex flex-col items-center gap-1">
										<WeatherIcon symbol={day.night.icon} size={32} />
										<span class="text-sm text-gray-600">{day.night.temp}°</span>
									</div>
								</td>
								
								<!-- Morning -->
								<td class="px-3 py-4 text-center">
									<div class="flex flex-col items-center gap-1">
										<WeatherIcon symbol={day.morning.icon} size={32} />
										<span class="text-sm text-gray-600">{day.morning.temp}°</span>
									</div>
								</td>
								
								<!-- Afternoon -->
								<td class="px-3 py-4 text-center">
									<div class="flex flex-col items-center gap-1">
										<WeatherIcon symbol={day.afternoon.icon} size={32} />
										<span class="text-sm text-gray-600">{day.afternoon.temp}°</span>
									</div>
								</td>
								
								<!-- Evening -->
								<td class="px-3 py-4 text-center">
									<div class="flex flex-col items-center gap-1">
										<WeatherIcon symbol={day.evening.icon} size={32} />
										<span class="text-sm text-gray-600">{day.evening.temp}°</span>
									</div>
								</td>
								
								<!-- Temperature range -->
								<td class="px-4 py-4 text-center">
									<div class="text-sm">
										<span class="font-semibold text-red-600">{day.tempHigh}°</span>
										<span class="text-gray-400"> / </span>
										<span class="text-blue-600">{day.tempLow}°</span>
									</div>
								</td>
								
								<!-- Precipitation -->
								<td class="px-3 py-4 text-center text-sm text-gray-600">
									{day.precipitation}
								</td>
								
								<!-- Wind -->
								<td class="px-3 py-4 text-center text-sm text-gray-600">
									{day.wind}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}

	<!-- Graph view placeholder -->
	{#if activeTab === 'graph'}
		<div class="px-6 py-12 text-center">
			<div class="text-gray-500">
				<svg class="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				<p class="text-lg font-medium text-gray-700">Graph View</p>
				<p class="mt-2 text-sm">Interactive temperature and precipitation graph coming soon</p>
			</div>
		</div>
	{/if}

	<!-- Footer with attribution -->
	<div class="border-t border-gray-200 px-6 py-3 text-xs text-gray-500">
		<div class="flex items-center justify-between">
			<span>Updated 11:16</span>
			<div class="flex gap-4">
				<a href="https://www.yr.no/en/map/weather/2-3194528/Croatia/Neretva" 
				   target="_blank" 
				   rel="noopener"
				   class="text-blue-600 hover:underline">
					Forecast as PDF
				</a>
				<a href="https://www.yr.no/en/map/weather/2-3194528/Croatia/Neretva" 
				   target="_blank" 
				   rel="noopener"
				   class="text-blue-600 hover:underline">
					Forecast as SVG
				</a>
			</div>
		</div>
		<div class="mt-2">
			<span>Weather data © </span>
			<a href="https://www.yr.no" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
				MET Norway / yr.no
			</a>
		</div>
	</div>
</div>
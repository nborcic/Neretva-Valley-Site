<script lang="ts">
	import WeatherMap from '$lib/components/WeatherMap.svelte';
	import { t } from 'svelte-i18n';
	import { locale } from 'svelte-i18n';
	$: currentLocale = $locale || 'en';
	export let data: {
		days: {
			date: string;
			label: string;
			night: string;
			morning: string;
			afternoon: string;
			evening: string;
			hi: number;
			lo: number;
			precip: number;
			wind: number;
		}[];
	};
	function formatDate(dateISO: string, loc: string) {
		return new Intl.DateTimeFormat(loc, {
			day: '2-digit',
			month: 'short'
		}).format(new Date(dateISO));
	}
</script>

<div class="h-100vh bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Header Section -->
	<header class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-6">
			<h1 class="text-center text-3xl font-bold text-gray-900">Neretva Valley Weather</h1>
			<p class="mt-2 text-center text-gray-600">
				Real-time weather conditions across the Neretva River Delta
			</p>
		</div>
	</header>

	<main class="  px-4 py-8">
		<!-- Forecast Table Section -->
		<section class="mb-8 overflow-hidden rounded-xl bg-white shadow-lg">
			<div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
				<h2 class="flex items-center text-xl font-semibold text-white">
					🌤️ 2-Day Weather Forecast
				</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">
								{$t('forecast.date')}
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.night_full')}>🌙 {$t('forecast.night')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.morning_full')}>🌅 {$t('forecast.morning')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.afternoon_full')}>☀️ {$t('forecast.afternoon')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.evening_full')}>🌆 {$t('forecast.evening')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.hilo')}>🌡️ {$t('forecast.hilo')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.precip_full')}>💧 {$t('forecast.precip')}</span>
							</th>
							<th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								<span title={$t('forecast.wind')}>🌬️ {$t('forecast.wind')}</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each data.days as d}
							<tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
								<td class="px-4 py-3 font-medium text-gray-900">
									{formatDate(d.date, currentLocale)}
								</td>
								<td class="px-4 py-3 text-center">{d.night}</td>
								<td class="px-4 py-3 text-center">{d.morning}</td>
								<td class="px-4 py-3 text-center">{d.afternoon}</td>
								<td class="px-4 py-3 text-center">{d.evening}</td>
								<td class="px-4 py-3 text-center whitespace-nowrap">
									<span class="font-semibold text-red-600">{d.hi}°</span>
									<span class="mx-1 text-gray-400">/</span>
									<span class="font-semibold text-blue-600">{d.lo}°</span>
								</td>
								<td class="px-4 py-3 text-center font-medium">
									{d.precip}mm
								</td>
								<td class="px-4 py-3 text-center font-medium">
									{d.wind}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- Weather Map Section -->
		<section class="mb-8 overflow-hidden rounded-xl bg-white shadow-lg">
			<div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
				<h2 class="flex items-center text-xl font-semibold text-white">Interactive Weather Map</h2>
				<p class="mt-1 text-sm text-indigo-100">
					Click on locations to see detailed weather information
				</p>
			</div>
			<div class="p-6">
				<WeatherMap />
			</div>
		</section>

		<!-- External Weather Sources Section -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- YR Weather Card -->
			<div class="overflow-hidden rounded-xl bg-white shadow-lg">
				<div class="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
					<h3 class="flex items-center text-lg font-semibold text-white">🔗 YR.no Weather Card</h3>
					<p class="mt-1 text-sm text-green-100">
						Live weather data from Norwegian Meteorological Institute
					</p>
				</div>
				<div class="p-6">
					<iframe
						src="https://www.yr.no/en/content/2-3194528/card.html"
						class="h-96 w-full rounded-lg border-0"
						title="YR Weather Card"
						loading="lazy"
					></iframe>
				</div>
			</div>

			<!-- Meteogram -->
			<div class="overflow-hidden rounded-xl bg-white shadow-lg">
				<div class="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
					<h3 class="flex items-center text-lg font-semibold text-white">📊 Weather Meteogram</h3>
					<p class="mt-1 text-sm text-orange-100">48-hour detailed weather chart</p>
				</div>
				<div class="p-6">
					<img
						src="https://www.yr.no/en/content/1-72837/meteogram.svg"
						alt="Weather Meteogram"
						class="h-96 w-full rounded-lg object-cover"
						loading="lazy"
					/>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	/* Custom scrollbar for better UX */
	:global(html) {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: #f1f5f9;
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8;
	}

	/* Smooth transitions for all interactive elements */
	:global(*) {
		transition-property: color, background-color, border-color, opacity, transform;
		transition-duration: 200ms;
		transition-timing-function: ease-in-out;
	}

	/* Enhanced table styling */
	:global(table) {
		font-size: 0.875rem;
		line-height: 1.25;
	}

	:global(th) {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	:global(td) {
		font-weight: 500;
	}
</style>

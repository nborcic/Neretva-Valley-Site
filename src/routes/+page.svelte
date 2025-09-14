<script>
	import { t } from 'svelte-i18n';
	import WeatherMap from '$lib/components/WeatherMap.svelte';
	let location = '';
	function fetchWeather() {}
</script>

<div class="flex flex-col items-start justify-center gap-4 bg-gray-100 text-blue-600">
	<section class="flex flex-col items-center justify-center w-full">
		<h1 class="text-3xl font-bold mb-4">{$t('main.title')}</h1>
		<WeatherMap />
	</section>
	<section class="w-full">
		<img
			class="w-full rounded-lg shadow-md"
			src="https://www.yr.no/en/content/2-3194528/meteogram.svg"
			alt="Meteogram"
		/>
	</section>
</div>

<script lang="ts">
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import WeatherForecastTable from '$lib/components/WeatherForecastTable.svelte';
	import mapImg from '$lib/assets/neretva-map.jpg';
	import header1 from '$lib/assets/WhatsApp Image 2025-09-13 at 09.41.16.jpeg';
	import img1 from '$lib/assets/WhatsApp Image 2025-09-13 at 09.41.16 (1).jpeg';
	import img2 from '$lib/assets/WhatsApp Image 2025-09-13 at 09.41.16 (2).jpeg';
	import img3 from '$lib/assets/WhatsApp Image 2025-09-13 at 09.41.16 (3).jpeg';
	import img4 from '$lib/assets/WhatsApp Image 2025-09-13 at 09.41.16 (4).jpeg';

	export let data: {
		towns: Array<{
			town: { key: string; name: string; subtitle: string };
			current: {
				tempC: number; windKmh: number; precipLastHourMm: number | null; cloudPercent: number | null; humidityPercent: number | null; symbol: string; feelsLikeC: number | null; sunrise?: string | null; sunset?: string | null;
			};
			hours: Array<{ time: string; tempC: number; symbol: string }>;
			days: Array<{ date: string; highC: number; lowC: number; symbol: string; text: string }>;
			error?: string;
		}>;
	};

	const collageImages = [img1, img2, img3, img4];
	let collageIndex = 0;
	let reduceMotion = false;

	function formatKmh(v: number) { return `${v} km/h`; }
	function formatTemp(v: number) { return Number.isFinite(v) ? `${v}°C` : '—'; }
	function tempPercent(t: number) {
		// Map -5..40C to 0..100%
		const min = -5, max = 40;
		const clamped = Math.max(min, Math.min(max, t));
		return ((clamped - min) / (max - min)) * 100;
	}

	function timeHM(iso?: string | null) {
		if (!iso) return '—';
		const d = new Date(iso);
		return d.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
	}

	function onMountClient() {
		if (typeof window !== 'undefined') {
			reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (!reduceMotion) {
				const id = setInterval(() => { collageIndex = (collageIndex + 1) % collageImages.length; }, 6000);
				return () => clearInterval(id);
			}
		}
	}
</script>

<svelte:window on:load={onMountClient} />

<div class="flex flex-col gap-6 bg-gray-50 [background-image:radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:8px_8px] rounded-lg p-4">
	<!-- Header banner -->
	<section class="relative overflow-hidden rounded-lg shadow-sm">
		<img src={header1} alt="Novinski header" class="h-36 w-full object-cover opacity-80" />
		<div class="absolute inset-0 bg-white/30"></div>
		<div class="absolute inset-0 flex items-center px-4">
			<h1 class="text-2xl font-extrabold tracking-tight text-gray-900">Neretva Weather</h1>
		</div>
	</section>

	<!-- Embedded yr.no PDF Forecast (bottom 50% only) -->
	<section class="mb-6">
		<div class="relative overflow-hidden rounded-lg bg-white shadow-md" style="height: 400px;">
			<div class="absolute inset-0" style="top: -400px;">
				<iframe
					src="https://www.yr.no/en/print/forecast/2-3194528/Croatia/Neretva"
					class="h-full w-full border-0"
					style="height: 800px; width: 100%;"
					title="Neretva Weather Forecast from yr.no"
					loading="lazy"
				></iframe>
			</div>
			<!-- Overlay header -->
			<div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-600 to-blue-500 px-4 py-2 text-white shadow-sm">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-medium">Live Forecast from yr.no</h3>
					<a
						href="https://www.yr.no/en/print/forecast/2-3194528/Croatia/Neretva"
						target="_blank"
						rel="noopener"
						class="text-xs text-blue-100 hover:text-white hover:underline"
					>
						View Full Forecast →
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Neretva Weather Forecast Table -->
	<section class="mb-6">
		<WeatherForecastTable location="Neretva" />
	</section>

	<!-- Main layout: cards + sidebar -->
	<section class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
		<!-- Weather cards -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each data.towns as t}
				<article class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
					<header class="mb-2">
						<h2 class="text-lg font-bold text-gray-900">{t.town.name}</h2>
						<p class="text-xs text-gray-500">Dubrovnik–Neretva, HR</p>
					</header>

					{#if t.error}
						<div class="text-sm text-red-600">Nema podataka. Pokušaj ponovno.</div>
					{:else}
						<!-- Current row -->
						<div class="mb-3 flex items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<WeatherIcon symbol={t.current.symbol} size={28} />
								<div class="text-2xl font-semibold text-gray-900">{formatTemp(t.current.tempC)}</div>
							</div>
							<div class="text-xs text-gray-600">
								<div>Vjetar: {formatKmh(t.current.windKmh)}</div>
								<div>Oborina 1h: {t.current.precipLastHourMm ?? 0} mm</div>
								<div>Oblaci: {t.current.cloudPercent ?? 0}% · Vlaga: {t.current.humidityPercent ?? 0}%</div>
							</div>
						</div>

						<!-- Temp scale with dot -->
						<div class="mb-3">
							<div class="relative h-2 w-full rounded-full"
								 style="background: linear-gradient(90deg,#3b82f6 0%, #06b6d4 12%, #22c55e 25%, #eab308 37%, #f97316 50%, #ef4444 62%, #991b1b 100%);"></div>
							<div class="relative -mt-2 h-4">
								<div class="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full border border-white bg-gray-900 shadow"
									 style={`left:${tempPercent(t.current.tempC)}%`}
									 aria-label="Trenutna temperatura"></div>
							</div>
						</div>

						<!-- Today strip -->
						<div class="mb-3 flex gap-2 overflow-x-auto py-1">
							{#if t.hours.length === 0}
								{#each Array(6) as _, i}
									<div class="min-w-14 rounded border border-dotted border-gray-300 px-2 py-1 text-center">
										<div class="mx-auto h-3 w-10 rounded bg-gray-200 animate-pulse"></div>
										<div class="mx-auto my-1 h-4 w-6 rounded bg-gray-200 animate-pulse"></div>
										<div class="mx-auto h-3 w-8 rounded bg-gray-200 animate-pulse"></div>
									</div>
								{/each}
							{:else}
								{#each t.hours.slice(0, 8) as h}
									<div class="min-w-14 rounded border border-dotted border-gray-300 px-2 py-1 text-center">
										<div class="text-[10px] text-gray-500">{h.time}</div>
										<div class="mx-auto my-0.5 flex justify-center"><WeatherIcon symbol={h.symbol} size={18} /></div>
										<div class="text-sm font-medium text-gray-900">{h.tempC}°</div>
									</div>
								{/each}
							{/if}
						</div>

						<!-- 3-day outlook -->
						<div class="grid grid-cols-3 gap-2">
							{#each t.days as d}
								<div class="rounded border border-dotted border-gray-300 p-2 text-center">
									<div class="text-[10px] text-gray-500">{d.date}</div>
									<div class="my-0.5 flex justify-center"><WeatherIcon symbol={d.symbol} size={20} /></div>
									<div class="text-xs text-gray-700">{d.lowC}° / <span class="font-semibold text-gray-900">{d.highC}°</span></div>
									<div class="text-[11px] text-gray-600">{d.text}</div>
								</div>
							{/each}
						</div>

						<!-- Extras -->
						<div class="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
							<div>Osjećaj: {t.current.feelsLikeC ?? '—'}°</div>
							<div>UV: {t.current.uvIndex ?? '—'}</div>
							<div>Izlazak: {timeHM(t.current.sunrise)}</div>
							<div>Zalazak: {timeHM(t.current.sunset)}</div>
						</div>
					{/if}
				</article>
			{/each}
		</div>

		<!-- Sidebar -->
		<aside class="flex flex-col gap-4">
			<div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
				<div class="p-3 text-sm font-semibold">Karta</div>
				<img src={mapImg} alt="Karta Neretve" class="h-56 w-full object-cover" />
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
				<div class="p-3 text-sm font-semibold">Povijesni ekstremi</div>
				<div class="px-3 pb-3 text-xs text-gray-600">
					Najtopliji dan, najhladnija noć, najveća kiša — uskoro.
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
				<div class="p-3 text-sm font-semibold">Fotokolaž</div>
				<div class="group relative h-56 w-full">
					{#each collageImages as img, i}
						<img src={img} alt="Neretva fotografija" class={`absolute inset-0 h-full w-full object-cover transition-opacity ${reduceMotion ? 'duration-0' : 'duration-700'} opacity-0`} style={`opacity:${i===collageIndex?1:0}`}/>
					{/each}
				</div>
			</div>
		</aside>
	</section>

	<!-- Legend under cards -->
	<section class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200">
		<div class="text-xs text-gray-700">Temperaturna skala</div>
		<div class="mt-2 h-3 w-full rounded-full"
			 style="background: linear-gradient(90deg,#1d4ed8 0%, #0891b2 14%, #16a34a 28%, #f59e0b 42%, #f97316 56%, #ef4444 78%, #7f1d1d 100%);"></div>
		<div class="mt-1 flex justify-between text-[10px] text-gray-600">
			<span>≤0°</span><span>5°</span><span>10°</span><span>15°</span><span>20°</span><span>25°</span><span>≥35°</span>
		</div>
	</section>
</div>

<script>
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import { fetchAllWeatherData } from '$lib/services/weatherService.js';

	let chartContainer;
	let chart;
	let weatherData = [];
	let loading = true;
	let error = null;

	// Original hardcoded positions for the map display
	const originalPositions = [
		// Coastal/Delta towns
		{ name: 'Ploče', x: 7, y: 100 },
		{ name: 'Klek', x: 50, y: 100 },
		{ name: 'Komarna', x: 35, y: 75 },
		{ name: 'Raba', x: 45, y: 70 },
		{ name: 'Kremena', x: 55, y: 65 },
		{ name: 'Duba', x: 65, y: 60 },
		{ name: 'Tuštevac', x: 70, y: 55 },
		{ name: 'Mihalj', x: 75, y: 50 },
		{ name: 'Otok', x: 80, y: 45 },
		{ name: 'Trn', x: 85, y: 40 },
		{ name: 'Blace', x: 80, y: 35 },
		{ name: 'Pržinovac', x: 75, y: 30 },
		{ name: 'Ušće', x: 70, y: 25 },
		{ name: 'Opuzen', x: 65, y: 20 },
		{ name: 'Komin', x: 60, y: 15 },
		{ name: 'Rogotin', x: 55, y: 10 },

		// Inland towns
		{ name: 'Metković', x: 70, y: 50 },
		{ name: 'Kula Norinska', x: 75, y: 45 },
		{ name: 'Krvavac', x: 80, y: 40 },
		{ name: 'Buk Vlaka', x: 85, y: 35 },
		{ name: 'Vlaka', x: 80, y: 30 },
		{ name: 'Podgradina', x: 75, y: 25 },
		{ name: 'Plodine', x: 70, y: 20 },
		{ name: 'Mlinište', x: 65, y: 15 },
		{ name: 'Mislina', x: 60, y: 10 },
		{ name: 'Slivno Ravno', x: 55, y: 5 },
		{ name: 'Zavala', x: 50, y: 0 },

		// Upstream towns
		{ name: 'Šarić Struga', x: 90, y: 60 },
		{ name: 'Banja', x: 95, y: 55 },
		{ name: 'Strimen', x: 90, y: 50 },
		{ name: 'Desne', x: 85, y: 45 },
		{ name: 'Podrujnica', x: 80, y: 40 },
		{ name: 'Momići', x: 75, y: 35 }
	];

	// Function to get position for a location
	function getPosition(locationName) {
		const pos = originalPositions.find((p) => p.name === locationName);
		return pos ? { x: pos.x, y: pos.y } : { x: 50, y: 50 };
	}

	// Load weather data
	async function loadWeatherData() {
		try {
			loading = true;
			error = null;

			// Try yr.no first (free, no API key needed)
			const data = await fetchAllWeatherData(false);

			// Merge with original positions
			weatherData = data.map((location) => {
				const position = getPosition(location.name);
				return {
					...location,
					x: position.x,
					y: position.y
				};
			});

			// Update chart if it exists
			if (chart) {
				updateChart();
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading weather data:', err);
		} finally {
			loading = false;
		}
	}

	// Function to update chart with new data
	function updateChart() {
		if (!chart || !weatherData.length) return;

		const option = {
			backgroundColor: 'transparent',
			title: {
				text: 'Neretva River Delta Weather',
				left: 'center',
				top: 20,
				textStyle: {
					fontSize: 24,
					fontWeight: 'bold',
					color: '#1e40af'
				}
			},
			grid: {
				left: '5%',
				right: '5%',
				top: '15%',
				bottom: '10%'
			},
			xAxis: {
				type: 'value',
				show: false,
				min: 0,
				max: 100
			},
			yAxis: {
				type: 'value',
				show: false,
				min: 0,
				max: 100
			},
			series: [
				{
					type: 'scatter',
					data: weatherData.map((city) => ({
						value: [city.x, city.y],
						name: city.name,
						temp: city.temp,
						weather: city.weather,
						wind: city.wind,
						symbolSize: 35,
						symbol: getWeatherSymbol(city.weather),
						itemStyle: {
							color: getWeatherColor(city.weather),
							opacity: 0.8
						}
					})),
					label: {
						show: true,
						position: 'inside',
						formatter: function (params) {
							return `{name|${params.data.name}}\n{temp|${params.data.temp}}`;
						},
						rich: {
							name: {
								fontSize: 10,
								fontWeight: 'bold',
								color: '#1e40af'
							},
							temp: {
								fontSize: 8,
								color: '#374151'
							}
						}
					},
					emphasis: {
						scale: 1.2,
						itemStyle: {
							opacity: 1
						}
					}
				}
			],
			tooltip: {
				trigger: 'item',
				formatter: function (params) {
					return `
						<div style="padding: 10px;">
							<h3 style="margin: 0 0 5px 0; color: #1e40af;">${params.data.name}</h3>
							<p style="margin: 0; color: #374151;">Temperature: ${params.data.temp}</p>
							<p style="margin: 0; color: #374151;">Weather: ${getWeatherDescription(params.data.weather)}</p>
							<p style="margin: 0; color: #374151;">Wind: ${params.data.wind}</p>
						</div>
					`;
				}
			}
		};

		chart.setOption(option);
	}

	onMount(async () => {
		if (chartContainer) {
			chart = echarts.init(chartContainer);

			// Load weather data and update chart
			await loadWeatherData();

			// Handle window resize
			const handleResize = () => chart.resize();
			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
				chart.dispose();
			};
		}
	});

	function getWeatherSymbol(weather) {
		switch (weather) {
			case 'sunny':
				return 'image:///Sunny.gif';
			case 'partly-cloudy':
				return 'circle';
			case 'cloudy':
				return 'circle';
			case 'rainy':
				return 'circle';
			default:
				return 'circle';
		}
	}

	function getWeatherColor(weather) {
		switch (weather) {
			case 'sunny':
				return 'transparent'; // Use icon instead of color
			case 'partly-cloudy':
				return '#94a3b8';
			case 'cloudy':
				return '#64748b';
			case 'rainy':
				return '#3b82f6';
			default:
				return '#e5e7eb';
		}
	}

	function getWeatherDescription(weather) {
		switch (weather) {
			case 'sunny':
				return 'Sunny';
			case 'partly-cloudy':
				return 'Partly Cloudy';
			case 'cloudy':
				return 'Cloudy';
			case 'rainy':
				return 'Rainy';
			default:
				return 'Unknown';
		}
	}
</script>

<div class="w-full rounded-lg bg-white p-4 shadow-md">
	<div class="relative h-96 w-full">
		<!-- Background map image -->
		<img
			src="/neretva_map_maps.jpg"
			class="absolute inset-0 z-[1] h-full w-full rounded-lg object-cover opacity-60"
			alt="Neretva River Delta Map"
			on:error={() => console.log('Image failed to load')}
			on:load={() => console.log('Image loaded successfully')}
		/>
		<!-- Map attribution -->
		<div
			class="absolute right-2 bottom-2 z-[5] rounded bg-white/80 px-2 py-1 text-xs text-gray-600"
		>
			© Google
		</div>

		<!-- Loading state -->
		{#if loading}
			<div class="absolute inset-0 z-[15] flex items-center justify-center bg-white/80">
				<div class="text-center">
					<div
						class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
					></div>
					<p class="text-gray-600">Loading weather data...</p>
				</div>
			</div>
		{/if}

		<!-- Error state -->
		{#if error}
			<div class="absolute inset-0 z-[15] flex items-center justify-center bg-white/80">
				<div class="text-center">
					<p class="mb-2 text-red-600">Error loading weather data</p>
					<button
						on:click={loadWeatherData}
						class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Retry
					</button>
				</div>
			</div>
		{/if}

		<!-- Weather chart overlay -->
		<div bind:this={chartContainer} class="absolute inset-0 z-[10] h-full w-full"></div>
	</div>
</div>

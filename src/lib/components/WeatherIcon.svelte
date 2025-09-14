<script lang="ts">
	export let symbol: string = 'partlycloudy_day';
	export let size: number = 24;
	const aria = symbol.replaceAll('_', ' ');

	function pick() {
		if (symbol.includes('clearsky') || symbol === 'sun') return 'sun';
		if (symbol.includes('fair')) return 'sun-cloud';
		if (symbol.includes('partlycloudy')) return 'sun-cloud';
		if (symbol.includes('cloud')) return 'cloud';
		if (symbol.includes('fog')) return 'fog';
		if (symbol.includes('snow')) return 'snow';
		if (symbol.includes('sleet')) return 'sleet';
		if (symbol.includes('rain') || symbol.includes('showers')) return 'rain';
		if (symbol.includes('thunder')) return 'storm';
		return 'cloud';
	}

	const kind = pick();
</script>

{#if kind === 'sun'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<circle cx="12" cy="12" r="5" stroke-width="2" />
		<g stroke-width="2" stroke-linecap="round">
			<path d="M12 1v3" /><path d="M12 20v3" />
			<path d="M4.22 4.22l2.12 2.12" />
			<path d="M17.66 17.66l2.12 2.12" />
			<path d="M1 12h3" />
			<path d="M20 12h3" />
			<path d="M4.22 19.78l2.12-2.12" />
			<path d="M17.66 6.34l2.12-2.12" />
		</g>
	</svg>
{:else if kind === 'sun-cloud'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<circle cx="7" cy="8" r="3" stroke-width="2" />
		<path d="M12 19h6a3 3 0 0 0 0-6 4 4 0 0 0-7.8-1.2A3.5 3.5 0 1 0 6 19z" stroke-width="2" fill="none" />
	</svg>
{:else if kind === 'cloud'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 19h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 19z" stroke-width="2" />
	</svg>
{:else if kind === 'rain'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 16h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 16z" stroke-width="2" />
		<g stroke-width="2" stroke-linecap="round">
			<path d="M8 18l-1 3" />
			<path d="M12 18l-1 3" />
			<path d="M16 18l-1 3" />
		</g>
	</svg>
{:else if kind === 'storm'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 16h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 16z" stroke-width="2" />
		<path d="M11 13l-2 4h3l-2 4" stroke-width="2" />
	</svg>
{:else if kind === 'snow'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 16h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 16z" stroke-width="2" />
		<g stroke-width="2" stroke-linecap="round">
			<path d="M8 18l1 1" />
			<path d="M12 18l1 1" />
			<path d="M16 18l1 1" />
		</g>
	</svg>
{:else if kind === 'fog'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 14h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 14z" stroke-width="2" />
		<path d="M4 17h12" stroke-width="2" />
		<path d="M6 20h10" stroke-width="2" />
	</svg>
{:else}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label={aria} role="img">
		<path d="M6 19h11a4 4 0 0 0 0-8 5 5 0 0 0-9.75-1.5A3.5 3.5 0 1 0 6 19z" stroke-width="2" />
	</svg>
{/if}


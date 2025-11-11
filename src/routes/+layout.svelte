<script lang="ts">
	import '../app.css';
	import { locale } from '$lib/i18n-lib';
	import { t } from '$lib/i18n-lib';
	import { onMount } from 'svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';

	type Language = 'hr' | 'en';

	declare global {
		interface Window {
			adsbygoogle?: unknown[];
		}
	}

	function setLang(language: Language) {
		locale.set(language);
	}

	onMount(() => {
		window.adsbygoogle = window.adsbygoogle || [];
		try {
			window.adsbygoogle.push({});
		} catch (error) {
			console.error('AdSense push error:', error);
		}
	});
</script>

<svelte:head>
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR-ADSENSE-CLIENT-ID"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		class="p-3 shadow-md"
		style="background-color: var(--color-30); color: var(--color-on-30);"
	>
		<div class="container mx-auto flex items-center justify-between gap-4">
			<div class="flex flex-wrap items-center gap-2">
				<h1 class="text-3xl font-bold underline decoration-[var(--color-10)] hover:text-[var(--color-10)]">
					<a href="/">{$t('main.header.title').split(' ')[0]}</a>
				</h1>
				<h1 class="text-3xl font-bold text-[var(--color-on-30)]">
					{$t('main.header.title').split(' ')[1]}
					{$t('main.header.title').split(' ')[2]}
				</h1>
				<a
					href="#status"
					class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
					style="background: linear-gradient(135deg, color-mix(in srgb, var(--color-30) 70%, transparent) 0%, color-mix(in srgb, var(--color-10) 45%, transparent) 100%); color: var(--color-on-30);"
				>
					<span class="h-2 w-2 rounded-full bg-[var(--color-10)]"></span>
					{$t('main.header.status')}
				</a>
			</div>
			<div class="flex items-center gap-2">
				<button
					class="cursor-pointer rounded bg-white/15 px-2 py-1 text-sm font-medium text-[var(--color-on-30)] transition hover:bg-white/25"
					on:click={() => setLang('hr')}>HR</button
				>
				<button
					class="cursor-pointer rounded bg-white/15 px-2 py-1 text-sm font-medium text-[var(--color-on-30)] transition hover:bg-white/25"
					on:click={() => setLang('en')}>EN</button
				>
				<button
					class="inline-flex cursor-pointer items-center gap-2 rounded border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-[var(--color-on-30)] transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-10)]"
					type="button"
					on:click={toggleTheme}
					aria-pressed={$theme === 'dark'}
					aria-label={$theme === 'dark' ? 'Switch to day theme' : 'Switch to night theme'}
				>
					<span class="text-base leading-none" aria-hidden="true">
						{$theme === 'dark' ? '🌙' : '☀️'}
					</span>
					<span class="text-xs uppercase tracking-wide">
						{$theme === 'dark' ? 'Night' : 'Day'}
					</span>
				</button>
			</div>
		</div>
	</header>

	<main class="container mx-auto flex gap-4 p-4">
		<aside class="surface-card hidden w-[20%] rounded-lg p-6 lg:block">
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">{$t('ad.placeholder')}</h3>
			</div>
			<div class="surface-muted my-4 rounded-md border p-4 text-sm">
				<p class="text-center opacity-80">[AdSense Sidebar Ad Here - Left]</p>
				<ins
					class="adsbygoogle"
					style="display:block"
					data-ad-client="YOUR-ADSENSE-CLIENT-ID"
					data-ad-slot="YOUR-AD-SLOT-ID-SIDEBAR-LEFT"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
			</div>
		</aside>

		<div class="surface-card w-full rounded-lg p-6 lg:w-[60%]">
			<slot />
		</div>

		<aside class="surface-card hidden w-[20%] rounded-lg p-6 md:block">
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">{$t('ad.placeholder')}</h3>
			</div>
			<div class="surface-muted my-4 rounded-md border p-4 text-sm">
				<p class="text-center opacity-80">[AdSense Sidebar Ad Right]</p>
				<ins
					class="adsbygoogle"
					style="display:block"
					data-ad-client="YOUR-ADSENSE-CLIENT-ID"
					data-ad-slot="YOUR-AD-SLOT-ID-SIDEBAR"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
			</div>
		</aside>
	</main>

	<footer
		class="mt-8 p-4"
		style="background-color: var(--color-30); color: var(--color-on-30);"
	>
		<div class="container mx-auto text-center text-sm">
			<p>&copy; 2025 {$t('main.header.title')}. {$t('footer.copyright')}</p>
			<nav class="mt-2">
				{$t('footer.weatherdata')}
				<a href="https://www.met.no/en" class="text-[var(--color-10)] hover:underline"
					>MET Norway</a
				>
				/
				<a href="https://www.yr.no/" class="text-[var(--color-10)] hover:underline">Yr</a>,
				<a
					href="https://creativecommons.org/licenses/by/4.0/"
					class="text-[var(--color-10)] hover:underline"
				>
					{$t('footer.ccby')}
				</a>. {$t('footer.changes')}
				<a
					href="https://developer.yr.no/"
					class="text-[var(--color-10)] hover:underline"
					>{$t('footer.learnmore')}</a
				>
				<br />
				<a href="mailto:contact@example.com" class="mx-2 text-[var(--color-10)] hover:underline"
					>{$t('footer.contact')}</a
				>
				<p class="text-sm opacity-20">{$t('footer.built')}</p>
			</nav>
		</div>
	</footer>
</div>

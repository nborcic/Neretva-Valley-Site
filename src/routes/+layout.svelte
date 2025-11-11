<script>
	import '../app.css';
	import { locale } from '$lib/i18n-lib';
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n-lib';
	function setLang(l) {
		locale.set(l);
	}
</script>

<svelte:head>
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR-ADSENSE-CLIENT-ID"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="flex min-h-screen flex-col" style="background-color: var(--color-dominant);">
	<!--header title -->
	<header class="p-3 text-blue-400 shadow-md" style="background-color: var(--color-secondary);">
		<div class="container mx-auto flex items-center justify-between">
			<span class="flex items-center gap-2">
				<h1 class="text-3xl font-bold underline hover:text-blue-400">
					<a href="/">{$t('main.header.title').split(' ')[0]}</a>
				</h1>
				<h1 class="text-3xl font-bold">
					{$t('main.header.title').split(' ')[1]}
					{$t('main.header.title').split(' ')[2]}
				</h1>
				<div class="flex flex-1 justify-start">
					<a
						href="#status"
						class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-blue-700"
						style="background: linear-gradient(90deg, #dceefa 0%, #c1def4 100%);"
					>
						<span class="h-2 w-2 rounded-full bg-blue-500"></span>
						{$t('main.header.status')}
					</a>
				</div>
			</span>
			<div class="flex gap-2">
				<button
					class="cursor-pointer rounded bg-white/20 px-2 py-1 hover:bg-white/30"
					on:click={() => setLang('hr')}>HR</button
				>
				<button
					class="cursor-pointer rounded bg-white/20 px-2 py-1 hover:bg-white/30"
					on:click={() => setLang('en')}>EN</button
				>
			</div>
		</div>
	</header>

	<main class="mx-auto flex gap-4 p-4">
		<!-- Sidebar backgrounds using dominant color -->
		<aside class="w-[20%] rounded-lg p-6 shadow-md" style="background-color: white;">
			<!-- Left Sidebar Ad Slot -->
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">{$t('ad.placeholder')}</h3>
			</div>
			<div class="my-4 rounded-md border border-gray-200 bg-gray-50 p-4">
				<p class="text-center text-gray-500">[AdSense Sidebar Ad Here - Left]</p>
				<ins
					class="adsbygoogle"
					style="display:block"
					data-ad-client="YOUR-ADSENSE-CLIENT-ID"
					data-ad-slot="YOUR-AD-SLOT-ID-SIDEBAR-LEFT"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
			</div>
			<script>
				import { onMount } from 'svelte';
				onMount(() => {
					if (typeof window !== 'undefined' && window.adsbygoogle) {
						try {
							(window.adsbygoogle = window.adsbygoogle || []).push({});
						} catch (e) {
							console.error('AdSense push error (left):', e);
						}
					}
				});
			</script>
		</aside>

		<div class="w-[80%] rounded-lg p-6 shadow-md" style="background-color: white;">
			<slot />
		</div>
		<aside class=" w-[20%] rounded-lg bg-white p-6 shadow-md md:col-span-1">
			<!-- Sidebar Ad Slot Right -->
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">{$t('ad.placeholder')}</h3>
			</div>
			<div class="my-4 rounded-md border border-gray-200 bg-gray-50 p-4">
				<p class="text-center text-gray-500">[AdSense Sidebar Ad Right]</p>
				<ins
					class="adsbygoogle"
					style="display:block"
					data-ad-client="YOUR-ADSENSE-CLIENT-ID"
					data-ad-slot="YOUR-AD-SLOT-ID-SIDEBAR"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
			</div>
			<script>
				onMount(() => {
					if (typeof window !== 'undefined' && window.adsbygoogle) {
						try {
							(window.adsbygoogle = window.adsbygoogle || []).push({});
						} catch (e) {
							console.error('AdSense push error:', e);
						}
					}
				});
			</script>
		</aside>
	</main>

	<!-- Footer with secondary color -->
	<footer class="mt-8 p-4" style="background-color: var(--color-secondary); color: white;">
		<div class="container mx-auto text-center text-sm">
			<p>&copy; 2025 {$t('main.header.title')}. {$t('footer.copyright')}</p>
			<nav class="mt-2">
				{$t('footer.weatherdata')}
				<a href="https://www.met.no/en" class="text-blue-300 hover:underline">MET Norway</a> /
				<a href="https://www.yr.no/" class="text-blue-300 hover:underline">Yr</a>,
				<a
					href="https://creativecommons.org/licenses/by/4.0/"
					class="text-blue-300 hover:underline"
				>
					{$t('footer.ccby')}
				</a>. {$t('footer.changes')}
				<a href="https://developer.yr.no/" class="text-blue-300 hover:underline"
					>{$t('footer.learnmore')}</a
				>
				<br />
				<a href="mailto:contact@example.com" class="mx-2 text-blue-300 hover:underline"
					>{$t('footer.contact')}</a
				>
				<p class="text-sm opacity-10">{$t('footer.built')}</p>
			</nav>
		</div>
	</footer>
</div>

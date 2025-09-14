<script>
	import '../app.css';
	import { locale } from '$lib/i18n-lib';
	import { onMount } from 'svelte';

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

<div class="flex min-h-screen flex-col bg-gray-100">
	<header class="bg-blue-600 p-4 text-white shadow-md">
		<div class="container mx-auto flex items-center justify-between">
			<span class="flex items-center gap-2">
				<h1 class="text-3xl font-bold underline hover:text-blue-400"><a href="/"> Neretva</a></h1>
				<h1 class="text-3xl font-bold">Valley Weather</h1>
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

	<main class="container mx-auto grid flex-grow grid-cols-1 gap-4 p-4 md:grid-cols-4">
		<aside class="rounded-lg bg-white p-6 shadow-md md:col-span-1">
			<!-- Left Sidebar Ad Slot -->
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">Ovdje može biti vaša reklama</h3>
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
		<div class="rounded-lg bg-white p-6 shadow-md md:col-span-2">
			<slot />
		</div>
		<aside class="rounded-lg bg-white p-6 shadow-md md:col-span-1">
			<!-- Sidebar Ad Slot -->
			<div class="mt-6">
				<h3 class="mb-2 text-center text-lg font-semibold">Ovdje može biti vaša reklama</h3>
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
				import { onMount } from 'svelte';
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

	<footer class="mt-8 bg-gray-800 p-4 text-white">
		<div class="container mx-auto text-center text-sm">
			<p>&copy; 2025 Neretva Valley Weather. All rights reserved.</p>
			<nav class="mt-2">
				<a href="/privacy" class="mx-2 text-blue-300 hover:underline">Privacy Policy & Terms</a>
				<a href="mailto:contact@example.com" class="mx-2 text-blue-300 hover:underline">Contact</a>
			</nav>
			<p class="mt-2 text-gray-300">Weather data © <a href="https://www.yr.no" class="underline" target="_blank" rel="noopener">MET Norway / yr.no</a></p>
		</div>
	</footer>
</div>

<script>
	import { t } from 'svelte-i18n';
</script>

<section class="container mx-auto my-8 max-w-3xl rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-3xl font-bold">{$t('privacy.title')}</h1>
	<p class="mb-6 text-sm text-gray-600">{$t('privacy.updated')}</p>
	<p class="mb-8 text-gray-800">{$t('privacy.intro')}</p>

	<hr class="my-8" />

	<h2 class="mb-4 text-2xl font-semibold">{$t('privacy.section.privacy')}</h2>
	<h3 class="mb-2 text-lg font-medium">{$t('privacy.collect')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.collect.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.ads')}</h3>
	<p class="mb-2 text-gray-800">{$t('privacy.ads.text')}</p>
	<ul class="mb-6 list-disc pl-6 text-gray-800">
		<li>
			{$t('privacy.ads.manage')}: 
			<a class="text-blue-600 hover:underline" href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>
			<span class="mx-1">/</span>
			<a class="text-blue-600 hover:underline" href="http://www.aboutads.info/" rel="noopener noreferrer" target="_blank">aboutads.info</a>
		</li>
	</ul>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.cookies')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.cookies.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.security')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.security.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.links')}</h3>
	<p class="mb-8 text-gray-800">{$t('privacy.links.text')}</p>

	<hr class="my-8" />

	<h2 class="mb-4 text-2xl font-semibold">{$t('privacy.section.disclaimer')}</h2>
	<h3 class="mb-2 text-lg font-medium">{$t('privacy.accuracy')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.accuracy.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.navsafety')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.navsafety.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.liability')}</h3>
	<p class="mb-8 text-gray-800">{$t('privacy.liability.text')}</p>

	<hr class="my-8" />

	<h2 class="mb-4 text-2xl font-semibold">{$t('privacy.section.terms')}</h2>
	<h3 class="mb-2 text-lg font-medium">{$t('privacy.accept')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.accept.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.ip')}</h3>
	<p class="mb-6 text-gray-800">{$t('privacy.ip.text')}</p>

	<h3 class="mb-2 text-lg font-medium">{$t('privacy.law')}</h3>
	<p class="mb-8 text-gray-800">{$t('privacy.law.text')}</p>

	<hr class="my-8" />

	<h2 class="mb-4 text-2xl font-semibold">{$t('privacy.contact')}</h2>
	<p class="text-gray-800">{$t('privacy.contact.text')}</p>
</section>

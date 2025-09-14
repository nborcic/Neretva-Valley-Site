import { register, init, locale, t } from 'svelte-i18n';

// Lazy-load locales
register('hr', () => import('./locales/hr.json'));
register('en', () => import('./locales/en.json'));


// Initialize i18n
init({
	fallbackLocale: 'en',
	initialLocale: 'hr'
});

// Persist locale to localStorage and restore
if (typeof window !== 'undefined') {
	const saved = localStorage.getItem('lang');
	if (saved) {
		locale.set(saved);
	} else if (navigator.language?.toLowerCase().startsWith('hr')) {
		locale.set('hr');
	}

	locale.subscribe((v) => {
		if (v) localStorage.setItem('lang', v);
	});
}

export { locale, t };

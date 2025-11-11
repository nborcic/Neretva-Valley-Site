import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'neretva-theme';

function getPreferredTheme(): Theme {
	if (!browser) return 'light';

	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	document.documentElement.dataset.theme = theme;
	window.localStorage.setItem(STORAGE_KEY, theme);
}

const themeStore = writable<Theme>('light', (set) => {
	if (!browser) return;

	const initial = getPreferredTheme();
	applyTheme(initial);
	set(initial);

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const listener = (event: MediaQueryListEvent) => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored !== 'light' && stored !== 'dark') {
			const next = event.matches ? 'dark' : 'light';
			applyTheme(next);
			set(next);
		}
	};

	mediaQuery.addEventListener('change', listener);

	return () => {
		mediaQuery.removeEventListener('change', listener);
	};
});

export const theme = {
	subscribe: themeStore.subscribe,
	set: (value: Theme) => {
		applyTheme(value);
		themeStore.set(value);
	},
	update: (updater: (value: Theme) => Theme) => {
		let nextValue: Theme = 'light';
		themeStore.update((current) => {
			nextValue = updater(current);
			return nextValue;
		});
		applyTheme(nextValue);
	}
} satisfies typeof themeStore;

export const setTheme = (value: Theme) => {
	theme.set(value);
};

export const toggleTheme = () => {
	theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
};


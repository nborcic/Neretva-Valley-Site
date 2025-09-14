import type { PageLoad } from './$types';

const CACHE_KEY = 'neretva-weather:towns';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

export const load: PageLoad = async ({ data }) => {
    if (typeof window === 'undefined') {
        return data;
    }

    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as { ts: number; towns: unknown };
            if (Date.now() - parsed.ts < TTL_MS) {
                return { towns: parsed.towns } as any;
            }
        }
    } catch {}

    // Fallback to server-provided data, then cache it
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), towns: data.towns }));
    } catch {}
    return data;
};


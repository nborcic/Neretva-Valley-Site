type CacheStoreEntry<T> = {
	value: T;
	etag?: string;
	metadata?: Record<string, unknown>;
	expiresAt: number;
};

export type CacheHit<T> = {
	value: T;
	etag?: string;
	metadata?: Record<string, unknown>;
	expiresAt: number;
	isStale: boolean;
};

export interface TtlCache<T> {
	get(key: string): CacheHit<T> | null;
	set(
		key: string,
		value: T,
		options?: { ttlMs?: number; etag?: string; metadata?: Record<string, unknown> }
	): CacheHit<T>;
	delete(key: string): void;
	clear(): void;
}

type CacheOptions = {
	defaultTtlMs?: number;
	now?: () => number;
};

export function createTtlCache<T>({ defaultTtlMs = 300_000, now }: CacheOptions = {}): TtlCache<T> {
	const store = new Map<string, CacheStoreEntry<T>>();
	const getNow = now ?? (() => Date.now());

	const get = (key: string): CacheHit<T> | null => {
		const entry = store.get(key);
		if (!entry) return null;

		const currentTime = getNow();
		const isStale = entry.expiresAt <= currentTime;

		return {
			value: entry.value,
			etag: entry.etag,
			metadata: entry.metadata,
			expiresAt: entry.expiresAt,
			isStale
		};
	};

	const set: TtlCache<T>['set'] = (key, value, options) => {
		const ttlMs = options?.ttlMs ?? defaultTtlMs;
		const expiresAt = getNow() + ttlMs;
		const entry: CacheStoreEntry<T> = {
			value,
			etag: options?.etag,
			metadata: options?.metadata,
			expiresAt
		};

		store.set(key, entry);

		return {
			value: entry.value,
			etag: entry.etag,
			metadata: entry.metadata,
			expiresAt: entry.expiresAt,
			isStale: false
		};
	};

	const del = (key: string) => {
		store.delete(key);
	};

	const clear = () => {
		store.clear();
	};

	return { get, set, delete: del, clear };
}

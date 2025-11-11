import { performance } from 'node:perf_hooks';

type LogLevel = 'info' | 'warn' | 'error';

export type ObservabilityEvent = {
	name: string;
	status: 'success' | 'error';
	level?: LogLevel;
	durationMs: number;
	timestamp: string;
	context?: Record<string, unknown>;
	error?: { message: string; stack?: string };
};

type ObservabilityLogger = (event: ObservabilityEvent) => void;

let logger: ObservabilityLogger = (event) => {
	const { name, status, durationMs, context, error } = event;
	const payload = { status, durationMs, ...(context ?? {}) };

	if (status === 'error') {
		console.error(`[observability] ${name}`, { ...payload, error });
	} else {
		console.info(`[observability] ${name}`, payload);
	}
};

export function setObservabilityLogger(customLogger: ObservabilityLogger) {
	logger = customLogger;
}

export async function trackAsync<T>(
	name: string,
	fn: () => Promise<T>,
	context?: Record<string, unknown>
): Promise<T> {
	const start = performance.now();

	try {
		const result = await fn();
		logger({
			name,
			status: 'success',
			level: 'info',
			durationMs: performance.now() - start,
			timestamp: new Date().toISOString(),
			context
		});
		return result;
	} catch (error) {
		const err = normalizeError(error);
		logger({
			name,
			status: 'error',
			level: 'error',
			durationMs: performance.now() - start,
			timestamp: new Date().toISOString(),
			context,
			error: err
		});
		throw error;
	}
}

const normalizeError = (error: unknown): { message: string; stack?: string } => {
	if (error instanceof Error) {
		return { message: error.message, stack: error.stack };
	}

	return { message: typeof error === 'string' ? error : 'Unknown error' };
};



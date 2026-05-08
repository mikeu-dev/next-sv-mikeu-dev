import fs from 'fs';
import path from 'path';
import { dev } from '$app/environment';

const CACHE_DIR = path.join(process.cwd(), '.cache');

if (dev && !fs.existsSync(CACHE_DIR)) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export const persistentCache = {
	get<T>(key: string): T | null {
		if (!dev) return null;
		const filePath = path.join(CACHE_DIR, `${key}.json`);
		if (!fs.existsSync(filePath)) return null;

		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			return JSON.parse(content) as T;
		} catch {
			return null;
		}
	},

	set<T>(key: string, data: T): void {
		if (!dev) return;
		const filePath = path.join(CACHE_DIR, `${key}.json`);
		try {
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
		} catch (error) {
			console.error(`Failed to write persistent cache for ${key}:`, error);
		}
	},

	clear(key?: string): void {
		if (!dev) return;
		if (key) {
			const filePath = path.join(CACHE_DIR, `${key}.json`);
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
		} else {
			if (fs.existsSync(CACHE_DIR)) {
				fs.readdirSync(CACHE_DIR).forEach((file) => {
					fs.unlinkSync(path.join(CACHE_DIR, file));
				});
			}
		}
	}
};

import { env } from '$env/dynamic/public';

/**
 * Image Optimization Utility
 * 
 * Uses ImageKit or similar proxy to transform raw URLs into optimized assets.
 * Usage: optimizeImage(project.thumbnailUrl, { width: 800, quality: 80 })
 */
interface OptimizeOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'auto' | 'webp' | 'avif';
	blur?: number;
}

export function optimizeImage(url: string | undefined | null, options: OptimizeOptions = {}): string {
	if (!url) return '';
	
	const cdnUrl = env.PUBLIC_IMAGE_CDN_URL;
	
	// If no CDN is configured, return the original URL
	if (!cdnUrl) return url;

	const {
		width,
		height,
		quality = 80,
		format = 'auto',
		blur
	} = options;

	// ImageKit Transformation Mapping
	const transforms: string[] = [];
	if (width) transforms.push(`w-${width}`);
	if (height) transforms.push(`h-${height}`);
	if (quality) transforms.push(`q-${quality}`);
	if (format) transforms.push(`f-${format}`);
	if (blur) transforms.push(`bl-${blur}`);

	const transformString = transforms.length > 0 ? `tr:${transforms.join(',')}/` : '';

	// If it's already a full URL (like Firebase), we proxy it
	// ImageKit proxy pattern: https://ik.imagekit.io/<ID>/tr:w-300/<FULL_URL>
	if (url.startsWith('http')) {
		return `${cdnUrl.replace(/\/$/, '')}/${transformString}${url}`;
	}

	// For relative paths (static assets)
	return `${cdnUrl.replace(/\/$/, '')}/${transformString}${url.replace(/^\//, '')}`;
}

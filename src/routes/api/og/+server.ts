import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const title = url.searchParams.get('title') || 'Mikeu Dev';
	const subtitle = url.searchParams.get('subtitle') || 'Fullstack Web Developer';
	const theme = url.searchParams.get('theme') || 'dark';

	const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
	const text = theme === 'dark' ? '#f1f5f9' : '#0f172a';
	const accent = '#6366f1'; // Indigo

	const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${bg === '#0f172a' ? '#1e293b' : '#f1f5f9'};stop-opacity:1" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accent}" stroke-width="0.5" stroke-opacity="0.1"/>
            </pattern>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#grad)" />
        <rect width="1200" height="630" fill="url(#grid)" />

        <!-- Accent circles -->
        <circle cx="1100" cy="100" r="150" fill="${accent}" fill-opacity="0.05" />
        <circle cx="100" cy="530" r="100" fill="${accent}" fill-opacity="0.05" />

        <!-- Left Border Accent -->
        <rect width="10" height="630" fill="${accent}" />

        <!-- Text Content -->
        <g transform="translate(80, 240)">
            <text x="0" y="0" font-family="sans-serif" font-size="24" font-weight="600" fill="${accent}" letter-spacing="2">
                WWW.MIKEUDEV.MY.ID
            </text>
            <text x="0" y="80" font-family="sans-serif" font-size="72" font-weight="800" fill="${text}">
                ${title.length > 35 ? title.substring(0, 35) + '...' : title}
            </text>
            <text x="0" y="160" font-family="sans-serif" font-size="32" fill="${text}" fill-opacity="0.7">
                ${subtitle.length > 60 ? subtitle.substring(0, 60) + '...' : subtitle}
            </text>
        </g>

        <!-- Decorative Elements -->
        <g transform="translate(1050, 550)">
             <rect width="40" height="10" rx="5" fill="${accent}" />
             <rect x="50" width="20" height="10" rx="5" fill="${accent}" fill-opacity="0.5" />
        </g>
    </svg>
    `.trim();

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=604800, immutable'
		}
	});
};

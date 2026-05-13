/**
 * Shaders for the Folded World visualization.
 */

export const vertexShader = /* glsl */ `
	uniform float uTime;
	uniform float uAssembleProgress;
	uniform float uMaxExtrusion;
	uniform float uPlanetStyle;

	attribute float vDataIntensity;
	attribute vec3 aScatterOffset;
	attribute float foldOffset;
	attribute vec3 aBarycentric;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vLocalPosition;
	varying vec3 vBarycentric;

	void main() {
		vIntensity = vDataIntensity;
		vLocalPosition = position;
		
		vNormal = normalize(normalMatrix * normal);

		// Current position based on assembly progress
		vec3 pos = mix(aScatterOffset, position, uAssembleProgress);
		
		// 1. Add Origami Texture (Static brutalist folds)
		// We use foldOffset which is pre-calculated per vertex
		float origamiEffect = foldOffset * 0.06; // Origami feel: sharp but controlled
		
		// 2. Add Data Extrusion (Folded World effect based on visitor intensity)
		float dataExtrusion = vDataIntensity * uMaxExtrusion;
		
		// Combine both and apply based on assembly progress
		float totalExtrusion = (origamiEffect + dataExtrusion) * uAssembleProgress;
		pos += normal * totalExtrusion;

		// Add subtle swirl during assembly
		float swirl = foldOffset * (1.0 - uAssembleProgress) * 2.0;
		float s = sin(swirl);
		float c = cos(swirl);
		pos.xz = mat2(c, -s, s, c) * pos.xz;

		vBarycentric = aBarycentric;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
	}
`;

export const fragmentShader = /* glsl */ `
	uniform sampler2D uWorldMask;
	uniform vec3 uColorCold;
	uniform vec3 uColorHot;
	uniform vec3 uNeonColor;
	uniform vec3 uAccentColor;
	uniform vec3 uTimeColor;
	uniform float uHoveredIntensity;
	uniform vec3 uHoverPos;
	uniform float uHoverRadius;
	uniform float uFocusMode;
	uniform float uHoverActive;
	uniform int uMode;
	uniform float uTime;
	uniform float uPlanetStyle; // 0=earth, 1=mercury, 2=venus, 3=mars, 4=jupiter, 5=saturn, 6=uranus, 7=neptune
	uniform vec3 uWireColor;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vLocalPosition;
	varying vec3 vBarycentric;

	#define PI 3.14159265359

	float hash(vec2 p) {
		p = fract(p * vec2(123.34, 456.21));
		p += dot(p, p + 45.32);
		return fract(p.x * p.y);
	}

	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		float a = hash(i);
		float b = hash(i + vec2(1.0, 0.0));
		float c = hash(i + vec2(0.0, 1.0));
		float d = hash(i + vec2(1.0, 1.0));
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
	}

	float fbm(vec2 p) {
		float v = 0.0;
		float a = 0.5;
		vec2 shift = vec2(100.0);
		for (int i = 0; i < 4; ++i) {
			v += a * noise(p);
			p = p * 2.0 + shift;
			a *= 0.5;
		}
		return v;
	}

	// Voronoi for craters
	float voronoi(vec2 x) {
		vec2 n = floor(x);
		vec2 f = fract(x);
		float min_dist = 1.0;
		for (int j = -1; j <= 1; j++) {
			for (int i = -1; i <= 1; i++) {
				vec2 b = vec2(float(i), float(j));
				vec2 r = b - f + hash(n + b);
				float d = dot(r, r);
				if (d < min_dist) min_dist = d;
			}
		}
		return sqrt(min_dist);
	}

	void main() {
		vec3 nPos = normalize(vLocalPosition);
		float u = atan(nPos.x, nPos.z) / (2.0 * PI) + 0.5;
		float v = (asin(nPos.y) / PI + 0.5) * 0.5 + 0.5;
		
		float mask = texture2D(uWorldMask, vec2(u, v)).r;

		vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
		float diffuse = max(dot(vNormal, lightDir), 0.0);
		float ambient = 0.3;
		// Stepped lighting to emphasize origami facets (sharp transitions)
		float lighting = ambient + 
			smoothstep(0.2, 0.22, diffuse) * 0.3 + 
			smoothstep(0.5, 0.52, diffuse) * 0.3 + 
			smoothstep(0.8, 0.82, diffuse) * 0.2;

		vec3 finalColor;
		vec3 planetBase;

		// --- Planet Logic ---
		if (uPlanetStyle == 1.0) { // MERCURY
			float craters = 1.0 - voronoi(vec2(u * 40.0, v * 40.0));
			float d = fbm(vec2(u * 20.0, v * 20.0));
			planetBase = mix(uColorCold, uColorHot, d * 0.5 + pow(craters, 4.0) * 0.5);
		} else if (uPlanetStyle == 2.0) { // VENUS
			float clouds1 = fbm(vec2(u * 5.0 + uTime * 0.02, v * 5.0));
			float clouds2 = fbm(vec2(u * 10.0 - uTime * 0.01, v * 10.0));
			float lava = fbm(vec2(u * 20.0, v * 20.0));
			planetBase = mix(uColorCold, uColorHot, clouds1 * 0.7 + clouds2 * 0.3);
			planetBase += vec3(1.0, 0.4, 0.0) * pow(lava, 10.0) * 0.5; // Lava glow
		} else if (uPlanetStyle == 3.0) { // MARS
			float d = fbm(vec2(u * 15.0, v * 15.0));
			float dunes = sin(u * 100.0 + fbm(vec2(u, v) * 10.0) * 5.0) * 0.05;
			planetBase = mix(uColorCold, uColorHot, d + dunes);
			float cap = smoothstep(0.85, 0.95, abs(nPos.y));
			planetBase = mix(planetBase, vec3(1.0, 0.95, 1.0), cap);
		} else if (uPlanetStyle == 4.0) { // JUPITER
			vec2 p = vec2(u * 15.0, v * 10.0);
			float swirl = fbm(p + fbm(p + uTime * 0.05));
			planetBase = mix(uColorCold, uColorHot, swirl);
			float spotDist = distance(vec2(u, v), vec2(0.7, 0.4));
			float spot = 1.0 - smoothstep(0.0, 0.07, spotDist);
			planetBase = mix(planetBase, vec3(0.6, 0.1, 0.0), spot * 0.8);
		} else if (uPlanetStyle == 5.0) { // SATURN
			float bands = sin(v * 100.0 + fbm(vec2(u * 2.0, v * 10.0)) * 8.0);
			planetBase = mix(uColorCold, uColorHot, smoothstep(-0.2, 0.2, bands));
			planetBase *= (0.9 + fbm(vec2(u * 20.0, v * 20.0)) * 0.2);
		} else if (uPlanetStyle == 6.0) { // URANUS
			float noise1 = fbm(vec2(u * 5.0, v * 30.0 + uTime * 0.01));
			planetBase = mix(uColorCold, uColorHot, noise1 * 0.5 + 0.25);
		} else if (uPlanetStyle == 7.0) { // NEPTUNE
			float noise1 = fbm(vec2(u * 10.0 + uTime * 0.03, v * 10.0));
			planetBase = mix(uColorCold, uColorHot, noise1);
			float spotDist = distance(vec2(u, v), vec2(0.3, 0.6));
			float spot = 1.0 - smoothstep(0.0, 0.12, spotDist);
			planetBase = mix(planetBase, vec3(0.0, 0.1, 0.4), spot * 0.7);
			float clouds = pow(fbm(vec2(u * 20.0 + uTime * 0.05, v * 20.0)), 5.0);
			planetBase += vec3(1.0) * clouds * 0.5;
		} else { // EARTH
			planetBase = mix(uColorCold, uColorHot * 0.2, vIntensity);
		}

		if (uMode == 0) {
			float dataMask = smoothstep(0.0, 0.2, vIntensity);
			vec3 surface = planetBase * lighting;
			
			vec3 neon = uNeonColor * (2.0 + vIntensity * 1.0);
			float pulse = sin(uTime * 3.0 + vIntensity * 10.0) * 0.3 + 0.7;
			vec3 glow = uNeonColor * vIntensity * 3.0 * pulse;
			
			finalColor = mix(surface, neon, dataMask) + glow;
			
			// Continental silhouette (very subtle for non-earth)
			float maskStrength = uPlanetStyle == 0.0 ? 0.25 : 0.05;
			finalColor += mask * maskStrength;
		} else if (uMode == 1) { // HEAT MODE (Thermal Visualization)
			// Boosted thermal ramp for better visibility
			float thermalIntensity = smoothstep(0.0, 0.8, vIntensity);
			vec3 thermal = mix(uColorCold, uColorHot, thermalIntensity);
			
			// Add a second ramp for extreme hotspots
			float hotspot = smoothstep(0.7, 1.0, vIntensity);
			thermal = mix(thermal, vec3(1.0, 0.9, 0.5), hotspot); // White-yellow for extreme peaks
			
			// Add a persistent thermal glow to data areas
			float glow = pow(vIntensity, 2.0) * 0.8;
			finalColor = thermal * (lighting + 0.5) + (uColorHot * glow);
			
			// Subtle planetary context
			finalColor = mix(finalColor, planetBase * lighting, 0.1);
			finalColor += mask * 0.1;
		} else { // TIME MODE (Temporal Pulse / Radar)
			// Higher frequency wave
			float wave = fract(vIntensity * 8.0 - uTime * 0.4);
			float scanline = smoothstep(0.0, 0.05, wave) * (1.0 - smoothstep(0.05, 0.15, wave));
			
			// Stronger pulse intensity
			float pulse = sin(uTime * 4.0 + vIntensity * 12.0) * 0.5 + 0.5;
			
			// Vibrant violet ramp
			vec3 timeColor = mix(uColorCold * 0.5, uTimeColor, vIntensity);
			timeColor = mix(timeColor, uTimeColor * 1.5, scanline * vIntensity);
			
			finalColor = timeColor * lighting;
			finalColor += uTimeColor * scanline * vIntensity * 3.5; // Brighter scanline
			finalColor += uTimeColor * vIntensity * pulse * 1.2; // Stronger soft pulse
			
			// Very faint planetary context
			finalColor = mix(finalColor, planetBase * lighting, 0.05);
			finalColor += mask * 0.05;
		}

		// Position-based hover highlight (Precise selection)
		float hoverDist = distance(vLocalPosition, uHoverPos);
		float hoverGlow = 1.0 - smoothstep(0.0, uHoverRadius, hoverDist);
		
		// Data Isolation Mode: Discard fragments with no data
		if (uFocusMode > 0.5 && vIntensity < 0.05 && hoverGlow < 0.1) {
			discard;
		}

		if (uHoverActive > 0.5) {
			finalColor = mix(finalColor, uAccentColor, hoverGlow * 0.8);
		}

		float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
		finalColor += (grain - 0.5) * 0.04;

		// --- Global Origami Stroke (Garis Tepi Seluruh Planet) ---
		// Use barycentric coordinates for sharp constant-width edges
		vec3 d = fwidth(vBarycentric);
		vec3 a3 = smoothstep(vec3(0.0), d * 0.5, vBarycentric); // Very sharp edge
		float edge = min(min(a3.x, a3.y), a3.z);
		
		// Adaptive stroke color: 
		// Background uses theme wireframe color, nodes use sharp black/white
		vec3 strokeBase = uWireColor;
		vec3 nodeStroke = vec3(0.0); // Black for data
		
		vec3 strokeColor = mix(strokeBase, nodeStroke, smoothstep(0.0, 0.1, vIntensity));
		
		// Hover effect: Bright white stroke
		if (uHoverActive > 0.5) {
			float hoverDist = distance(vLocalPosition, uHoverPos);
			float hoverGlow = 1.0 - smoothstep(0.0, uHoverRadius, hoverDist);
			strokeColor = mix(strokeColor, vec3(1.0), hoverGlow);
		}
		
		finalColor = mix(strokeColor, finalColor, edge);

		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

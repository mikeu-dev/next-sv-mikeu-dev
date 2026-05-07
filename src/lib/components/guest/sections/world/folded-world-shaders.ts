/**
 * Folded World — GLSL Shaders
 *
 * Custom vertex & fragment shaders untuk efek fold/distortion
 * pada faceted globe mesh. Menggunakan flat shading dan
 * monochrome gradient berbasis intensitas visitor.
 */

/**
 * Vertex shader — menangani deformasi mesh.
 *
 * Attributes:
 * - intensity: float [0..1] — visitor density per face
 * - foldOffset: float — paper fold micro-displacement
 *
 * Uniforms:
 * - uMaxExtrusion: float — max displacement distance
 * - uTime: float — animation time
 * - uMode: int — 0=fold, 1=heat, 2=timeline
 */
export const vertexShader = /* glsl */ `
	attribute float vDataIntensity;
	attribute float foldOffset;
	attribute vec3 aScatterOffset;

	uniform float uMaxExtrusion;
	uniform float uTime;
	uniform int uMode;
	uniform float uAssembleProgress;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vLocalPosition;

	void main() {
		vIntensity = vDataIntensity;
		vLocalPosition = position;
		vNormal = normalize(normalMatrix * normal);

		vec3 pos = position;

		// Mode 0: FOLD
		if (uMode == 0) {
			float extrusion = vDataIntensity * uMaxExtrusion;
			float fold = foldOffset * 0.03 * (1.0 + vDataIntensity * 2.0);
			pos += normal * (extrusion + fold);
		} 
		// Mode 2: TIME
		else if (uMode == 2) {
			float wave = sin(uTime * 0.5 + vDataIntensity * 6.28318) * 0.05;
			pos += normal * (vDataIntensity * uMaxExtrusion * 0.5 + wave);
		}
		// Mode 1 (HEAT) stays flat but we set intensity
		else {
			vIntensity = vDataIntensity;
		}

		// Base bias to prevent z-fighting with wireframe
		pos += normal * 0.002;

		// Morph assembly transition (Origami compiling effect)
		pos += aScatterOffset * (1.0 - uAssembleProgress);

		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
	}
`;

/**
 * Fragment shader — monochrome gradient dengan accent highlights.
 *
 * Uniforms:
 * - uColorCold: vec3 — color untuk low intensity
 * - uColorHot: vec3 — color untuk high intensity
 * - uAccentColor: vec3 — highlight color (red accent)
 * - uHoveredIntensity: float — intensity dari hovered face (-1 jika none)
 * - uMode: int — visualization mode
 * - uTime: float — animation time
 */
export const fragmentShader = /* glsl */ `
	uniform sampler2D uWorldMask;
	uniform vec3 uColorCold;
	uniform vec3 uColorHot;
	uniform vec3 uNeonColor;
	uniform vec3 uAccentColor;
	uniform float uHoveredIntensity;
	uniform int uMode;
	uniform float uTime;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vLocalPosition;

	#define PI 3.14159265359

	void main() {
		// Calculate UV using Local Position so it rotates with the mesh
		vec3 nPos = normalize(vLocalPosition);
		
		// Improved UV mapping for equirectangular projection with 180-degree phase shift to align mask
		float u = fract(atan(nPos.z, -nPos.x) / (2.0 * PI) + 0.5);
		float v = 1.0 - acos(nPos.y) / PI;
		
		// Sample world mask (continents)
		float mask = texture2D(uWorldMask, vec2(u, v)).r;

		// Directional lighting (more balanced)
		vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
		float diffuse = max(dot(vNormal, lightDir), 0.0);
		float ambient = 0.5; // Brighter ambient
		float lighting = ambient + diffuse * 0.5;

		// Base color initialization
		vec3 finalColor;

		if (uMode == 0) {
			// --- FOLD MODE: High Visibility Neon ---
			// Very sensitive mask
			float dataMask = smoothstep(0.0, 0.2, vIntensity);
			
			// Surface background
			vec3 surface = mix(uColorCold, uColorHot * 0.2, vIntensity) * lighting;
			
			// Neon data color (Emissive) — Higher base brightness
			vec3 neon = uNeonColor * (2.0 + vIntensity * 1.0);
			
			// Pulsing glow (attached to data) — More intense
			float pulse = sin(uTime * 3.0 + vIntensity * 10.0) * 0.3 + 0.7;
			vec3 glow = uNeonColor * vIntensity * 3.0 * pulse;
			
			// Combine
			finalColor = mix(surface, neon, dataMask) + glow;
			
			// Continent highlight
			finalColor += mask * 0.2;
		} else if (uMode == 1) {
			// --- HEAT MODE: Thermal Style ---
			vec3 heatColor = mix(uColorCold, uAccentColor, pow(vIntensity, 1.2));
			finalColor = (heatColor + mask * 0.1) * lighting;
		} else {
			// --- TIMELINE MODE: Pulse Style ---
			float pulse = sin(uTime * 2.0 + vIntensity * 6.28318) * 0.5 + 0.5;
			vec3 baseColor = mix(uColorCold, uColorHot, pow(vIntensity, 1.5));
			finalColor = baseColor * lighting;
			finalColor += uAccentColor * vIntensity * pulse * 0.3;
			finalColor += mask * 0.05;
		}

		// Hover highlight — sharp edge glow
		if (uHoveredIntensity >= 0.0 && abs(vIntensity - uHoveredIntensity) < 0.01) {
			finalColor = mix(finalColor, uAccentColor, 0.6);
		}

		// Film grain effect (brutalist texture)
		float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
		finalColor += (grain - 0.5) * 0.04;

		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

/**
 * Wireframe vertex shader — simpel pass-through.
 */
export const wireframeVertexShader = /* glsl */ `
	attribute float vDataIntensity;
	attribute float foldOffset;
	attribute vec3 aScatterOffset;

	uniform float uMaxExtrusion;
	uniform int uMode;
	uniform float uTime;
	uniform float uAssembleProgress;

	void main() {
		vec3 pos = position;

		if (uMode == 0) {
			float extrusion = vDataIntensity * uMaxExtrusion;
			float fold = foldOffset * 0.03 * (1.0 + vDataIntensity * 2.0);
			pos += normal * (extrusion + fold);
		} else if (uMode == 2) {
			float wave = sin(uTime * 0.5 + vDataIntensity * 6.28318) * 0.05;
			pos += normal * (vDataIntensity * uMaxExtrusion * 0.5 + wave);
		}

		// Wireframe slightly behind main mesh
		pos += normal * 0.001;

		// Morph assembly transition
		pos += aScatterOffset * (1.0 - uAssembleProgress);

		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
	}
`;

/**
 * Wireframe fragment shader — constant color dengan opacity.
 */
export const wireframeFragmentShader = /* glsl */ `
	uniform vec3 uWireColor;
	uniform float uOpacity;

	void main() {
		gl_FragColor = vec4(uWireColor, uOpacity);
	}
`;

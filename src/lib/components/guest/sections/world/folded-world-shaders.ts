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
	attribute float intensity;
	attribute float foldOffset;

	uniform float uMaxExtrusion;
	uniform float uTime;
	uniform int uMode;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vWorldPosition;

	void main() {
		vIntensity = intensity;
		vNormal = normalize(normalMatrix * normal);

		vec3 pos = position;

		if (uMode == 0) {
			// FOLD mode — extrude vertices outward based on intensity
			float extrusion = intensity * uMaxExtrusion;
			// Add paper fold micro-displacement
			float fold = foldOffset * 0.03 * (1.0 + intensity * 2.0);
			pos += normal * (extrusion + fold);
		} else if (uMode == 2) {
			// TIMELINE mode — layer stack effect
			float wave = sin(uTime * 0.5 + intensity * 6.28318) * 0.05;
			pos += normal * (intensity * uMaxExtrusion * 0.5 + wave);
		}
		// HEAT mode (1) — no vertex displacement

		vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

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
	uniform vec3 uColorCold;
	uniform vec3 uColorHot;
	uniform vec3 uAccentColor;
	uniform float uHoveredIntensity;
	uniform int uMode;
	uniform float uTime;

	varying float vIntensity;
	varying vec3 vNormal;
	varying vec3 vWorldPosition;

	void main() {
		// Base color: interpolate between cold and hot
		vec3 baseColor = mix(uColorCold, uColorHot, vIntensity);

		// Directional lighting (brutalist — harsh, single light)
		vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
		float diffuse = max(dot(vNormal, lightDir), 0.0);
		float ambient = 0.2;
		float lighting = ambient + diffuse * 0.8;

		vec3 finalColor = baseColor * lighting;

		// HEAT mode — more saturated color range
		if (uMode == 1) {
			vec3 heatColor = mix(
				vec3(0.1, 0.1, 0.12),  // cold: dark blue-gray
				uAccentColor,            // hot: red accent
				pow(vIntensity, 1.5)
			);
			finalColor = heatColor * lighting;
		}

		// TIMELINE mode — pulsing glow
		if (uMode == 2) {
			float pulse = sin(uTime * 2.0 + vIntensity * 6.28318) * 0.5 + 0.5;
			finalColor += uAccentColor * vIntensity * pulse * 0.3;
		}

		// Hover highlight — sharp edge glow
		if (uHoveredIntensity >= 0.0 && abs(vIntensity - uHoveredIntensity) < 0.01) {
			finalColor = mix(finalColor, uAccentColor, 0.6);
		}

		// Film grain effect (brutalist texture)
		float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
		finalColor += (grain - 0.5) * 0.03;

		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

/**
 * Wireframe vertex shader — simpel pass-through.
 */
export const wireframeVertexShader = /* glsl */ `
	attribute float intensity;
	attribute float foldOffset;

	uniform float uMaxExtrusion;
	uniform int uMode;
	uniform float uTime;

	void main() {
		vec3 pos = position;

		if (uMode == 0) {
			float extrusion = intensity * uMaxExtrusion;
			float fold = foldOffset * 0.03 * (1.0 + intensity * 2.0);
			pos += normal * (extrusion + fold);
		} else if (uMode == 2) {
			float wave = sin(uTime * 0.5 + intensity * 6.28318) * 0.05;
			pos += normal * (intensity * uMaxExtrusion * 0.5 + wave);
		}

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

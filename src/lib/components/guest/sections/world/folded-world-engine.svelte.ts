/**
 * Folded World — Three.js Reactive Engine
 *
 * Svelte 5 reactive module yang mengelola Three.js scene,
 * icosahedron mesh, deformasi, dan interaksi.
 *
 * Menggunakan runes ($state, $derived, $effect) untuk integrasi
 * seamless dengan Svelte reactivity system.
 */

import type {
	GeoNode,
	ViewMode,
	WorldConfig,
	TooltipData,
	DetailPanelData
} from './folded-world.types';
import {
	mapNodesToFaces,
	faceCenter,
	paperFoldDisplacement,
	findNearestNode
} from './folded-world-geometry';
import { getPlanetColors, DEFAULT_WORLD_CONFIG } from './folded-world.types';
import type { PlanetStyle } from './folded-world.types';
import { vertexShader, fragmentShader } from './folded-world-shaders';

// Three.js types — imported dynamically at runtime
type ThreeModule = typeof import('three');

interface EngineState {
	ready: boolean;
	loading: boolean;
	error: string | null;
	fps: number;
	faceCount: number;
	nodeCount: number;
}

/**
 * Create a Folded World engine instance.
 * Call init() to start the Three.js scene, destroy() to clean up.
 */
export function createFoldedWorldEngine() {
	// --- Reactive State ---
	const state = $state<EngineState>({
		ready: false,
		loading: true,
		error: null,
		fps: 0,
		faceCount: 0,
		nodeCount: 0
	});

	let viewMode = $state<ViewMode>('fold');
	let planetStyle = $state<PlanetStyle>('earth');
	let tooltip = $state<TooltipData>({ visible: false, x: 0, y: 0, node: null });
	let detailPanel = $state<DetailPanelData>({ visible: false, node: null });
	let isFocusMode = $state(false);
	const config = $state<WorldConfig>({ ...DEFAULT_WORLD_CONFIG });

	// --- Internal State (non-reactive) ---
	let THREE: ThreeModule;
	let renderer: InstanceType<ThreeModule['WebGLRenderer']>;
	let scene: InstanceType<ThreeModule['Scene']>;
	let camera: InstanceType<ThreeModule['PerspectiveCamera']>;
	let mainMesh: InstanceType<ThreeModule['Mesh']>;
	let ringMesh: InstanceType<ThreeModule['Mesh']>;
	let particlesMesh: InstanceType<ThreeModule['Points']> | null = null;
	let mainMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
	let ringMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
	let raycaster: InstanceType<ThreeModule['Raycaster']>;
	let mouseVec: InstanceType<ThreeModule['Vector2']>;

	let animationId: number | null = null;
	let startTime = 0;
	let lastFrameTime = 0;
	let frameCount = 0;
	let fpsAccumulator = 0;
	let isMouseDown = false;
	let prevMouseX = 0;
	let prevMouseY = 0;
	let rotationX = 0;
	let rotationY = 0;
	let targetZoom = 3.5;
	let currentZoom = 3.5;
	let autoRotateAngle = 0;
	let assembleProgress = 0.0;
	let modeTransitionPhase = 0.0;
	let pendingMode: ViewMode | null = null;
	let shaderViewMode: ViewMode = 'fold';
	let isMinimal = false;
	let canvasEl: HTMLCanvasElement | null = null;
	let containerEl: HTMLElement | null = null;
	let geoNodes: GeoNode[] = [];
	let faceCentersCache: [number, number][] = [];
	let isDestroyed = false;

	// --- Public Methods ---

	/**
	 * Initialize the Three.js scene.
	 * Must be called after the canvas is mounted in the DOM.
	 */
	async function init(
		container: HTMLElement,
		canvas: HTMLCanvasElement,
		nodes: GeoNode[],
		isDark: boolean = true,
		minimal: boolean = false
	): Promise<void> {
		isMinimal = minimal;
		containerEl = container;
		canvasEl = canvas;
		geoNodes = nodes;
		isDestroyed = false;

		state.loading = true;
		state.error = null;

		try {
			// Dynamic import Three.js — keeps it out of main bundle
			THREE = await import('three');

			setupScene(isDark);
			buildGlobe(isDark);
			if (config.enableParticles) {
				try {
					buildParticles(isDark);
				} catch (e) {
					console.error('Failed to build particles:', e);
				}
			}
			applyDeformations();

			if (!isMinimal) {
				setupEventListeners();
			}

			state.ready = true;
			state.loading = false;
			state.nodeCount = nodes.length;

			console.log('Folded World Engine: Initialization successful');

			// Start render loop
			startTime = performance.now();
			lastFrameTime = startTime;
			animate();
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to initialize 3D engine';
			state.loading = false;
			console.error('FoldedWorldEngine: Init failed', err);
		}
	}

	/**
	 * Update geo data dan rebuild deformasi.
	 */
	function updateNodes(nodes: GeoNode[]): void {
		geoNodes = nodes;
		state.nodeCount = nodes.length;
		if (state.ready) {
			applyDeformations();
		}
	}

	/**
	 * Clean up semua resources.
	 */
	function destroy(): void {
		isDestroyed = true;
		if (animationId !== null) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		removeEventListeners();

		if (mainMesh) {
			mainMesh.geometry.dispose();
		}
		if (ringMesh) {
			ringMesh.geometry.dispose();
		}
		if (mainMaterial) mainMaterial.dispose();
		if (ringMaterial) ringMaterial.dispose();
		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss();
		}

		state.ready = false;
	}

	// --- Scene Setup ---

	function setupScene(isDark: boolean): void {
		if (!canvasEl || !containerEl) return;

		const colors = getPlanetColors(planetStyle, isDark);

		const width = containerEl.clientWidth;
		const height = containerEl.clientHeight;

		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvasEl,
			antialias: true,
			alpha: true, // Enable transparency for CSS background
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(colors.background, 0); // Set alpha to 0

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

		// Adjust zoom for minimal teaser mode
		if (isMinimal) {
			targetZoom = 4.0;
			currentZoom = 4.0;
		}

		camera.position.set(0, 0, currentZoom);
		camera.lookAt(0, 0, 0);

		// Raycaster for interaction
		raycaster = new THREE.Raycaster();
		mouseVec = new THREE.Vector2();
	}

	function buildGlobe(isDark: boolean): void {
		const colors = getPlanetColors(planetStyle, isDark);
		// Icosahedron geometry — subdivided for more faces
		const detail = config.subdivisions;
		const geometry = new THREE.IcosahedronGeometry(1, detail);

		// Convert to non-indexed for flat shading + per-face attributes (only if indexed)
		const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
		nonIndexed.computeVertexNormals();

		const posAttr = nonIndexed.getAttribute('position');
		const vertexCount = posAttr.count;
		const faceCountVal = vertexCount / 3;

		state.faceCount = faceCountVal;

		// Compute face centers for geo mapping
		faceCentersCache = [];
		for (let i = 0; i < faceCountVal; i++) {
			const i0 = i * 3;
			const v0: [number, number, number] = [posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0)];
			const v1: [number, number, number] = [
				posAttr.getX(i0 + 1),
				posAttr.getY(i0 + 1),
				posAttr.getZ(i0 + 1)
			];
			const v2: [number, number, number] = [
				posAttr.getX(i0 + 2),
				posAttr.getY(i0 + 2),
				posAttr.getZ(i0 + 2)
			];
			faceCentersCache.push(faceCenter(v0, v1, v2));
		}

		// Create per-vertex attributes (same value for all 3 verts in a face)
		const intensities = new Float32Array(vertexCount);
		const foldOffsets = new Float32Array(vertexCount);
		const barycentrics = new Float32Array(vertexCount * 3);
		const scatterOffsets = new Float32Array(vertexCount * 3);

		for (let i = 0; i < vertexCount; i++) {
			const x = posAttr.getX(i);
			const y = posAttr.getY(i);
			const z = posAttr.getZ(i);
			foldOffsets[i] = paperFoldDisplacement(x, y, z);
		}

		// Calculate scatter offsets per face for the assembly animation
		for (let i = 0; i < faceCountVal; i++) {
			const i0 = i * 3;
			const v0x = posAttr.getX(i0),
				v0y = posAttr.getY(i0),
				v0z = posAttr.getZ(i0);
			const v1x = posAttr.getX(i0 + 1),
				v1y = posAttr.getY(i0 + 1),
				v1z = posAttr.getZ(i0 + 1);
			const v2x = posAttr.getX(i0 + 2),
				v2y = posAttr.getY(i0 + 2),
				v2z = posAttr.getZ(i0 + 2);

			const cx = (v0x + v1x + v2x) / 3;
			const cy = (v0y + v1y + v2y) / 3;
			const cz = (v0z + v1z + v2z) / 3;

			// Push strongly outwards + random tangential drift
			const dist = 3.0 + Math.random() * 5.0;
			const rx = cx * dist + (Math.random() - 0.5) * 4.0;
			const ry = cy * dist + (Math.random() - 0.5) * 4.0;
			const rz = cz * dist + (Math.random() - 0.5) * 4.0;

			for (let j = 0; j < 3; j++) {
				const vIndex = i0 + j;
				scatterOffsets[vIndex * 3] = rx;
				scatterOffsets[vIndex * 3 + 1] = ry;
				scatterOffsets[vIndex * 3 + 2] = rz;

				// Barycentric coordinates for edge detection (strokes)
				if (j === 0) {
					barycentrics[vIndex * 3] = 1.0;
					barycentrics[vIndex * 3 + 1] = 0.0;
					barycentrics[vIndex * 3 + 2] = 0.0;
				} else if (j === 1) {
					barycentrics[vIndex * 3] = 0.0;
					barycentrics[vIndex * 3 + 1] = 1.0;
					barycentrics[vIndex * 3 + 2] = 0.0;
				} else {
					barycentrics[vIndex * 3] = 0.0;
					barycentrics[vIndex * 3 + 1] = 0.0;
					barycentrics[vIndex * 3 + 2] = 1.0;
				}
			}
		}

		nonIndexed.setAttribute('vDataIntensity', new THREE.BufferAttribute(intensities, 1));
		nonIndexed.setAttribute('foldOffset', new THREE.BufferAttribute(foldOffsets, 1));
		nonIndexed.setAttribute('aScatterOffset', new THREE.BufferAttribute(scatterOffsets, 3));
		nonIndexed.setAttribute('aBarycentric', new THREE.BufferAttribute(barycentrics, 3));

		// Load world mask texture
		const textureLoader = new THREE.TextureLoader();
		const worldMask = textureLoader.load('/images/world-mask.png');
		worldMask.wrapS = THREE.RepeatWrapping;

		// Main mesh material (custom shader)
		mainMaterial = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uMaxExtrusion: { value: config.maxExtrusion },
				uTime: { value: 0 },
				uMode: { value: 0 },
				uColorCold: { value: new THREE.Color(colors.faceCold) },
				uColorHot: { value: new THREE.Color(colors.faceHot) },
				uAccentColor: { value: new THREE.Color(colors.accent) },
				uHoveredIntensity: { value: -1.0 },
				uHoverPos: { value: new THREE.Vector3(0, 0, 0) },
				uHoverRadius: { value: 0.15 },
				uFocusMode: { value: 0.0 },
				uWireColor: { value: new THREE.Color(colors.wireframe) },
				uOpacity: { value: config.wireframeOpacity },
				uWorldMask: { value: worldMask },
				uNeonColor: { value: new THREE.Color(colors.neon) },
				uTimeColor: { value: new THREE.Color(0xbb66ff) },
				uAssembleProgress: { value: 0.0 },
				uPlanetStyle: { value: 0.0 },
				uHoverActive: { value: 0.0 }
			},
			side: THREE.FrontSide
		});

		mainMesh = new THREE.Mesh(nonIndexed, mainMaterial);
		scene.add(mainMesh);

		// --- Saturn Rings ---
		const ringGeom = new THREE.RingGeometry(1.4, 2.2, 64);
		ringMaterial = new THREE.ShaderMaterial({
			vertexShader: `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				varying vec2 vUv;
				uniform float uTime;
				uniform vec3 uColor;
				void main() {
					// In RingGeometry, vUv.y is the radial coordinate (0=inner, 1=outer)
					float d = vUv.y;
					// Create multiple rings based on radius
					float rings = sin(d * 40.0) * 0.5 + 0.5;
					// Smooth edges
					float alpha = smoothstep(0.0, 0.1, d) * (1.0 - smoothstep(0.9, 1.0, d));
					alpha *= (0.2 + rings * 0.8);
					gl_FragColor = vec4(uColor, alpha * 0.7);
				}
			`,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new THREE.Color(colors.wireframe) }
			},
			transparent: true,
			side: THREE.DoubleSide
		});
		ringMesh = new THREE.Mesh(ringGeom, ringMaterial);
		ringMesh.rotation.x = Math.PI / 2.5; // Tilted rings
		ringMesh.visible = false;
		scene.add(ringMesh);
	}

	function buildParticles(isDark: boolean): void {
		if (!THREE) return;

		const count = 1000;
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(count * 3);
		const sizes = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			const r = 5 + Math.random() * 10;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.random() * Math.PI;

			positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = r * Math.cos(phi);
			sizes[i] = Math.random() * 2;
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

		const material = new THREE.PointsMaterial({
			color: isDark ? 0xffffff : 0x000000,
			size: 0.05,
			transparent: true,
			opacity: 0.4,
			sizeAttenuation: true
		});

		particlesMesh = new THREE.Points(geometry, material);
		scene.add(particlesMesh);
	}

	function applyDeformations(): void {
		if (!mainMesh) return;

		const geometry = mainMesh.geometry;
		const intensityAttr = geometry.getAttribute('vDataIntensity');

		// Map geo nodes to face intensities (0.15 radians ~ 8.5 degrees ~ 1000km localized radius)
		// Increased from 0.04 to 0.15 to ensure visibility of visitor data "peaks".
		const faceIntensities = mapNodesToFaces(faceCentersCache, geoNodes, 0.15);

		// Spread face intensity to all 3 vertices of each face
		for (let face = 0; face < faceIntensities.length; face++) {
			const intensity = faceIntensities[face];
			intensityAttr.setX(face * 3, intensity);
			intensityAttr.setX(face * 3 + 1, intensity);
			intensityAttr.setX(face * 3 + 2, intensity);
		}

		intensityAttr.needsUpdate = true;
	}

	// --- Animation Loop ---

	function animate(): void {
		if (isDestroyed) return;

		animationId = requestAnimationFrame(animate);

		const now = performance.now();
		const elapsed = (now - startTime) / 1000;
		const delta = (now - lastFrameTime) / 1000;
		lastFrameTime = now;

		// FPS counter
		frameCount++;
		fpsAccumulator += delta;
		if (fpsAccumulator >= 1) {
			state.fps = Math.round(frameCount / fpsAccumulator);
			frameCount = 0;
			fpsAccumulator = 0;
		}

		// Auto-rotate
		if (!isMouseDown) {
			autoRotateAngle += config.autoRotateSpeed * delta;
		}

		// Morph assembly animation (Initial Load)
		if (assembleProgress < 1.0) {
			assembleProgress += delta * 0.4; // Complete in ~2.5 seconds
			if (assembleProgress > 1.0) assembleProgress = 1.0;
		}
		// Smooth step easing out (expo)
		const easedAssemble =
			assembleProgress === 1.0 ? 1.0 : 1.0 - Math.pow(2, -10 * assembleProgress);

		// Mode Switch Pulse (Scatter & Reassemble)
		let modePulse = 0.0;
		if (modeTransitionPhase > 0) {
			if (modeTransitionPhase < 1.0) {
				// Phase 1: Expand with Sine ease-out (0.25s duration)
				modeTransitionPhase += delta * 4.0;
				if (modeTransitionPhase >= 1.0) modeTransitionPhase = 1.0;
				modePulse = Math.sin((modeTransitionPhase * Math.PI) / 2.0);
			} else if (modeTransitionPhase < 2.0) {
				// Phase 2: Apex Hang / Anti-Gravity Float (0.35s duration)
				modeTransitionPhase += delta * 2.8;
				if (modeTransitionPhase >= 2.0) {
					modeTransitionPhase = 2.0;
					if (pendingMode) {
						shaderViewMode = pendingMode; // Change color at the end of the hang
						pendingMode = null;
					}
				}
				// Float gently at the peak (drifts from 1.0 down to 0.95)
				modePulse = 1.0 - (modeTransitionPhase - 1.0) * 0.05;
			} else {
				// Phase 3: Assemble with Expo ease-out (1.2s duration)
				modeTransitionPhase += delta * 0.8;
				if (modeTransitionPhase >= 3.0) {
					modeTransitionPhase = 0.0;
					modePulse = 0.0;
				} else {
					const t = modeTransitionPhase - 2.0;
					modePulse = 0.95 * Math.pow(2, -10 * t);
				}
			}

			// Dynamic spin boost during transition
			if (!isMouseDown) {
				autoRotateAngle += modePulse * delta * 0.15;
			}
		}

		// Final scatter value applied to shader
		const finalAssemble = Math.max(0.0, easedAssemble - modePulse * 0.08);

		// Smooth zoom
		const lerpSpeed = isMinimal ? 0.02 : 0.08;
		currentZoom += (targetZoom - currentZoom) * lerpSpeed;
		camera.position.set(0, 0, currentZoom);

		// Apply rotation
		if (mainMesh) {
			mainMesh.rotation.y = autoRotateAngle + rotationY;
			mainMesh.rotation.x = rotationX;
		}
		if (ringMesh) {
			ringMesh.rotation.y = autoRotateAngle + rotationY;
			// Rings rotate with the planet but keep their tilt
			ringMesh.visible = planetStyle === 'saturn' && assembleProgress === 1.0;
		}

		// Update shader uniforms
		const modeIdx = shaderViewMode === 'fold' ? 0 : shaderViewMode === 'heat' ? 1 : 2;
		const planetIdx =
			planetStyle === 'earth'
				? 0
				: planetStyle === 'mercury'
					? 1
					: planetStyle === 'venus'
						? 2
						: planetStyle === 'mars'
							? 3
							: planetStyle === 'jupiter'
								? 4
								: planetStyle === 'saturn'
									? 5
									: planetStyle === 'uranus'
										? 6
										: 7;

		if (mainMaterial) {
			mainMaterial.uniforms.uTime.value = elapsed;
			mainMaterial.uniforms.uMode.value = modeIdx;
			mainMaterial.uniforms.uAssembleProgress.value = finalAssemble;
			mainMaterial.uniforms.uPlanetStyle.value = planetIdx;
		}

		if (particlesMesh) {
			particlesMesh.rotation.y = elapsed * 0.02;
			particlesMesh.rotation.x = elapsed * 0.01;
		}

		renderer.render(scene, camera);
	}

	// --- Event Handling ---

	function setupEventListeners(): void {
		if (!canvasEl) return;
		canvasEl.addEventListener('mousedown', onMouseDown);
		canvasEl.addEventListener('mousemove', onMouseMove);
		canvasEl.addEventListener('mouseup', onMouseUp);
		canvasEl.addEventListener('mouseleave', onMouseUp);
		canvasEl.addEventListener('wheel', onWheel, { passive: true });
		canvasEl.addEventListener('click', onClick);

		// Touch events
		canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
		canvasEl.addEventListener('touchmove', onTouchMove, { passive: true });
		canvasEl.addEventListener('touchend', onTouchEnd);

		window.addEventListener('resize', onResize);
	}

	function removeEventListeners(): void {
		if (!canvasEl) return;
		canvasEl.removeEventListener('mousedown', onMouseDown);
		canvasEl.removeEventListener('mousemove', onMouseMove);
		canvasEl.removeEventListener('mouseup', onMouseUp);
		canvasEl.removeEventListener('mouseleave', onMouseUp);
		canvasEl.removeEventListener('wheel', onWheel);
		canvasEl.removeEventListener('click', onClick);
		canvasEl.removeEventListener('touchstart', onTouchStart);
		canvasEl.removeEventListener('touchmove', onTouchMove);
		canvasEl.removeEventListener('touchend', onTouchEnd);
		window.removeEventListener('resize', onResize);
	}

	function onMouseDown(e: MouseEvent): void {
		isMouseDown = true;
		prevMouseX = e.clientX;
		prevMouseY = e.clientY;
	}

	function onMouseMove(e: MouseEvent): void {
		if (!canvasEl) return;

		if (isMouseDown) {
			const dx = e.clientX - prevMouseX;
			const dy = e.clientY - prevMouseY;
			rotationY += dx * 0.005;
			rotationX += dy * 0.005;
			rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
			prevMouseX = e.clientX;
			prevMouseY = e.clientY;
		}

		// Raycast for hover tooltip
		updateTooltip(e.clientX, e.clientY);
	}

	function onMouseUp(): void {
		isMouseDown = false;
	}

	function onWheel(e: WheelEvent): void {
		targetZoom += e.deltaY * 0.002;
		targetZoom = Math.max(2, Math.min(8, targetZoom));
	}

	function onClick(e: MouseEvent): void {
		if (!canvasEl || !mainMesh) return;

		const rect = canvasEl.getBoundingClientRect();
		mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(mouseVec, camera);
		const intersects = raycaster.intersectObject(mainMesh);

		if (intersects.length > 0 && intersects[0].faceIndex != null) {
			const faceIdx = intersects[0].faceIndex;
			if (faceIdx < faceCentersCache.length) {
				const [lat, lng] = faceCentersCache[faceIdx];
				const node = findNearestNode(lat, lng, geoNodes);
				if (node) {
					detailPanel = { visible: true, node };
				}
			}
		} else {
			detailPanel = { visible: false, node: null };
		}
	}

	function updateTooltip(clientX: number, clientY: number): void {
		if (!canvasEl || !mainMesh) return;

		const rect = canvasEl.getBoundingClientRect();
		mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(mouseVec, camera);
		const intersects = raycaster.intersectObject(mainMesh);

		if (intersects.length > 0 && intersects[0].faceIndex != null) {
			const faceIdx = intersects[0].faceIndex;
			if (faceIdx < faceCentersCache.length) {
				const [lat, lng] = faceCentersCache[faceIdx];
				const node = findNearestNode(lat, lng, geoNodes);

				if (node) {
					tooltip = {
						visible: true,
						x: clientX,
						y: clientY,
						node
					};

					// Highlight hovered area precisely
					if (mainMaterial) {
						// Convert world hit point to local mesh space
						const localPoint = intersects[0].point.clone();
						mainMesh.worldToLocal(localPoint);
						mainMaterial.uniforms.uHoverPos.value.copy(localPoint);
						mainMaterial.uniforms.uHoverActive.value = 1.0;

						const intensityAttr = mainMesh.geometry.getAttribute('vDataIntensity');
						mainMaterial.uniforms.uHoveredIntensity.value = intensityAttr.getX(faceIdx * 3);
					}

					if (canvasEl) canvasEl.style.cursor = 'pointer';
					return;
				}
			}
		}

		// No hover
		tooltip = { visible: false, x: 0, y: 0, node: null };
		if (mainMaterial) {
			mainMaterial.uniforms.uHoveredIntensity.value = -1.0;
			mainMaterial.uniforms.uHoverPos.value.set(0, 0, 0);
			mainMaterial.uniforms.uHoverActive.value = 0.0;
		}
		if (canvasEl) canvasEl.style.cursor = 'grab';
	}

	// Touch support
	let touchStartX = 0;
	let touchStartY = 0;

	function onTouchStart(e: TouchEvent): void {
		if (e.touches.length === 1) {
			isMouseDown = true;
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			prevMouseX = touchStartX;
			prevMouseY = touchStartY;
		}
	}

	function onTouchMove(e: TouchEvent): void {
		if (e.touches.length === 1 && isMouseDown) {
			const dx = e.touches[0].clientX - prevMouseX;
			const dy = e.touches[0].clientY - prevMouseY;
			rotationY += dx * 0.005;
			rotationX += dy * 0.005;
			rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
			prevMouseX = e.touches[0].clientX;
			prevMouseY = e.touches[0].clientY;
		}
	}

	function onTouchEnd(): void {
		isMouseDown = false;
	}

	function onResize(): void {
		if (!containerEl || !renderer || !camera) return;

		const width = containerEl.clientWidth;
		const height = containerEl.clientHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	function updateTheme(isDark: boolean): void {
		if (!state.ready) return;

		const colors = getPlanetColors(planetStyle, isDark);

		// Update Renderer
		if (renderer) {
			renderer.setClearColor(colors.background, 0); // Keep alpha 0 to allow CSS background
		}

		// Update Materials
		if (mainMaterial) {
			mainMaterial.uniforms.uColorCold.value.set(colors.faceCold);
			mainMaterial.uniforms.uColorHot.value.set(colors.faceHot);
			mainMaterial.uniforms.uWireColor.value.set(colors.wireframe);
			mainMaterial.uniforms.uNeonColor.value.set(colors.neon);
			mainMaterial.uniforms.uAccentColor.value.set(colors.accent);
			mainMaterial.uniforms.uTimeColor.value.set(0xbb66ff); // Standard violet for Time mode
		}

		if (ringMaterial) {
			ringMaterial.uniforms.uColor.value.set(colors.wireframe);
		}

		if (particlesMesh) {
			const pMaterial = particlesMesh.material as InstanceType<ThreeModule['PointsMaterial']>;
			pMaterial.color.set(isDark ? 0xffffff : 0x000000);
		}
	}

	// --- Setters ---

	function setViewMode(mode: ViewMode): void {
		if (viewMode === mode) return;
		viewMode = mode; // Updates UI instantly
		pendingMode = mode; // Shader handles transition
		modeTransitionPhase = 0.01; // Trigger animation
	}

	function setPlanetStyle(style: PlanetStyle): void {
		if (planetStyle === style) return;
		planetStyle = style;
		if (state.ready) {
			updateTheme(containerEl?.classList.contains('dark') ?? true);
		}
	}

	function closeDetailPanel(): void {
		detailPanel = { visible: false, node: null };
	}

	function toggleFocusMode(): void {
		isFocusMode = !isFocusMode;
		if (mainMaterial) {
			mainMaterial.uniforms.uFocusMode.value = isFocusMode ? 1.0 : 0.0;
		}
	}

	// --- Return public API ---
	return {
		// State (readonly access via getters)
		get state() {
			return state;
		},
		get viewMode() {
			return viewMode;
		},
		get planetStyle() {
			return planetStyle;
		},
		get tooltip() {
			return tooltip;
		},
		get detailPanel() {
			return detailPanel;
		},
		get config() {
			return config;
		},
		get isFocusMode() {
			return isFocusMode;
		},

		// Methods
		init,
		destroy,
		updateNodes,
		setViewMode,
		setPlanetStyle,
		updateTheme,
		closeDetailPanel,
		toggleFocusMode
	};
}

/** Type for the engine instance */
export type FoldedWorldEngine = ReturnType<typeof createFoldedWorldEngine>;

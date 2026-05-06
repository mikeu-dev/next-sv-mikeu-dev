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
import { mapNodesToFaces, faceCenter, paperFoldDisplacement, findNearestNode } from './folded-world-geometry';
import { getWorldColors, DEFAULT_WORLD_CONFIG } from './folded-world.types';
import {
	vertexShader,
	fragmentShader,
	wireframeVertexShader,
	wireframeFragmentShader
} from './folded-world-shaders';

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
	let tooltip = $state<TooltipData>({ visible: false, x: 0, y: 0, node: null });
	let detailPanel = $state<DetailPanelData>({ visible: false, node: null });
	const config = $state<WorldConfig>({ ...DEFAULT_WORLD_CONFIG });

	// --- Internal State (non-reactive) ---
	let THREE: ThreeModule;
	let renderer: InstanceType<ThreeModule['WebGLRenderer']>;
	let scene: InstanceType<ThreeModule['Scene']>;
	let camera: InstanceType<ThreeModule['PerspectiveCamera']>;
	let mainMesh: InstanceType<ThreeModule['Mesh']>;
	let wireframeMesh: InstanceType<ThreeModule['Mesh']>;
	let mainMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
	let wireframeMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
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
		isDark: boolean = true
	): Promise<void> {
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
			applyDeformations();
			setupEventListeners();

			state.ready = true;
			state.loading = false;
			state.nodeCount = nodes.length;

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
		if (wireframeMesh) {
			wireframeMesh.geometry.dispose();
		}
		if (mainMaterial) mainMaterial.dispose();
		if (wireframeMaterial) wireframeMaterial.dispose();
		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss();
		}

		state.ready = false;
	}

	// --- Scene Setup ---

	function setupScene(isDark: boolean): void {
		if (!canvasEl || !containerEl) return;

		const colors = getWorldColors(isDark);

		const width = containerEl.clientWidth;
		const height = containerEl.clientHeight;

		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvasEl,
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(colors.background, 1);

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
		camera.position.set(0, 0, currentZoom);
		camera.lookAt(0, 0, 0);

		// Raycaster for interaction
		raycaster = new THREE.Raycaster();
		mouseVec = new THREE.Vector2();
	}

	function buildGlobe(isDark: boolean): void {
		const colors = getWorldColors(isDark);
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

		for (let i = 0; i < vertexCount; i++) {
			const x = posAttr.getX(i);
			const y = posAttr.getY(i);
			const z = posAttr.getZ(i);
			foldOffsets[i] = paperFoldDisplacement(x, y, z);
		}

		nonIndexed.setAttribute('vDataIntensity', new THREE.BufferAttribute(intensities, 1));
		nonIndexed.setAttribute('foldOffset', new THREE.BufferAttribute(foldOffsets, 1));

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
				uWireColor: { value: new THREE.Color(colors.wireframe) },
				uOpacity: { value: config.wireframeOpacity },
				uWorldMask: { value: worldMask },
				uNeonColor: { value: new THREE.Color(colors.neon) }
			},
			side: THREE.FrontSide
		});

		mainMesh = new THREE.Mesh(nonIndexed, mainMaterial);
		scene.add(mainMesh);

		// Wireframe overlay (shared geometry to ensure shared attributes like intensity)
		wireframeMaterial = new THREE.ShaderMaterial({
			vertexShader: wireframeVertexShader,
			fragmentShader: wireframeFragmentShader,
			uniforms: {
				uMaxExtrusion: { value: config.maxExtrusion },
				uMode: { value: 0 },
				uTime: { value: 0 },
				uWireColor: { value: new THREE.Color(colors.wireframe) },
				uOpacity: { value: config.wireframeOpacity }
			},
			transparent: true,
			depthTest: true,
			wireframe: true,
			side: THREE.DoubleSide
		});

		wireframeMesh = new THREE.Mesh(nonIndexed, wireframeMaterial);
		scene.add(wireframeMesh);
	}

	function applyDeformations(): void {
		if (!mainMesh) return;

		const geometry = mainMesh.geometry;
		const intensityAttr = geometry.getAttribute('vDataIntensity');

		// Map geo nodes to face intensities
		const faceIntensities = mapNodesToFaces(faceCentersCache, geoNodes, 1.2);

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

		// Smooth zoom
		currentZoom += (targetZoom - currentZoom) * 0.08;
		camera.position.set(0, 0, currentZoom);

		// Apply rotation
		if (mainMesh) {
			mainMesh.rotation.y = autoRotateAngle + rotationY;
			mainMesh.rotation.x = rotationX;
		}
		if (wireframeMesh) {
			wireframeMesh.rotation.y = autoRotateAngle + rotationY;
			wireframeMesh.rotation.x = rotationX;
		}

		// Update shader uniforms
		const modeIdx = viewMode === 'fold' ? 0 : viewMode === 'heat' ? 1 : 2;
		if (mainMaterial) {
			mainMaterial.uniforms.uTime.value = elapsed;
			mainMaterial.uniforms.uMode.value = modeIdx;
		}
		if (wireframeMaterial) {
			wireframeMaterial.uniforms.uTime.value = elapsed;
			wireframeMaterial.uniforms.uMode.value = modeIdx;
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

					// Highlight hovered face
					if (mainMaterial) {
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

		const colors = getWorldColors(isDark);

		// Update Renderer
		if (renderer) {
			renderer.setClearColor(colors.background, 1);
		}

		// Update Materials
		if (mainMaterial) {
			mainMaterial.uniforms.uColorCold.value.set(colors.faceCold);
			mainMaterial.uniforms.uColorHot.value.set(colors.faceHot);
			mainMaterial.uniforms.uWireColor.value.set(colors.wireframe);
			mainMaterial.uniforms.uNeonColor.value.set(colors.neon);
		}

		if (wireframeMaterial) {
			wireframeMaterial.uniforms.uWireColor.value.set(colors.wireframe);
		}
	}

	// --- Setters ---

	function setViewMode(mode: ViewMode): void {
		viewMode = mode;
	}

	function closeDetailPanel(): void {
		detailPanel = { visible: false, node: null };
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
		get tooltip() {
			return tooltip;
		},
		get detailPanel() {
			return detailPanel;
		},
		get config() {
			return config;
		},

		// Methods
		init,
		destroy,
		updateNodes,
		setViewMode,
		updateTheme,
		closeDetailPanel
	};
}

/** Type for the engine instance */
export type FoldedWorldEngine = ReturnType<typeof createFoldedWorldEngine>;

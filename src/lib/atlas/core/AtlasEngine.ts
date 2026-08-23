import type {
	AtlasScene,
	AtlasPoint,
	AtlasPath,
	AtlasNode,
	AtlasEdge,
	TerritoryDomain
} from './types';
import { CameraEngine } from '../camera/CameraEngine';
import { atlasStore } from './AtlasState.svelte';
import { ATLAS_SCENES } from '../narrative/manifest/scenes.manifest';
import {
	ATLAS_PROJECTS,
	SIPEDO_PROJECT_MANIFEST,
	WMS_PROJECT_MANIFEST,
	VISION_AI_MANIFEST
} from '../narrative/manifest/projects.data';
import { PathMorpher } from '../morph/PathMorpher';
import { PathSimplifier } from '../geometry/PathSimplifier';

export class AtlasEngine {
	private cameraEngine: CameraEngine;
	private scenes: readonly AtlasScene[];
	private activeSceneIndex: number = 0;
	private pathMorpher: PathMorpher;

	// Master Raw Geographic Points (Kab. Purwakarta)
	private readonly geographicPoints: readonly AtlasPoint[] = [
		{ x: 420, y: 380 },
		{ x: 500, y: 360 },
		{ x: 580, y: 370 },
		{ x: 630, y: 460 },
		{ x: 610, y: 530 },
		{ x: 590, y: 580 },
		{ x: 540, y: 610 },
		{ x: 490, y: 620 },
		{ x: 430, y: 580 },
		{ x: 390, y: 540 },
		{ x: 380, y: 430 }
	];

	// Master System Architecture Diagram Points (Rectangular Core Block)
	private readonly architecturePoints: readonly AtlasPoint[] = [
		{ x: 360, y: 320 },
		{ x: 500, y: 320 },
		{ x: 640, y: 320 },
		{ x: 640, y: 460 },
		{ x: 640, y: 600 },
		{ x: 640, y: 680 },
		{ x: 500, y: 680 },
		{ x: 360, y: 680 },
		{ x: 360, y: 600 },
		{ x: 360, y: 460 },
		{ x: 360, y: 320 }
	];

	constructor(scenes: readonly AtlasScene[] = ATLAS_SCENES) {
		this.scenes = scenes;
		const initialTarget = this.scenes[0]?.cameraTarget ?? {
			x: 500,
			y: 500,
			zoom: 4.5,
			rotation: 0
		};
		this.cameraEngine = new CameraEngine(initialTarget);
		this.pathMorpher = new PathMorpher(this.geographicPoints, this.architecturePoints, 64);
		this.initWorldEntities();
		this.updateStore(0, this.scenes[0] ?? null);
	}

	private initWorldEntities(): void {
		// 1. Initial Geographic Vector Path (Douglas-Peucker Simplified)
		const simplifiedGeo = PathSimplifier.simplify(this.geographicPoints, 1.0);
		const purwakartaPolygonPath: AtlasPath = {
			id: 'path-pwk-boundary',
			d: PathSimplifier.toSvgPathString(simplifiedGeo, true),
			strokeWidth: 1.5,
			strokeColor: '#10b981',
			dashArray: 'none',
			opacity: 0.85
		};

		// 2. Career Trajectory Vector (2022 to 2026)
		const trajectoryPath: AtlasPath = {
			id: 'path-career-trajectory',
			d: 'M 500 500 Q 560 460 620 380 T 720 360 M 620 380 Q 500 550 380 640 T 280 680',
			strokeWidth: 2,
			strokeColor: '#38bdf8',
			dashArray: '6 4',
			opacity: 0.75
		};

		// 3. System Architecture Topology Connectors
		const architecturePaths: AtlasPath[] = [
			{
				id: 'path-arch-client-router',
				d: 'M 500 320 L 500 420',
				strokeWidth: 2,
				strokeColor: '#0ea5e9',
				opacity: 0.8
			},
			{
				id: 'path-arch-router-gis',
				d: 'M 500 420 L 400 540',
				strokeWidth: 1.5,
				strokeColor: '#10b981',
				opacity: 0.7
			},
			{
				id: 'path-arch-router-erp',
				d: 'M 500 420 L 600 540',
				strokeWidth: 1.5,
				strokeColor: '#f59e0b',
				opacity: 0.7
			}
		];

		atlasStore.activePaths = [purwakartaPolygonPath, trajectoryPath, ...architecturePaths];

		// 4. Interactive Spatial Nodes
		const nodes: AtlasNode[] = [
			{
				id: 'node-origin-pwk',
				label: 'PURWAKARTA ORIGIN',
				subtitle: 'Base Spatial Anchor (00°31\'12"S 107°26\'32"E)',
				position: { x: 500, y: 500 },
				domain: 'gis',
				isPrimary: true,
				evidenceId: 'ev-sipedo-indexing'
			},
			{
				id: 'node-wms-hub',
				label: 'ENTERPRISE WMS CORE',
				subtitle: '4,500 req/sec Inventory Mesh',
				position: { x: 720, y: 360 },
				domain: 'erp',
				isPrimary: false,
				evidenceId: 'ev-wms-state-machine'
			},
			{
				id: 'node-vision-ai',
				label: 'VISION QA INFERENCE',
				subtitle: '99.4% Precision Industrial AI',
				position: { x: 280, y: 680 },
				domain: 'ai',
				isPrimary: false,
				evidenceId: 'ev-vision-precision'
			}
		];

		atlasStore.activeNodes = nodes;

		// 5. System Network Edges
		const edges: AtlasEdge[] = [
			{
				id: 'edge-pwk-wms',
				sourceNodeId: 'node-origin-pwk',
				targetNodeId: 'node-wms-hub',
				flowSpeed: 1.2,
				label: 'DATA_SYNC',
				strokeColor: '#0ea5e9'
			},
			{
				id: 'edge-pwk-ai',
				sourceNodeId: 'node-origin-pwk',
				targetNodeId: 'node-vision-ai',
				flowSpeed: 0.8,
				label: 'INFERENCE_MESH',
				strokeColor: '#8b5cf6'
			}
		];

		atlasStore.activeEdges = edges;
	}

	public setProgress(globalProgress: number): void {
		const clampedProgress = Math.max(0, Math.min(1, globalProgress));

		// Find active scene
		let sceneIndex = this.scenes.findIndex(
			(s) => clampedProgress >= s.startGlobalProgress && clampedProgress <= s.endGlobalProgress
		);
		if (sceneIndex === -1) {
			sceneIndex = clampedProgress >= 1 ? this.scenes.length - 1 : 0;
		}
		this.activeSceneIndex = sceneIndex;
		const currentScene = this.scenes[this.activeSceneIndex] ?? null;
		const nextScene = this.scenes[this.activeSceneIndex + 1] ?? null;

		// Update camera viewport matrix
		this.cameraEngine.updateFromProgress(clampedProgress, currentScene, nextScene);

		// Dynamic Morph calculation during Scene 04 (Systems: 0.52 to 0.72)
		let morphProgress = 0.0;
		if (clampedProgress >= 0.52 && clampedProgress <= 0.72) {
			morphProgress = (clampedProgress - 0.52) / (0.72 - 0.52);
		} else if (clampedProgress > 0.72) {
			morphProgress = 1.0;
		}

		const morphedPathString = this.pathMorpher.getInterpolatedPathString(morphProgress);
		atlasStore.activePaths = atlasStore.activePaths.map((p) => {
			if (p.id === 'path-pwk-boundary') {
				return {
					...p,
					d: morphedPathString,
					strokeColor: morphProgress > 0.5 ? '#38bdf8' : '#10b981'
				};
			}
			return p;
		});

		// Update active narrative beat
		if (currentScene) {
			const sceneSpan = currentScene.endGlobalProgress - currentScene.startGlobalProgress;
			const localProg = Math.max(
				0,
				Math.min(1, (clampedProgress - currentScene.startGlobalProgress) / (sceneSpan || 1))
			);

			for (const phase of currentScene.phases) {
				if (localProg >= phase.startProgress && localProg <= phase.endProgress) {
					for (const beat of phase.beats) {
						if (localProg >= beat.startProgress && localProg <= beat.endProgress) {
							if (beat.narrativeText) atlasStore.activeBeatNarrative = beat.narrativeText;
							if (beat.subtitle) atlasStore.activeBeatSubtitle = beat.subtitle;
							break;
						}
					}
				}
			}
		}

		this.updateStore(clampedProgress, currentScene);
	}

	public focusAnchor(target: AtlasPoint, zoom: number = 2.0): void {
		this.cameraEngine.setTarget(target, zoom);
		this.updateStore();
	}

	public inspectNodeEvidence(evidenceId: string): void {
		for (const proj of ATLAS_PROJECTS) {
			const found = proj.evidence.find((e) => e.id === evidenceId);
			if (found) {
				atlasStore.openEvidence(found);
				return;
			}
		}
	}

	public inspectProjectByDomain(domain: TerritoryDomain): void {
		const projectMap: Record<TerritoryDomain, typeof SIPEDO_PROJECT_MANIFEST> = {
			gis: SIPEDO_PROJECT_MANIFEST,
			erp: WMS_PROJECT_MANIFEST,
			ai: VISION_AI_MANIFEST,
			infra: SIPEDO_PROJECT_MANIFEST
		};

		const project = projectMap[domain];
		if (project) {
			atlasStore.openProject(project);
		}
	}

	private updateStore(
		progress: number = atlasStore.globalProgress,
		currentScene: AtlasScene | null = null
	): void {
		atlasStore.globalProgress = progress;
		atlasStore.activeSceneIndex = this.activeSceneIndex;
		atlasStore.activeScene = currentScene ?? this.scenes[this.activeSceneIndex] ?? null;
		atlasStore.camera = this.cameraEngine.getState();
	}
}

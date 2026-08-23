import type {
	CameraState,
	AtlasScene,
	AtlasEvidence,
	AtlasProject,
	TerritoryDomain,
	AtlasPath,
	AtlasNode,
	AtlasEdge
} from './types';

export class AtlasStateStore {
	// Svelte 5 Core Reactive Runes
	globalProgress = $state<number>(0.0);
	activeSceneIndex = $state<number>(0);
	activeScene = $state<AtlasScene | null>(null);
	activeBeatNarrative = $state<string>('00° 31\' 12.4"S  107° 26\' 32.1"E');
	activeBeatSubtitle = $state<string>('PURWAKARTA REGIONAL ORIGIN POINT');
	camera = $state<CameraState>({ x: 500, y: 500, zoom: 4.5, rotation: 0 });

	// Interactive modal & drawer states
	isEvidenceDrawerOpen = $state<boolean>(false);
	activeEvidence = $state<AtlasEvidence | null>(null);
	activeProject = $state<AtlasProject | null>(null);
	isProjectCardOpen = $state<boolean>(false);
	activeDomainFilter = $state<TerritoryDomain | 'all'>('all');

	// Rendered dynamic entities
	activePaths = $state<AtlasPath[]>([]);
	activeNodes = $state<AtlasNode[]>([]);
	activeEdges = $state<AtlasEdge[]>([]);

	// Derived Values untuk Rendering & Telemetri
	svgMatrixTransform = $derived.by(() => {
		const s = this.camera.zoom;
		const tx = 500 - this.camera.x * s;
		const ty = 500 - this.camera.y * s;
		return `matrix(${s}, 0, 0, ${s}, ${tx}, ${ty})`;
	});

	formattedCoordinates = $derived.by(() => {
		const latBase = -0.52;
		const lonBase = 107.442;
		const latOffset = ((this.camera.y - 500) / 1000) * 0.05;
		const lonOffset = ((this.camera.x - 500) / 1000) * 0.05;

		const curLat = latBase + latOffset;
		const curLon = lonBase + lonOffset;

		const latDeg = Math.floor(Math.abs(curLat));
		const latMin = Math.floor((Math.abs(curLat) - latDeg) * 60);
		const latSec = (((Math.abs(curLat) - latDeg) * 60 - latMin) * 60).toFixed(1);

		const lonDeg = Math.floor(Math.abs(curLon));
		const lonMin = Math.floor((Math.abs(curLon) - lonDeg) * 60);
		const lonSec = (((Math.abs(curLon) - lonDeg) * 60 - lonMin) * 60).toFixed(1);

		return `00° ${latMin < 10 ? '0' : ''}${latMin}' ${latSec}"S  107° ${lonMin < 10 ? '0' : ''}${lonMin}' ${lonSec}"E`;
	});

	altitudeMeters = $derived.by(() => {
		return Math.round(5000 / Math.max(0.1, this.camera.zoom));
	});

	scaleLabel = $derived.by(() => {
		const ratio = Math.round(50000 / Math.max(0.1, this.camera.zoom));
		return `1:${ratio.toLocaleString()}`;
	});

	openEvidence(evidence: AtlasEvidence): void {
		this.activeEvidence = evidence;
		this.isEvidenceDrawerOpen = true;
	}

	closeEvidence(): void {
		this.isEvidenceDrawerOpen = false;
		this.activeEvidence = null;
	}

	openProject(project: AtlasProject): void {
		this.activeProject = project;
		this.isProjectCardOpen = true;
	}

	closeProject(): void {
		this.isProjectCardOpen = false;
		this.activeProject = null;
	}

	setDomainFilter(domain: TerritoryDomain | 'all'): void {
		this.activeDomainFilter = domain;
	}
}

export const atlasStore = new AtlasStateStore();

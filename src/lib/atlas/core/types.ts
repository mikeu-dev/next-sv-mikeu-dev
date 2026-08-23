export type TerritoryDomain = 'gis' | 'erp' | 'ai' | 'infra';

export type SceneVerb = 'arrive' | 'trace' | 'explore' | 'morph' | 'examine' | 'conclude';

export type PhaseType = 'enter' | 'build' | 'hold' | 'transform' | 'exit';

export type EvidenceType =
	| 'code'
	| 'architecture'
	| 'metric'
	| 'schema'
	| 'benchmark'
	| 'live_demo';

export type EvidenceConfidence = 'verified_production' | 'high_impact' | 'experimental_rnd';

export interface AtlasPoint {
	readonly x: number; // 0.0 .. 1000.0 (Normalized Cartesian X)
	readonly y: number; // 0.0 .. 1000.0 (Normalized Cartesian Y)
}

export interface AtlasGeoCoordinate {
	readonly latitude: number;
	readonly longitude: number;
	readonly altitudeMeters?: number;
}

export interface AtlasBounds {
	readonly minX: number;
	readonly minY: number;
	readonly maxX: number;
	readonly maxY: number;
}

export interface CameraState {
	readonly x: number;
	readonly y: number;
	readonly zoom: number;
	readonly rotation: number;
}

export interface CameraProfile {
	readonly target: AtlasPoint;
	readonly zoom: number;
	readonly rotation: number;
	readonly durationSeconds?: number;
}

export interface AtlasAnchor {
	readonly id: string;
	readonly label: string;
	readonly point: AtlasPoint;
	readonly geo?: AtlasGeoCoordinate;
	readonly territoryId?: TerritoryDomain;
}

export interface AtlasPath {
	readonly id: string;
	readonly d: string; // SVG path string
	readonly strokeWidth: number;
	readonly strokeColor: string;
	readonly dashArray?: string;
	readonly opacity?: number;
}

export interface AtlasNode {
	readonly id: string;
	readonly label: string;
	readonly subtitle?: string;
	readonly position: AtlasPoint;
	readonly domain: TerritoryDomain;
	readonly isPrimary: boolean;
	readonly evidenceId?: string;
}

export interface AtlasEdge {
	readonly id: string;
	readonly sourceNodeId: string;
	readonly targetNodeId: string;
	readonly flowSpeed?: number;
	readonly label?: string;
	readonly strokeColor?: string;
}

export interface AtlasGraph {
	readonly nodes: readonly AtlasNode[];
	readonly edges: readonly AtlasEdge[];
}

export interface EvidenceArtifact {
	readonly id: string;
	readonly title: string;
	readonly type: EvidenceType;
	readonly confidence: EvidenceConfidence;
	readonly summary: string;
	readonly contentSnippet?: string;
	readonly language?: string;
	readonly metricValue?: string;
	readonly metricLabel?: string;
	readonly externalUrl?: string;
}

export interface AtlasEvidence {
	readonly id: string;
	readonly projectId: string;
	readonly title: string;
	readonly domain: TerritoryDomain;
	readonly artifacts: readonly EvidenceArtifact[];
}

export type AtlasAction =
	| { readonly type: 'focus'; readonly target: AtlasPoint; readonly zoom: number }
	| { readonly type: 'connect'; readonly source: string; readonly target: string }
	| {
			readonly type: 'morph';
			readonly sourcePathId: string;
			readonly targetPathId: string;
			readonly progress: number;
	  }
	| { readonly type: 'highlight'; readonly nodeIds: readonly string[] }
	| { readonly type: 'reveal_evidence'; readonly evidenceId: string };

export interface AtlasBeat {
	readonly startProgress: number; // 0.0 .. 1.0 (local scene progress)
	readonly endProgress: number; // 0.0 .. 1.0
	readonly actions: readonly AtlasAction[];
	readonly narrativeText?: string;
	readonly subtitle?: string;
}

export interface AtlasPhase {
	readonly type: PhaseType;
	readonly startProgress: number;
	readonly endProgress: number;
	readonly beats: readonly AtlasBeat[];
}

export interface AtlasScene {
	readonly id: string;
	readonly title: string;
	readonly chapterNumber: number;
	readonly verb: SceneVerb;
	readonly startGlobalProgress: number; // 0.0 .. 1.0
	readonly endGlobalProgress: number; // 0.0 .. 1.0
	readonly cameraTarget: CameraState;
	readonly phases: readonly AtlasPhase[];
}

export interface AtlasProject {
	readonly id: string;
	readonly slug: string;
	readonly title: string;
	readonly tagLine: string;
	readonly domain: TerritoryDomain;
	readonly clientOrOrg: string;
	readonly year: number;
	readonly location: AtlasAnchor;
	readonly stack: readonly string[];
	readonly evidence: readonly AtlasEvidence[];
}

import type { CameraState, AtlasScene, AtlasPoint } from '../core/types';

export class CameraEngine {
	private currentState: CameraState;

	constructor(initialState: CameraState = { x: 500, y: 500, zoom: 4.5, rotation: 0 }) {
		this.currentState = { ...initialState };
	}

	public getState(): CameraState {
		return { ...this.currentState };
	}

	public setTarget(target: AtlasPoint, zoom: number, rotation: number = 0): void {
		this.currentState = {
			x: target.x,
			y: target.y,
			zoom,
			rotation
		};
	}

	public updateFromProgress(
		globalProgress: number,
		currentScene: AtlasScene | null,
		nextScene: AtlasScene | null
	): void {
		if (!currentScene) return;

		if (!nextScene || globalProgress <= currentScene.startGlobalProgress) {
			this.currentState = { ...currentScene.cameraTarget };
			return;
		}

		const sceneSpan = currentScene.endGlobalProgress - currentScene.startGlobalProgress;
		const localProgress = Math.max(
			0,
			Math.min(1, (globalProgress - currentScene.startGlobalProgress) / (sceneSpan || 1))
		);

		// Smooth easeInOut cubic interpolation between scene targets
		const easeProgress =
			localProgress < 0.5
				? 4 * localProgress * localProgress * localProgress
				: 1 - Math.pow(-2 * localProgress + 2, 3) / 2;

		const fromTarget = currentScene.cameraTarget;
		const toTarget = nextScene.cameraTarget;

		this.currentState = {
			x: fromTarget.x + (toTarget.x - fromTarget.x) * easeProgress,
			y: fromTarget.y + (toTarget.y - fromTarget.y) * easeProgress,
			zoom: fromTarget.zoom + (toTarget.zoom - fromTarget.zoom) * easeProgress,
			rotation: fromTarget.rotation + (toTarget.rotation - fromTarget.rotation) * easeProgress
		};
	}
}

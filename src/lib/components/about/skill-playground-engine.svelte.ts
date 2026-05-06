import Matter from 'matter-js';
import { 
	shapes, 
	tetrisColors, 
	categoryColors, 
	isColorLight,
	type LocalizedCategory,
	type PieceBody,
	type Particle,
	type SkillItem,
	type Tetrimino
} from './skill-playground.types';

const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;

export class SkillEngine {
	// Reactive State
	engine = $state.raw<Matter.Engine>();
	runner = $state.raw<Matter.Runner>();
	pieceBodies = $state<PieceBody[]>([]);
	particles = $state<Particle[]>([]);
	comboCount = $state(0);
	nextPieceIdx = $state(1);
	spawnedCount = $state(0);
	
	// Physics internals
	physicsBodies: Matter.Body[] = [];
	nextId = 0;
	isSpawning = false;
	spawnTimeouts: number[] = [];
	
	// HUD State
	sessionStart = Date.now();
	uptime = $state(0);
	integrity = $state(100);
	
	// Dimensions
	canvasWidth = $state(0);
	canvasHeight = $state(0);
	
	private container: HTMLElement | null = null;
	private categories: LocalizedCategory[] = [];

	constructor(categories: LocalizedCategory[]) {
		this.categories = categories;
	}

	// Derived tetriminos
	get tetriminos(): Tetrimino[] {
		const all: Tetrimino[] = [];
		let currentSkillIndex = 0;
		const shapeKeys = Object.keys(shapes);
		
		const flatSkills = this.categories.flatMap((cat) =>
			(cat.items || []).map((item) => ({
				...item,
				category: cat.category,
				catColor: categoryColors[cat.category]
			}))
		);

		while (currentSkillIndex < flatSkills.length) {
			const pseudoRandom = (currentSkillIndex * 1337) % shapeKeys.length;
			const shapeKey = shapeKeys[pseudoRandom];
			const shapeCoords = shapes[shapeKey];
			const pieceSkills: SkillItem[] = [];
			
			for (let i = 0; i < shapeCoords.length; i++) {
				if (currentSkillIndex < flatSkills.length) {
					pieceSkills.push({
						...flatSkills[currentSkillIndex],
						relX: shapeCoords[i][0],
						relY: shapeCoords[i][1],
						x: 0,
						y: -100,
						angle: 0,
						opacity: 0,
						scale: 1,
						brightness: 1
					} as SkillItem);
					currentSkillIndex++;
				}
			}
			if (pieceSkills.length > 0) {
				const color = tetrisColors[shapeKey];
				all.push({
					shape: shapeKey,
					color,
					isLight: isColorLight(color),
					skills: pieceSkills
				});
			}
		}
		return all;
	}

	init(container: HTMLElement) {
		this.container = container;
		this.engine = Engine.create();
		this.engine.world.gravity.y = 1.0;
		this.engine.enableSleeping = false;
		this.engine.positionIterations = 30;
		this.engine.velocityIterations = 30;
		this.engine.constraintIterations = 10;

		const mc = MouseConstraint.create(this.engine, {
			mouse: Mouse.create(container),
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(this.engine.world, mc);

		Events.on(mc, 'mousedown', (e: Matter.IEvent<Matter.MouseConstraint>) => {
			if (e.source.body?.label?.startsWith('piece-'))
				this.rotatePiece(parseInt(e.source.body.label.split('-')[1]));
		});

		Events.on(this.engine, 'collisionStart', (e: { pairs: Matter.Pair[] }) => {
			e.pairs.forEach((p: Matter.Pair) => {
				if (p.collision.depth > 2) {
					const pos = p.collision.supports[0] || p.bodyA.position;
					this.createParticles(pos.x, pos.y, '#ffffff', 2);

					if (p.collision.depth > 5) {
						const body = p.bodyA.label?.startsWith('piece-')
							? p.bodyA
							: p.bodyB.label?.startsWith('piece-')
								? p.bodyB
								: null;
						if (body) {
							const id = parseInt(body.label.split('-')[1]);
							const pb = this.pieceBodies.find((p) => p.id === id);
							if (pb) pb.piece.skills.forEach((s) => (s.brightness = 2));
						}
					}
				}
			});
		});

		this.runner = Runner.create();
		Runner.run(this.runner, this.engine);
		this.startLoop();
		this.initWalls();
	}

	private startLoop() {
		let rafId: number;
		const update = () => {
			const now = Date.now();
			this.uptime = Math.floor((now - this.sessionStart) / 1000);
			this.integrity = 99.5 + Math.random() * 0.5;

			this.particles = this.particles
				.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03, vy: p.vy + 0.2 }))
				.filter((p) => p.life > 0);

			for (let i = 0; i < this.pieceBodies.length; i++) {
				const pb = this.pieceBodies[i];
				const body = this.physicsBodies.find((b) => b.label === `piece-${pb.id}`);
				if (!body) continue;

				const parts = body.parts;
				for (let j = 1; j < parts.length; j++) {
					const part = parts[j];
					const skill = pb.piece.skills[j - 1];

					if (skill) {
						skill.x = part.position.x;
						skill.y = part.position.y;
						skill.angle = body.angle;

						if (skill.scale > 1) skill.scale -= 0.02;
						if (skill.brightness > 1) skill.brightness -= 0.05;
					}
				}
			}
			rafId = requestAnimationFrame(update);
		};
		update();
		return () => cancelAnimationFrame(rafId);
	}

	initWalls() {
		if (!this.engine || this.canvasWidth === 0 || this.canvasHeight === 0) return;

		const existingWalls = this.engine.world.bodies.filter((b) => b.label === 'wall');
		Composite.remove(this.engine.world, existingWalls);

		const options = {
			isStatic: true,
			friction: 0.8,
			restitution: 0.2,
			label: 'wall',
			render: { visible: true, fillStyle: 'transparent' }
		};

		const wallThickness = 100;
		Composite.add(this.engine.world, [
			Bodies.rectangle(
				this.canvasWidth / 2,
				this.canvasHeight + wallThickness / 2,
				this.canvasWidth,
				wallThickness,
				options
			),
			Bodies.rectangle(
				-wallThickness / 2,
				this.canvasHeight / 2,
				wallThickness,
				this.canvasHeight * 2,
				options
			),
			Bodies.rectangle(
				this.canvasWidth + wallThickness / 2,
				this.canvasHeight / 2,
				wallThickness,
				this.canvasHeight * 2,
				options
			)
		]);
	}

	spawnSequentially() {
		if (this.canvasWidth === 0 || this.isSpawning) return;
		this.isSpawning = true;

		const blockSize = 45;
		this.pieceBodies = [];
		this.physicsBodies = [];
		if (this.engine) Composite.clear(this.engine.world, false);
		this.nextId = 0;
		this.initWalls();

		this.spawnTimeouts.forEach(clearTimeout);
		this.spawnTimeouts = [];

		this.tetriminos.forEach((piece, pieceIdx) => {
			const timeout = window.setTimeout(() => {
				const maxX = Math.max(...piece.skills.map((s) => s.relX));
				const pieceWidth = (maxX + 1) * blockSize;
				const startX = Math.random() * (this.canvasWidth - pieceWidth - 40) + 20;
				
				const parts = piece.skills.map((skill) =>
					Bodies.rectangle(
						startX + skill.relX * blockSize,
						50 + skill.relY * blockSize,
						blockSize - 0.8,
						blockSize - 0.8,
						{
							friction: 0.3,
							restitution: 0.05,
							density: 0.001,
							slop: 0.05
						}
					)
				);
				
				const body = Body.create({
					parts,
					frictionAir: 0.05,
					label: `piece-${pieceIdx}`
				});

				const currentPieceId = this.nextId++;
				const reactiveSkills = piece.skills.map((s) => ({
					...s,
					x: startX + s.relX * blockSize,
					y: 50 + s.relY * blockSize,
					angle: 0,
					opacity: 1,
					scale: 1,
					brightness: 1
				}));

				const newPB = $state({
					piece: { ...piece, skills: reactiveSkills },
					id: currentPieceId
				});

				body.label = `piece-${currentPieceId}`;
				this.physicsBodies.push(body);
				this.pieceBodies = [...this.pieceBodies, newPB];

				if (this.engine) {
					Composite.add(this.engine.world, body);
					this.spawnedCount++;
					if (pieceIdx < this.tetriminos.length - 1) this.nextPieceIdx = pieceIdx + 1;
				}

				if (pieceIdx === this.tetriminos.length - 1) {
					this.isSpawning = false;
				}
			}, pieceIdx * 800);
			this.spawnTimeouts.push(timeout);
		});
	}

	rotatePiece(id: number) {
		const pb = this.pieceBodies.find((p) => p.id === id);
		const body = this.physicsBodies.find((b) => b.label === `piece-${id}`);
		if (pb && body) {
			Body.setVelocity(body, { x: 0, y: -6 });
			Body.rotate(body, Math.PI / 2);
			Body.setAngularVelocity(body, 0);

			this.physicsBodies.forEach((other) => {
				if (other === body || !other.label.startsWith('piece-')) return;
				const diff = Matter.Vector.sub(other.position, body.position);
				const dist = Matter.Vector.magnitude(diff);
				if (dist < 120) {
					const pushForce = Matter.Vector.mult(Matter.Vector.normalise(diff), 0.05 * other.mass);
					Body.applyForce(other, other.position, pushForce);
				}
			});

			this.comboCount++;
			this.createParticles(body.position.x, body.position.y, pb.piece.color, 12);

			pb.piece.skills.forEach((s) => {
				s.scale = 1.1;
				s.brightness = 1.5;
			});

			setTimeout(() => {
				if (this.comboCount > 0) this.comboCount--;
			}, 2000);
		}
	}

	resetBoard() {
		if (!this.engine) return;
		Composite.clear(this.engine.world, false, true);
		this.spawnedCount = 0;
		this.nextPieceIdx = 1;
		this.particles = [];
		this.initWalls();
		this.spawnSequentially();
	}

	shakeBoard() {
		if (this.pieceBodies.length > 0) {
			this.pieceBodies.forEach((pb) => {
				const body = this.physicsBodies.find((b) => b.label === `piece-${pb.id}`);
				if (body) {
					Body.applyForce(body, body.position, {
						x: (Math.random() - 0.5) * 0.1 * body.mass,
						y: -0.15 * body.mass
					});
				}
			});
		}
		this.comboCount = 0;
	}

	private createParticles(x: number, y: number, color: string, count = 5) {
		for (let i = 0; i < count; i++) {
			this.particles.push({
				id: Math.random().toString(36).substring(2) + Date.now(),
				x,
				y,
				vx: (Math.random() - 0.5) * 8,
				vy: (Math.random() - 0.5) * 8,
				life: 1.0,
				color
			});
		}
		if (this.particles.length > 30) this.particles = this.particles.slice(-30);
	}

	destroy() {
		this.spawnTimeouts.forEach(clearTimeout);
		if (this.engine) Engine.clear(this.engine);
		if (this.runner) Runner.stop(this.runner);
	}
}

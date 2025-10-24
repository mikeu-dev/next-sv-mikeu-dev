// src/lib/components/guest/navbar/navbar.svelte.ts
import Matter from 'matter-js';

export function setupMatter(anchorElement: HTMLAnchorElement, headerElement: HTMLElement, devSpan: HTMLElement) {
	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Constraint } = Matter;

	const engine = Engine.create();
	engine.gravity.y = 0.6;
	const world = engine.world;

	const runner = Runner.create();

	const headerRect = headerElement.getBoundingClientRect();
	const wallOptions = { isStatic: true, render: { visible: false } };

	Composite.add(world, [
		Bodies.rectangle(headerRect.width / 2, headerRect.height + 20, headerRect.width, 40, wallOptions),
		Bodies.rectangle(headerRect.width + 20, headerRect.height / 2, 40, headerRect.height, wallOptions),
		Bodies.rectangle(-20, headerRect.height / 2, 40, headerRect.height, wallOptions)
	]);

	const devRect = devSpan.getBoundingClientRect();
	const initialX = devRect.left - headerRect.left + devRect.width / 2;
	const initialY = devRect.top - headerRect.top + devRect.height / 2;

	const devBody = Bodies.rectangle(initialX, initialY, devRect.width, devRect.height, {
		restitution: 0.6,
		friction: 0.05,
		density: 0.001
	});

	const pivotPoint = {
		x: initialX + devRect.width / 2,
		y: initialY + devRect.height / 2
	};

	const constraint = Constraint.create({
		bodyB: devBody,
		pointB: { x: devRect.width / 2, y: devRect.height / 2 },
		pointA: pivotPoint,
		stiffness: 1,
		length: 0
	});

	Composite.add(world, [devBody, constraint]);

	const mouse = Mouse.create(devSpan.ownerDocument.body);
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: { stiffness: 0.2, render: { visible: false } }
	});
	Composite.add(world, mouseConstraint);

	const handleHover = () => {
		Matter.Body.applyForce(devBody, devBody.position, {
			x: Math.random() * 0.01 - 0.005,
			y: -0.025
		});
	};

	anchorElement.addEventListener('mouseenter', handleHover);
	Runner.run(runner, engine);

	(function update() {
		if (engine.world.bodies.length === 0) return;
		requestAnimationFrame(update);
		const { x, y } = devBody.position;
		const angle = devBody.angle;
		devSpan.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;
	})();

	return () => {
		Runner.stop(runner);
		Matter.Engine.clear(engine);
		anchorElement.removeEventListener('mouseenter', handleHover);
	};
}

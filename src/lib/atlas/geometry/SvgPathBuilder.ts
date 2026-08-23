import type { AtlasPoint } from '../core/types';

export class SvgPathBuilder {
	private commands: string[] = [];

	public moveTo(x: number, y: number): this {
		this.commands.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
		return this;
	}

	public lineTo(x: number, y: number): this {
		this.commands.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
		return this;
	}

	public curveTo(
		cp1x: number,
		cp1y: number,
		cp2x: number,
		cp2y: number,
		x: number,
		y: number
	): this {
		this.commands.push(
			`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
		);
		return this;
	}

	public quadTo(cpx: number, cpy: number, x: number, y: number): this {
		this.commands.push(`Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`);
		return this;
	}

	public close(): this {
		this.commands.push('Z');
		return this;
	}

	public build(): string {
		return this.commands.join(' ');
	}

	public static fromPoints(points: readonly AtlasPoint[], closed: boolean = false): string {
		if (points.length === 0) return '';
		const builder = new SvgPathBuilder();
		const [first, ...rest] = points;
		if (first) {
			builder.moveTo(first.x, first.y);
			for (const p of rest) {
				builder.lineTo(p.x, p.y);
			}
			if (closed) {
				builder.close();
			}
		}
		return builder.build();
	}
}

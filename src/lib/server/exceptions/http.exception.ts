export class HttpException extends Error {
	constructor(
		public readonly status: number,
		public readonly message: string
	) {
		super(message);
	}
}

export class ValidationError extends HttpException {
	constructor(public readonly errors: Record<string, string[]>) {
		super(422, 'Validation Error');
	}
}

export class NotFoundException extends HttpException {
	constructor(message = 'Not Found') {
		super(404, message);
	}
}

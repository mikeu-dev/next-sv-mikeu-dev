export const prerender = false;

import { HttpException, ValidationError } from '@/lib/server/exceptions/http.exception.js';
import { ProjectsRepository } from '@/lib/server/repositories/projects.repository';
import { ProjectsService } from '@/lib/server/services/projects.service';

const projectsService = new ProjectsService(new ProjectsRepository());

export async function POST({ request }) {
	try {
		const body = await request.json();
		const project = await projectsService.create(body);
		return Response.json(project, { status: 201 });
	} catch (e) {
		if (e instanceof ValidationError) {
			return Response.json({ message: e.message, errors: e.errors }, { status: e.status });
		}
		if (e instanceof HttpException) {
			return Response.json({ message: e.message }, { status: e.status });
		}
		return Response.json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

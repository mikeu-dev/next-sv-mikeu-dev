export const prerender = false;

import { HttpException, ValidationError } from '@/lib/server/exceptions/http.exception.js';
import { ProjectsRepository } from '@/lib/server/repositories/projects.repository';
import { ProjectsService } from '@/lib/server/services/projects.service';
import { json } from '@sveltejs/kit';

const projectsService = new ProjectsService(new ProjectsRepository());

export async function POST({ request }) {
	try {
		const body = await request.json();
		const project = await projectsService.create(body);
		return json(project, { status: 201 });
	} catch (e) {
		if (e instanceof ValidationError) {
			return json({ message: e.message, errors: e.errors }, { status: e.status });
		}
		if (e instanceof HttpException) {
			return json({ message: e.message }, { status: e.status });
		}
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

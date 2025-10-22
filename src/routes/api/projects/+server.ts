import { json } from '@sveltejs/kit';
import { ProjectsService } from '../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../lib/server/repositories/projects.repository';
import { HttpException, ValidationError } from '../../../lib/server/exceptions/http.exception';

const projectsService = new ProjectsService(new ProjectsRepository());

export async function GET() {
  try {
    const projects = await projectsService.findAll();
    return json(projects);
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

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

import { json } from '@sveltejs/kit';
import { ProjectsService } from '../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../lib/server/repositories/projects.repository';
import { HttpException } from '../../../lib/server/exceptions/http.exception';

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



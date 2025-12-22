import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ProjectsService } from '../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../lib/server/repositories/projects.repository';
import { HttpException } from '../../../lib/server/exceptions/http.exception';

const projectsService = new ProjectsService(new ProjectsRepository());

export async function GET({ url }) {
  try {
    const lang = url.searchParams.get('lang') as 'en' | 'id' | null;
    const projects = await projectsService.findAll();

    // Filter by language if specified
    if (lang) {
      const filtered = projects.filter(p => p.lang === lang);
      return json(filtered);
    }

    return json(projects);
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST({ request }: RequestEvent) {
  try {
    const data = await request.json();
    const project = await projectsService.create(data);
    return json(project, { status: 201 });
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ProjectsService } from '../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../lib/server/repositories/projects.repository';
import { HttpException } from '../../../lib/server/exceptions/http.exception';
import { projectSchema } from '$lib/server/schemas/project.schema';
import { logError } from '$lib/server/utils/logger';
import { env } from '$lib/server/config/env';
import { z } from 'zod';

const projectsService = new ProjectsService(new ProjectsRepository());

export async function GET() {
  try {
    const projects = await projectsService.findAll();
    return json(projects);
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    logError('API:Projects:GET', e);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST({ request, locals }: RequestEvent) {
  // Auth check - only owner can create projects
  if (!locals.user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (locals.user.email !== env.OWNER_EMAIL) {
    return json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();

    // Validate input
    const validatedData = projectSchema.parse(data);

    const project = await projectsService.create(validatedData);
    return json(project, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return json(
        {
          message: 'Validation error',
          errors: e.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
        },
        { status: 400 }
      );
    }
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    logError('API:Projects:POST', e);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

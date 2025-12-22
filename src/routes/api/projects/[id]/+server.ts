import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ProjectsService } from '../../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../../lib/server/repositories/projects.repository';
import { HttpException } from '../../../../lib/server/exceptions/http.exception';
import { projectUpdateSchema } from '$lib/server/schemas/project.schema';
import { logError } from '$lib/server/utils/logger';
import { env } from '$lib/server/config/env';
import { z } from 'zod';

const projectsService = new ProjectsService(new ProjectsRepository());

// Disable prerendering for this endpoint since it has mutative methods (PUT, DELETE)
export const prerender = false;

export async function GET({ params }: RequestEvent) {
    try {
        if (!params.id) {
            return json({ message: 'Project ID is required' }, { status: 400 });
        }
        const project = await projectsService.findById(params.id);
        if (!project) {
            return json({ message: 'Project not found' }, { status: 404 });
        }
        return json(project);
    } catch (e) {
        if (e instanceof HttpException) {
            return json({ message: e.message }, { status: e.status });
        }
        logError('API:Projects:GET:ById', e);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT({ params, request, locals }: RequestEvent) {
    // Auth check - only owner can update projects
    if (!locals.user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (locals.user.email !== env.OWNER_EMAIL) {
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        if (!params.id) {
            return json({ message: 'Project ID is required' }, { status: 400 });
        }
        const data = await request.json();

        // Validate input (partial update)
        const validatedData = projectUpdateSchema.parse({ ...data, id: params.id });
        const { id, ...updateData } = validatedData;

        const project = await projectsService.update(params.id, updateData);
        if (!project) {
            return json({ message: 'Project not found' }, { status: 404 });
        }
        return json(project);
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
        logError('API:Projects:PUT', e);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE({ params, locals }: RequestEvent) {
    // Auth check - only owner can delete projects
    if (!locals.user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (locals.user.email !== env.OWNER_EMAIL) {
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        if (!params.id) {
            return json({ message: 'Project ID is required' }, { status: 400 });
        }
        await projectsService.delete(params.id);
        return json({ message: 'Project deleted successfully' });
    } catch (e) {
        if (e instanceof HttpException) {
            return json({ message: e.message }, { status: e.status });
        }
        logError('API:Projects:DELETE', e);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

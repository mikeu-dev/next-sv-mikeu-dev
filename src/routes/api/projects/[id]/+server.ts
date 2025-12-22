import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ProjectsService } from '../../../../lib/server/services/projects.service';
import { ProjectsRepository } from '../../../../lib/server/repositories/projects.repository';
import { HttpException } from '../../../../lib/server/exceptions/http.exception';

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
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT({ params, request }: RequestEvent) {
    try {
        if (!params.id) {
            return json({ message: 'Project ID is required' }, { status: 400 });
        }
        const data = await request.json();
        const project = await projectsService.update(params.id, data);
        if (!project) {
            return json({ message: 'Project not found' }, { status: 404 });
        }
        return json(project);
    } catch (e) {
        if (e instanceof HttpException) {
            return json({ message: e.message }, { status: e.status });
        }
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE({ params }: RequestEvent) {
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
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

import { BaseService } from '../core/base.service';
import { ProjectsRepository } from '../repositories/projects.repository';
import type { Project } from '../../types';
import { projectSchema } from '../schemas/project.schema';
import { ValidationError } from '../exceptions/http.exception';

export class ProjectsService extends BaseService<Project, ProjectsRepository> {
	constructor(repository: ProjectsRepository) {
		super(repository);
	}

	async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
		const validation = projectSchema.safeParse(data);
		if (!validation.success) {
			throw new ValidationError(validation.error.flatten().fieldErrors);
		}

		return super.create({
			...data,
			createdAt: new Date(),
			updatedAt: new Date()
		} as Project);
	}

	async update(
		id: string,
		data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
	): Promise<Project | null> {
		const validation = projectSchema.partial().safeParse(data);
		if (!validation.success) {
			throw new ValidationError(validation.error.flatten().fieldErrors);
		}

		return super.update(id, {
			...data,
			updatedAt: new Date()
		});
	}

	async getProjectBySlug(slug: string): Promise<Project | null> {
		return this.repository.findBySlug(slug);
	}

	async findProjects(options: {
		tag?: string;
		limit?: number;
		orderBy?: string;
		orderDirection?: 'asc' | 'desc';
	}): Promise<Project[]> {
		const where: [string, '==' | '>=' | '<=' | 'array-contains', unknown][] = [];
		// Note: Firestore array-contains on object arrays is tricky.
		// For now, we will handle complex filtering on the client-side
		// if the dataset is small, or prepare the server for basic queries.

		return this.repository.findWithQuery({
			where: where.length > 0 ? where : undefined,
			limit: options.limit,
			orderBy: options.orderBy
				? { field: options.orderBy, direction: options.orderDirection || 'desc' }
				: { field: 'createdAt', direction: 'desc' }
		});
	}
}

export const projectsService = new ProjectsService(new ProjectsRepository());

import { BaseService } from '../core/base.service';
import type { ProjectsRepository } from '../repositories/projects.repository';
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
}

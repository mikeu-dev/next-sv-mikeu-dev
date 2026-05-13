import { BaseService } from '../core/base.service';
import { ProjectsRepository } from '../repositories/projects.repository';
import type { Project } from '../../types';
import { projectSchema } from '../schemas/project.schema';
import { ValidationError } from '../exceptions/http.exception';
import { persistentCache } from '../utils/cache.util';

export class ProjectsService extends BaseService<Project, ProjectsRepository> {
	constructor(repository: ProjectsRepository) {
		super(repository);
	}

	async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
		const validation = projectSchema.safeParse(data);
		if (!validation.success) {
			throw new ValidationError(validation.error.flatten().fieldErrors);
		}

		const result = await super.create({
			...data,
			createdAt: new Date(),
			updatedAt: new Date()
		} as Project);

		// Invalidate cache
		persistentCache.clear('projects_list');
		return result;
	}

	async update(
		id: string,
		data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
	): Promise<Project | null> {
		const validation = projectSchema.partial().safeParse(data);
		if (!validation.success) {
			throw new ValidationError(validation.error.flatten().fieldErrors);
		}

		const result = await super.update(id, {
			...data,
			updatedAt: new Date()
		});

		// Invalidate cache
		persistentCache.clear('projects_list');
		persistentCache.clear(`project_${id}`);
		return result;
	}

	async getProjectBySlug(slug: string): Promise<Project | null> {
		return persistentCache.getWithFetch(`project_slug_${slug}`, async () => {
			try {
				return await this.repository.findBySlug(slug);
			} catch (error: unknown) {
				if (
					error &&
					typeof error === 'object' &&
					'code' in error &&
					(error as { code: number }).code === 8
				) {
					console.error('ProjectsService: Quota exceeded while fetching project by slug');
					return null;
				}
				throw error;
			}
		});
	}

	async findProjects(options: {
		tag?: string;
		limit?: number;
		offset?: number;
		orderBy?: string;
		orderDirection?: 'asc' | 'desc';
	}): Promise<Project[]> {
		// Use cache if no specific filtering/limit is requested for the main list
		const isMainList = !options.tag && !options.offset && (!options.limit || options.limit >= 50);

		if (isMainList) {
			return persistentCache.getWithFetch('projects_list', async () => this.fetchFromRepo(options));
		}

		return this.fetchFromRepo(options);
	}

	private async fetchFromRepo(options: {
		tag?: string;
		limit?: number;
		offset?: number;
		orderBy?: string;
		orderDirection?: 'asc' | 'desc';
	}): Promise<Project[]> {
		try {
			const where: [string, '==' | '>=' | '<=' | 'array-contains', unknown][] = [];
			return await this.repository.findWithQuery({
				where: where.length > 0 ? where : undefined,
				limit: options.limit,
				offset: options.offset,
				orderBy: options.orderBy
					? { field: options.orderBy, direction: options.orderDirection || 'desc' }
					: { field: 'createdAt', direction: 'desc' }
			});
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('ProjectsService: Quota exceeded while fetching projects');
				return persistentCache.get<Project[]>('projects_list') || [];
			}
			throw error;
		}
	}
}

export const projectsService = new ProjectsService(new ProjectsRepository());

import { BaseService } from '../core/base.service';
import { ProjectsRepository } from '../repositories/projects.repository';
import type { Project } from '../../types';
import { projectSchema } from '../schemas/project.schema';
import { ValidationError } from '../exceptions/http.exception';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class ProjectsService extends BaseService<Project, ProjectsRepository> {
	constructor(repository: ProjectsRepository) {
		super(repository);
	}

	// In-memory cache
	private static cache: Project[] | null = null;
	private static lastFetch = 0;
	private static CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
		ProjectsService.cache = null;
		if (dev) persistentCache.clear('projects_list');
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
		ProjectsService.cache = null;
		if (dev) persistentCache.clear('projects_list');
		return result;
	}

	async getProjectBySlug(slug: string): Promise<Project | null> {
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
	}

	async findProjects(options: {
		tag?: string;
		limit?: number;
		offset?: number;
		orderBy?: string;
		orderDirection?: 'asc' | 'desc';
	}): Promise<Project[]> {
		const now = Date.now();

		// Use cache if no specific filtering/limit is requested for the main list
		const isMainList = !options.tag && !options.offset && (!options.limit || options.limit >= 50);

		if (isMainList) {
			if (ProjectsService.cache && now - ProjectsService.lastFetch < ProjectsService.CACHE_TTL) {
				console.log('⚡ ProjectsService: Memory Cache Hit');
				return ProjectsService.cache;
			}

			if (dev) {
				const cached = persistentCache.get<Project[]>('projects_list');
				if (cached) {
					console.log('📂 ProjectsService: File Cache Hit');
					ProjectsService.cache = cached;
					ProjectsService.lastFetch = now;
					return cached;
				}
			}
		}

		try {
			const where: [string, '==' | '>=' | '<=' | 'array-contains', unknown][] = [];
			const result = await this.repository.findWithQuery({
				where: where.length > 0 ? where : undefined,
				limit: options.limit,
				offset: options.offset,
				orderBy: options.orderBy
					? { field: options.orderBy, direction: options.orderDirection || 'desc' }
					: { field: 'createdAt', direction: 'desc' }
			});

			if (isMainList) {
				ProjectsService.cache = result;
				ProjectsService.lastFetch = now;
				if (dev) persistentCache.set('projects_list', result);
			}

			return result;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('ProjectsService: Quota exceeded while fetching projects');
				return persistentCache.get<Project[]>('projects_list') || ProjectsService.cache || [];
			}
			throw error;
		}
	}
}

export const projectsService = new ProjectsService(new ProjectsRepository());

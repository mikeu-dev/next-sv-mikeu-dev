import { BaseService } from '../core/base.service';
import type { ProjectsRepository } from '../repositories/projects.repository';
import type { Project } from '../../types';
import { z } from 'zod';
import { ValidationError } from '../exceptions/http.exception';

const projectSchema = z.object({
  title_id: z.string().min(1, 'Title (ID) is required'),
  title_en: z.string().min(1, 'Title (EN) is required'),
  description_id: z.string().min(1, 'Description (ID) is required'),
  description_en: z.string().min(1, 'Description (EN) is required'),
  slug: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean(),
});

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
      updatedAt: new Date(),
    } as Project);
  }

  async update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    const validation = projectSchema.partial().safeParse(data);
    if (!validation.success) {
      throw new ValidationError(validation.error.flatten().fieldErrors);
    }

    return super.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }
}
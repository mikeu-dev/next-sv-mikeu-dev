import { BaseService } from '../core/base.service';
import type { Project, ProjectsRepository } from '../repositories/projects.repository';
import { z } from 'zod';
import { ValidationError } from '../exceptions/http.exception';

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  thumbnailUrl: z.string().url(),
  repoUrl: z.string().url(),
  demoUrl: z.string().url(),
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
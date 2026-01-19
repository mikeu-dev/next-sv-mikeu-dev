import type { BaseRepository } from './base.repository';

export abstract class BaseService<T, R extends BaseRepository<T>> {
	protected constructor(protected readonly repository: R) {}

	async create(data: T): Promise<T> {
		return this.repository.create(data);
	}

	async findAll(): Promise<T[]> {
		return this.repository.findAll();
	}

	async findById(id: string): Promise<T | null> {
		return this.repository.findById(id);
	}

	async update(id: string, data: Partial<T>): Promise<T | null> {
		return this.repository.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}

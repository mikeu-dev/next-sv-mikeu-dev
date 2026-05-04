import { ProjectReactionRepository, type ProjectReaction } from '../repositories/project-reaction.repository';

export class ProjectReactionService {
	private repository = new ProjectReactionRepository();

	async getReactions(slug: string): Promise<ProjectReaction | null> {
		return this.repository.findById(slug);
	}

	async like(slug: string) {
		await this.repository.incrementLikes(slug);
		return this.getReactions(slug);
	}

	async trackView(slug: string) {
		await this.repository.incrementViews(slug);
		return this.getReactions(slug);
	}
}

export const projectReactionService = new ProjectReactionService();

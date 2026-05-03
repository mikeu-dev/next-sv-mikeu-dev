import { ReactionRepository, type BlogReaction } from '../repositories/reaction.repository';

export class ReactionService {
	private repository = new ReactionRepository();

	async getReactions(slug: string): Promise<BlogReaction | null> {
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

export const reactionService = new ReactionService();

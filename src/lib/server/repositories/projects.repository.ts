import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

import type { Project } from '../../types';

import { db } from '../firebase/firebase.server';

export class ProjectsRepository extends BaseRepository<Project> {
  constructor() {
    super(COLLECTIONS.PROJECTS);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const snapshot = await db.collection(COLLECTIONS.PROJECTS).where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    return { ...snapshot.docs[0].data() as Project, id: snapshot.docs[0].id };
  }
}
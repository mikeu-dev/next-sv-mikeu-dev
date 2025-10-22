import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

import type { Project } from '../../types';

export class ProjectsRepository extends BaseRepository<Project> {
  constructor() {
    super(COLLECTIONS.PROJECTS);
  }
}
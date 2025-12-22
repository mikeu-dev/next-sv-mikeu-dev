import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

import type { Contact } from '../../types';

export class ContactsRepository extends BaseRepository<Contact> {
  constructor() {
    super(COLLECTIONS.CONTACTS);
  }
}

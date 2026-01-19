import { db } from '../firebase/firebase.server';

export abstract class BaseRepository<T> {
	protected constructor(private readonly collectionName: string) {}

	async create(data: Omit<T, 'id'>): Promise<T> {
		const docRef = await db.collection(this.collectionName).add(data);
		return { ...data, id: docRef.id } as unknown as T;
	}

	async findAll(): Promise<T[]> {
		const snapshot = await db.collection(this.collectionName).get();
		return snapshot.docs.map((doc) => ({ ...(doc.data() as T), id: doc.id }));
	}

	async findById(id: string): Promise<T | null> {
		const doc = await db.collection(this.collectionName).doc(id).get();
		if (!doc.exists) {
			return null;
		}
		return { ...(doc.data() as T), id: doc.id };
	}

	async update(id: string, data: Partial<T>): Promise<T | null> {
		await db.collection(this.collectionName).doc(id).update(data);
		return this.findById(id);
	}

	async delete(id: string): Promise<void> {
		await db.collection(this.collectionName).doc(id).delete();
	}
}

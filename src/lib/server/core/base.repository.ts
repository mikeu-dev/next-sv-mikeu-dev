import { db } from '../firebase/firebase.server';

export abstract class BaseRepository<T> {
	protected constructor(private readonly collectionName: string) {}

	protected getCollection() {
		return db.collection(this.collectionName);
	}

	protected toPOJO(data: unknown): T {
		if (!data || typeof data !== 'object') return data as T;

		// Handle array
		if (Array.isArray(data)) {
			return data.map((item) => this.toPOJO(item)) as unknown as T;
		}

		const pojo = { ...(data as Record<string, unknown>) };

		// Handle Firestore Timestamps and other complex objects
		for (const key in pojo) {
			if (Object.prototype.hasOwnProperty.call(pojo, key)) {
				const value = pojo[key];

				// Check if it's a Firestore Timestamp (has toDate method)
				if (
					value &&
					typeof value === 'object' &&
					'toDate' in value &&
					typeof (value as { toDate: unknown }).toDate === 'function'
				) {
					pojo[key] = (value as { toDate: () => Date }).toDate();
				} else if (Array.isArray(value)) {
					// Recursively handle arrays
					pojo[key] = value.map((item) => this.toPOJO(item));
				} else if (value && typeof value === 'object' && !(value instanceof Date)) {
					// Recursively handle nested objects, but skip standard Date objects
					pojo[key] = this.toPOJO(value);
				}
			}
		}

		return pojo as T;
	}

	async create(data: Omit<T, 'id'>): Promise<T> {
		const docRef = await db.collection(this.collectionName).add(data);
		return { ...data, id: docRef.id } as unknown as T;
	}

	async findAll(): Promise<T[]> {
		const snapshot = await db.collection(this.collectionName).get();
		return snapshot.docs.map((doc) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		}));
	}

	async findById(id: string): Promise<T | null> {
		const doc = await db.collection(this.collectionName).doc(id).get();
		if (!doc.exists) {
			return null;
		}
		return { ...this.toPOJO(doc.data()), id: doc.id };
	}

	async update(id: string, data: Partial<T>): Promise<T | null> {
		await db.collection(this.collectionName).doc(id).update(data);
		return this.findById(id);
	}

	async delete(id: string): Promise<void> {
		await db.collection(this.collectionName).doc(id).delete();
	}
}

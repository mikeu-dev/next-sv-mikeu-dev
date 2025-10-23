import { HttpException } from '../exceptions/http.exception';
import { db } from '../firebase/firebase.server';

interface UserData {
	uid: string;
	email: string;
	username: string;
	createdAt: Date;
}

export class UserService {
	private usersCollection = db.collection('users');

	async createUser(uid: string, email: string, username: string): Promise<void> {
		const normalizedUsername = username.toLowerCase();
		const snapshot = await this.usersCollection.where('username', '==', normalizedUsername).get();

		if (!snapshot.empty) {
			throw new HttpException(409, 'Username already exists');
		}

		const userData: UserData = {
			uid,
			email,
			username: normalizedUsername,
			createdAt: new Date()
		};

		await this.usersCollection.doc(uid).set(userData);
	}

	async findByUsername(username: string): Promise<{ email: string } | null> {
		const normalizedUsername = username.toLowerCase();
		const snapshot = await this.usersCollection
			.where('username', '==', normalizedUsername)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}
		const userDoc = snapshot.docs[0];
		return { email: userDoc.data().email };
	}
}

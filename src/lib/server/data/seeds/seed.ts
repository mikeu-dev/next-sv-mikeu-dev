import { db, auth } from '@/lib/server/firebase/firebase.server';
import { env } from '$env/dynamic/private';

if (!env.EMAIL) {
	throw new Error('EMAIL is not defined');
}
if (!env.USERNAME) {
	throw new Error('USERNAME is not defined');
}
if (!env.PASSWORD) {
	throw new Error('PASSWORD is not defined');
}
// Daftar pengguna yang akan dibuat
const usersToSeed = [
	{
		email: env.EMAIL,
		password: env.PASSWORD,
		username: env.USERNAME
	}
];

export async function seedUsers() {
	console.log('🚀 Starting user seeder...');

	for (const userData of usersToSeed) {
		const { email, password, username } = userData;
		const normalizedUsername = username.toLowerCase();

		try {
			// Cek apakah pengguna sudah ada di Auth
			const existingAuthUser = await auth.getUserByEmail(email).catch(() => null);
			if (existingAuthUser) {
				console.log(`⏩ User with email ${email} already exists in Auth. Skipping.`);
				continue;
			}

			// Cek apakah username sudah ada di Firestore
			const usernameQuery = await db
				.collection('users')
				.where('username', '==', normalizedUsername)
				.get();
			if (!usernameQuery.empty) {
				console.log(`⏩ User with username ${username} already exists in Firestore. Skipping.`);
				continue;
			}

			// 1. Buat pengguna di Firebase Authentication
			const userRecord = await auth.createUser({
				email: email,
				password: password,
				emailVerified: true // Anggap sudah terverifikasi untuk kemudahan
			});

			// 2. Buat dokumen di Firestore
			await db.collection('users').doc(userRecord.uid).set({
				uid: userRecord.uid,
				email: email,
				username: normalizedUsername,
				createdAt: new Date()
			});

			console.log(`✅ Successfully created user: ${email} (${username})`);
		} catch (error: unknown) {
			let message = 'An unknown error occurred';
			if (error instanceof Error) {
				// Firebase errors often have more specific messages
				message = error.message;
			}
			console.error(`❌ Error creating user ${email}:`, message);
		}
	}

	console.log('🌱 Seeding complete!');
}

seedUsers().catch(console.error);

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { env } from '$env/dynamic/private';

if (!getApps().length) {
	const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;

	if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
		try {
			admin.initializeApp({
				credential: admin.credential.cert({
					projectId: FIREBASE_PROJECT_ID,
					clientEmail: FIREBASE_CLIENT_EMAIL,
					privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
				}),
				databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
			});
			admin.firestore().settings({ ignoreUndefinedProperties: true });
		} catch (error) {
			console.error('Failed to initialize Firebase Admin:', error);
		}
	} else {
		console.error('Missing required Firebase environment variables.');
	}
}

export const db: admin.firestore.Firestore | null = getApps().length ? admin.firestore() : null;

export const auth: admin.auth.Auth | null = getApps().length ? admin.auth() : null;
export { admin };

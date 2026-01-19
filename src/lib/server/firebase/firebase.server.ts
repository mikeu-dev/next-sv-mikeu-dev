import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import {
	FIREBASE_PROJECT_ID,
	FIREBASE_CLIENT_EMAIL,
	FIREBASE_PRIVATE_KEY
} from '$env/static/private';

if (!getApps().length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: FIREBASE_PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
		}),
		databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
	});
}

export const db = admin.firestore();
export const auth = admin.auth();

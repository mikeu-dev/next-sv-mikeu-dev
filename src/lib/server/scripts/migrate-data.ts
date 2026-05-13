/**
 * Migration script untuk memindahkan data lokal ke Firestore
 *
 * Data yang akan dimigrasi:
 * - techstack (en & id)
 * - journey (en & id)
 * - skills (en & id)
 * - socials
 *
 * Cara menjalankan:
 * node --loader ts-node/esm src/lib/server/scripts/migrate-data.ts
 */

import 'dotenv/config';
import admin from 'firebase-admin';
import { COLLECTIONS } from '../firebase/collections';

// Initialize Firebase Admin locally for script execution
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: FIREBASE_PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
		})
	});
}

const db = admin.firestore();

/**
 * membersihkan data dari objek non-serializable (seperti komponen Svelte)
 * sebelum dikirim ke Firestore.
 */
function sanitize(data: unknown): unknown {
	if (!data) return data;

	if (Array.isArray(data)) {
		return data.map((item) => sanitize(item));
	}

	if (typeof data === 'object' && !(data instanceof Date)) {
		const result: Record<string, unknown> = {};
		const obj = data as Record<string, unknown>;

		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const value = obj[key];

				// Lewati komponen Svelte (fungsi) atau objek yang tidak didukung Firestore
				if (typeof value === 'function') {
					continue;
				}

				if (value && typeof value === 'object' && !(value instanceof Date)) {
					result[key] = sanitize(value);
				} else {
					result[key] = value;
				}
			}
		}
		return result;
	}

	return data;
}

// Import data lokal
import { techStack } from '../../data/techstack';
import { journey } from '../../data/journey';
import { skills } from '../../data/skills';
import { socialLinks } from '../../data/socials';

async function migrateTechStack() {
	console.log('ðŸš€ Migrating TechStack data...');

	try {
		// Simpan data EN
		await db
			.collection(COLLECTIONS.TECHSTACK)
			.doc('en')
			.set({
				categories: sanitize(techStack.en),
				updatedAt: new Date()
			});

		// Simpan data ID
		await db
			.collection(COLLECTIONS.TECHSTACK)
			.doc('id')
			.set({
				categories: sanitize(techStack.id),
				updatedAt: new Date()
			});

		console.log('âœ… TechStack migrated successfully');
	} catch (error) {
		console.error('âŒ Error migrating TechStack:', error);
		throw error;
	}
}

async function migrateJourney() {
	console.log('ðŸš€ Migrating Journey data...');

	try {
		// Simpan data EN
		await db
			.collection(COLLECTIONS.JOURNEY)
			.doc('en')
			.set({
				items: sanitize(journey.en),
				updatedAt: new Date()
			});

		// Simpan data ID
		await db
			.collection(COLLECTIONS.JOURNEY)
			.doc('id')
			.set({
				items: sanitize(journey.id),
				updatedAt: new Date()
			});

		console.log('âœ… Journey migrated successfully');
	} catch (error) {
		console.error('âŒ Error migrating Journey:', error);
		throw error;
	}
}

async function migrateSkills() {
	console.log('ðŸš€ Migrating Skills data...');

	try {
		// Simpan data EN
		await db
			.collection(COLLECTIONS.SKILLS)
			.doc('en')
			.set({
				items: sanitize(skills.en),
				updatedAt: new Date()
			});

		// Simpan data ID
		await db
			.collection(COLLECTIONS.SKILLS)
			.doc('id')
			.set({
				items: sanitize(skills.id),
				updatedAt: new Date()
			});

		console.log('âœ… Skills migrated successfully');
	} catch (error) {
		console.error('âŒ Error migrating Skills:', error);
		throw error;
	}
}

async function migrateSocials() {
	console.log('ðŸš€ Migrating Socials data...');

	try {
		// Social links tidak perlu multi-language
		await db
			.collection(COLLECTIONS.SOCIALS)
			.doc('default')
			.set({
				links: sanitize(socialLinks),
				updatedAt: new Date()
			});

		console.log('âœ… Socials migrated successfully');
	} catch (error) {
		console.error('âŒ Error migrating Socials:', error);
		throw error;
	}
}

async function main() {
	console.log('ðŸ“¦ Starting data migration to Firestore...\n');

	try {
		await migrateTechStack();
		await migrateJourney();
		await migrateSkills();
		await migrateSocials();

		console.log('\nâœ¨ All data migrated successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\nðŸ’¥ Migration failed:', error);
		process.exit(1);
	}
}

// Run migration
main();

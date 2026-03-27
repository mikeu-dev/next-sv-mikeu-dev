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
const {
	FIREBASE_PROJECT_ID,
	FIREBASE_CLIENT_EMAIL,
	FIREBASE_PRIVATE_KEY
} = process.env;

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

// Import data lokal
import { techStack } from '../../data/techstack';
import { journey } from '../../data/journey';
import { skills } from '../../data/skills';
import { socialLinks } from '../../data/socials';

async function migrateTechStack() {
	console.log('🚀 Migrating TechStack data...');

	try {
		// Simpan data EN
		await db.collection(COLLECTIONS.TECHSTACK).doc('en').set({
			categories: techStack.en,
			updatedAt: new Date()
		});

		// Simpan data ID
		await db.collection(COLLECTIONS.TECHSTACK).doc('id').set({
			categories: techStack.id,
			updatedAt: new Date()
		});

		console.log('✅ TechStack migrated successfully');
	} catch (error) {
		console.error('❌ Error migrating TechStack:', error);
		throw error;
	}
}

async function migrateJourney() {
	console.log('🚀 Migrating Journey data...');

	try {
		// Simpan data EN
		await db.collection(COLLECTIONS.JOURNEY).doc('en').set({
			items: journey.en,
			updatedAt: new Date()
		});

		// Simpan data ID
		await db.collection(COLLECTIONS.JOURNEY).doc('id').set({
			items: journey.id,
			updatedAt: new Date()
		});

		console.log('✅ Journey migrated successfully');
	} catch (error) {
		console.error('❌ Error migrating Journey:', error);
		throw error;
	}
}

async function migrateSkills() {
	console.log('🚀 Migrating Skills data...');

	try {
		// Simpan data EN
		await db.collection(COLLECTIONS.SKILLS).doc('en').set({
			items: skills.en,
			updatedAt: new Date()
		});

		// Simpan data ID
		await db.collection(COLLECTIONS.SKILLS).doc('id').set({
			items: skills.id,
			updatedAt: new Date()
		});

		console.log('✅ Skills migrated successfully');
	} catch (error) {
		console.error('❌ Error migrating Skills:', error);
		throw error;
	}
}

async function migrateSocials() {
	console.log('🚀 Migrating Socials data...');

	try {
		// Social links tidak perlu multi-language
		await db.collection(COLLECTIONS.SOCIALS).doc('default').set({
			links: socialLinks,
			updatedAt: new Date()
		});

		console.log('✅ Socials migrated successfully');
	} catch (error) {
		console.error('❌ Error migrating Socials:', error);
		throw error;
	}
}

async function main() {
	console.log('📦 Starting data migration to Firestore...\n');

	try {
		await migrateTechStack();
		await migrateJourney();
		await migrateSkills();
		await migrateSocials();

		console.log('\n✨ All data migrated successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n💥 Migration failed:', error);
		process.exit(1);
	}
}

// Run migration
main();

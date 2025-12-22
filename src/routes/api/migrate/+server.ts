import { json } from '@sveltejs/kit';
// import { db } from '$lib/server/firebase/firebase.server';
// import { COLLECTIONS } from '$lib/server/firebase/collections';
// import { techStack } from '$lib/data/techstack';
// import { journey } from '$lib/data/journey';
// import { skills } from '$lib/data/skills';
// import { socialLinks } from '$lib/data/socials';
// import { projects } from '$lib/data/projects';

export const POST = async () => {
    return json({ message: 'Migration endpoint disabled for production' }, { status: 403 });
};

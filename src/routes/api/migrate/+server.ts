import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';
import fs from 'fs';
import path from 'path';

// Helper to read file and regex replace icon objects with string names
function readAndParseFile(fileName: string) {
    try {
        const filePath = path.resolve('src/lib/data', fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return null;
        }

        let content = fs.readFileSync(filePath, 'utf-8');

        // Regex to find "icon: SiName" and replace with "iconName: 'SiName'"
        // This is a simple regex assumption that data is formatted as 'icon: SiName'
        // We also need to remove the import if we were eval-ing, but we aren't eval-ing.
        // Wait, we need to eval or parse this object. parsing TS/JS with regex to get object is hard.
        // Alternative: We import the file (require), get the object with "SiDefault", BUT
        // we essentially need the *mapping* of Item -> IconName.
        // Complex approach: Read file line by line?
        // Let's try Regex capture.

        // Find all items. format usually: { name: '...', icon: SiName, ... }
        // We can use a regex to capture relevant fields.

        // BETTER APPROACH:
        // 1. Regex to map "name: 'Foo'" -> "icon: SiName" in the text content.
        // 2. Import the actual data to get the structure (with SiDefault icons).
        // 3. Recursive walk the data, and for each item, match its name against the Regex map to restore the iconName.

        const nameIconMap = new Map<string, string>();
        const regex = /name:\s*['"](.+?)['"][\s\S]*?icon:\s*(Si\w+)/g;

        let match;
        while ((match = regex.exec(content)) !== null) {
            nameIconMap.set(match[1], match[2]);
        }

        // Also simplistic regex might fail if icon comes before name. 
        // Let's try another pass inverse: icon: SiName ... name: 'Foo'
        const regexReverse = /icon:\s*(Si\w+)[\s\S]*?name:\s*['"](.+?)['"]/g;
        while ((match = regexReverse.exec(content)) !== null) {
            if (!nameIconMap.has(match[2])) {
                nameIconMap.set(match[2], match[1]);
            }
        }

        return nameIconMap;
    } catch (e) {
        console.error(`Error parsing ${fileName}:`, e);
        return null;
    }
}

// Helper to recurse and patch icons
function patchIcons(data: any, iconMap: Map<string, string>): any {
    if (Array.isArray(data)) {
        return data.map(item => patchIcons(item, iconMap));
    } else if (typeof data === 'object' && data !== null) {
        if (data.name && iconMap.has(data.name)) {
            const iconName = iconMap.get(data.name);
            data.iconName = iconName;
            data.icon = iconName;
        }

        for (const key in data) {
            patchIcons(data[key], iconMap); // in-place modification is unsafe if we didn't deep copy, but we did via JSON.parse
        }
    }
    return data;
}


export const POST = async ({ request }: { request: Request }) => {
    const { action } = await request.json();

    if (action !== 'migrate-all') {
        return json({ error: 'Invalid action' }, { status: 400 });
    }

    const results = [];

    // list of files to migrate
    const files = [
        { name: 'techstack.ts', collection: COLLECTIONS.TECHSTACK, type: 'techstack' },
        { name: 'journey.ts', collection: COLLECTIONS.JOURNEY, type: 'journey' },
        { name: 'skills.ts', collection: COLLECTIONS.SKILLS, type: 'skills' },
        { name: 'socials.ts', collection: COLLECTIONS.SOCIALS, type: 'socials' },
        // projects.ts is missing according to previous checks
    ];

    try {
        for (const file of files) {
            try {
                // 1. Parse raw file to get name->iconName map
                const iconMap = readAndParseFile(file.name);

                // 2. Import actual data (will have SiDefault icons)
                let module;
                try {
                    // explicit dynamic import paths for Vite
                    // NOTE: These are commented out to prevent Vercel build errors since src/lib/data is gitignored.
                    // To run migration locally, uncomment these lines and ensure src/lib/data exists.
                    // if (file.name === 'techstack.ts') module = await import('$lib/data/techstack');
                    // if (file.name === 'journey.ts') module = await import('$lib/data/journey');
                    // if (file.name === 'skills.ts') module = await import('$lib/data/skills');
                    // if (file.name === 'socials.ts') module = await import('$lib/data/socials');

                    // Allow build to pass by throwing if we're not local/imports are missing
                    throw new Error("Local data files are git-ignored and not available in production builds.");
                } catch (err) {
                    results.push({ collection: file.collection, status: 'error', message: `Import failed: ${err}` });
                    continue;
                }

                if (!module) continue;

                // 3. Get the exported data variable
                const dataKey = Object.keys(module).find(k => k !== 'default'); // assumes named export matches file or is only export
                let rawData: any;
                if (dataKey) {
                    rawData = (module as any)[dataKey as string];
                } else {
                    rawData = (module as any).default;
                }

                // Nuclear option: JSON stringify/parse to force plain object and remove all functions/non-serializables immediately.
                // We do this BEFORE patching to get a clean slate, BUT this might remove the 'icon' function objects we need to reference?
                // Wait, if we stringify, 'icon' (function) becomes undefined or ignored.
                // WE NEED 'icon' to be present (even if we don't save it) to know the structure if potential regex mismatch?
                // Actually, regex map relies on 'name'. 
                // So if we stringify, we lose 'icon' property. THIS IS GOOD.
                // We just need to re-inject 'iconName' based on 'name'.

                // However, we still need to iterate to re-add iconName.
                // So: 
                // 1. Regex Map is ready.
                // 2. data = JSON.parse(JSON.stringify(rawData, (key, value) => {
                //      if (key === 'icon') return undefined; // explicitly strip icons
                //      return value;
                //    }));
                // 3. Recursive walk on this clean data to set iconName based on name.

                const cleanData = JSON.parse(JSON.stringify(rawData, (key, value) => {
                    if (key === 'icon') return undefined; // Strip original icon component
                    return value;
                }));

                const patchedData = iconMap ? patchIcons(cleanData, iconMap as Map<string, string>) : cleanData;

                // 5. Upload to Firestore
                // Structure depends on file. 
                // Techstack has { en: [...], id: [...] } usually, OR structure like { en: { categories: ... } }
                // Let's just save the root object as separate docs for en/id if possible, or single doc?
                // Existing services seem to expect 'en' and 'id' docs in the collection.

                if (file.type === 'techstack' || file.type === 'journey' || file.type === 'skills') {
                    // Assume structure { en: ..., id: ... }
                    if (patchedData.en) {
                        const dataToSave = Array.isArray(patchedData.en) ? { items: patchedData.en } : patchedData.en;
                        await db.collection(file.collection).doc('en').set(dataToSave);
                    }
                    if (patchedData.id) {
                        const dataToSave = Array.isArray(patchedData.id) ? { items: patchedData.id } : patchedData.id;
                        await db.collection(file.collection).doc('id').set(dataToSave);
                    }
                } else if (file.type === 'socials') {
                    // Socials usually list
                    const dataToSave = Array.isArray(patchedData) ? { items: patchedData } : patchedData;
                    await db.collection(file.collection).doc('main').set(dataToSave);
                }

                results.push({ collection: file.collection, status: 'success' });

            } catch (err: any) {
                console.error(`Error migrating ${file.name}:`, err);
                results.push({ collection: file.collection, status: 'error', message: err.message });
            }
        }

        return json({ results });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

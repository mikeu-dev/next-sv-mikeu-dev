import { flag } from '@vercel/flags/sveltekit';

export const showExperimentalFeature = flag<boolean>({
	key: 'showExperimentalFeature',
	description: 'Enable experimental UI features',
	options: [
		{ value: true, label: 'Enabled' },
		{ value: false, label: 'Disabled' }
	],
	decide() {
		// You can add logic here, e.g. based on user role or random sampling
		return false;
	}
});

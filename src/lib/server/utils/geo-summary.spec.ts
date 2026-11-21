import { describe, expect, it } from 'vitest';
import { geoEntries, geoKey, isPlottable, planGeoRepair } from './geo-summary';

describe('geo summary', () => {
	it('builds the same key the tracker writes', () => {
		expect(geoKey('US', 'Ashburn')).toBe('US::Ashburn');
		expect(geoKey('GB', null)).toBe('GB::unknown');
		expect(geoKey('XX', 'A/B')).toBe('XX::A_B');
	});

	it('lists only place entries', () => {
		const data = { updatedAt: 'x', _meta: { geoRepairAt: 'y' }, 'US::Ashburn': { count: 2 } };
		expect(geoEntries(data).map(([k]) => k)).toEqual(['US::Ashburn']);
	});

	it('fills places saved without location from recent logs', () => {
		const data = {
			updatedAt: 'x',
			'Indonesia::Jakarta (Dev)': {
				country: 'Indonesia',
				city: 'Jakarta (Dev)',
				latitude: -6.2,
				longitude: 106.8,
				count: 288
			},
			'ID::Bandung': { country: 'ID', city: 'Bandung', latitude: -6.9, longitude: 107.6, count: 3 },
			'US::Ashburn': { count: 2042, browsers: [], devices: [] },
			'GB::unknown': { count: 726 },
			'BR::Recife': { count: 4 }
		};
		const logs = [
			{ country: 'US', city: 'Ashburn', latitude: 39.04, longitude: -77.49 },
			{ country: 'US', city: 'Ashburn', latitude: 1, longitude: 1 }, // older
			{ country: 'GB', city: null, latitude: 51.5, longitude: -0.12 },
			{ country: 'FR', city: 'Paris', latitude: null, longitude: null }
		];

		const plan = planGeoRepair(data, logs);

		expect(plan.remove).toEqual(['Indonesia::Jakarta (Dev)']);
		expect(plan.patches['US::Ashburn']).toEqual({
			country: 'US',
			city: 'Ashburn',
			latitude: 39.04,
			longitude: -77.49
		});
		expect(plan.patches['GB::unknown']).toEqual({
			country: 'GB',
			city: null,
			latitude: 51.5,
			longitude: -0.12
		});
		// no log for it: label recovered from the key, still not plottable
		expect(plan.patches['BR::Recife']).toEqual({ country: 'BR', city: 'Recife' });
		expect(plan.unresolved).toEqual(['BR::Recife']);
		// already complete
		expect(plan.patches['ID::Bandung']).toBeUndefined();
		expect(isPlottable({ ...data['US::Ashburn'], ...plan.patches['US::Ashburn'] })).toBe(true);
	});
});

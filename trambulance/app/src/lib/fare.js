// Keep in sync with public.calc_fare() in supabase/schema.sql
export const AMBULANCE_TYPES = {
  basic: {
    key: 'basic', name: 'Basic Transport', desc: 'For non-critical patient transfers.',
    features: ['Stretcher', 'Wheelchair access', 'Basic medical support'],
    base: 1000, perKm: 150, fee: 225, icon: 'ambulance',
  },
  oxygen: {
    key: 'oxygen', name: 'Oxygen Support', desc: 'For transfers requiring oxygen support.',
    features: ['Oxygen equipment', 'Monitoring', 'Basic life support'],
    base: 1500, perKm: 200, fee: 300, icon: 'gas-cylinder',
  },
  icu: {
    key: 'icu', name: 'ICU Capable', desc: 'For critical care transfers.',
    features: ['Advanced life support', 'ICU equipment', 'Medical staff (varies by vehicle)'],
    base: 3000, perKm: 250, fee: 500, icon: 'heart-flash',
  },
};
export const TYPE_ORDER = ['basic', 'oxygen', 'icu'];

export function estimateFare(type, km) {
  const t = AMBULANCE_TYPES[type] || AMBULANCE_TYPES.basic;
  const distance = Math.round((km || 0) * t.perKm);
  const total = Math.round((t.base + distance + t.fee) / 10) * 10;
  return { base: t.base, distance, fee: total - t.base - distance, total };
}

export const offerBounds = (suggested) => ({ min: Math.ceil(suggested * 0.7), max: suggested * 3 });
export const counterBounds = (suggested) => ({ min: Math.ceil(suggested * 0.5), max: suggested * 3 });

// Rough pickup ETA from straight-line distance (city driving)
export function etaFromKm(km) {
  if (km == null) return null;
  return Math.max(3, Math.round(((km * 1.4) / 18) * 60));
}

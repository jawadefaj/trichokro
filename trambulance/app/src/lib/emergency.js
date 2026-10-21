import { C } from './theme';

export const EMERGENCIES = [
  { key: 'road_accident', label: 'Road Accident', icon: 'car-emergency', color: '#B45309', bg: '#FEF3E2',
    hint: 'Crash, fall or other injury', specialties: ['Trauma', 'Emergency', 'Orthopedics', 'Neurosurgery', 'Surgery'], ambulance: 'oxygen' },
  { key: 'heart', label: 'Heart', icon: 'heart-pulse', color: '#DC2626', bg: '#FDECEC',
    hint: 'Chest pain, heart attack signs', specialties: ['Cardiology', 'Cardiac Surgery', 'Critical Care'], ambulance: 'icu' },
  { key: 'stroke', label: 'Stroke', icon: 'brain', color: '#7C3AED', bg: '#F1EBFE',
    hint: 'Face drooping, arm weakness, slurred speech', specialties: ['Stroke', 'Neurology', 'Neurosurgery'], ambulance: 'icu' },
  { key: 'burn', label: 'Burn', icon: 'fire', color: '#EA580C', bg: '#FFF0E6',
    hint: 'Fire, electrical or chemical burns', specialties: ['Burn', 'Plastic Surgery', 'Emergency', 'Surgery'], ambulance: 'oxygen' },
  { key: 'icu', label: 'ICU Patient', icon: 'bed', color: '#0E7490', bg: '#E3F5F8',
    hint: 'Needs ventilator or intensive monitoring', specialties: ['Critical Care'], ambulance: 'icu' },
  { key: 'eye', label: 'Eye', icon: 'eye-outline', color: '#2563EB', bg: '#E8EFFD',
    hint: 'Eye injury, chemical splash, sudden vision loss', specialties: ['Eye', 'Ophthalmology', 'Cataract'], ambulance: 'basic' },
  { key: 'other', label: 'Other', icon: 'medical-bag', color: C.green, bg: C.mint,
    hint: 'Any other medical transport', specialties: ['Emergency', 'General', 'Medicine'], ambulance: 'basic' },
];

export const emergencyByKey = (k) => EMERGENCIES.find((e) => e.key === k) || EMERGENCIES[EMERGENCIES.length - 1];

// Returns { score, matches }: higher score = better specialty fit
export function matchHospital(hospital, emergency) {
  const list = (hospital.specialties || []).map((s) => s.toLowerCase());
  const n = emergency.specialties.length;
  let score = 0;
  const matches = [];
  emergency.specialties.forEach((sp, i) => {
    const key = sp.toLowerCase();
    if (list.some((h) => h === key || h.includes(key))) {
      score += (n - i) * 10;
      matches.push(sp);
    }
  });
  if (/24/.test(hospital.emergency_info || '')) score += 4;
  return { score, matches };
}

// Rank by specialty fit, nudged by distance (closer wins among similar fits)
export function recommendHospitals(hospitals, emergency, distOf) {
  return hospitals
    .map((h) => {
      const m = matchHospital(h, emergency);
      const d = distOf(h);
      return { ...h, matchScore: m.score, matches: m.matches, rank: m.score - (d == null ? 0 : d * 1.5) };
    })
    .filter((h) => h.matchScore > 4)
    .sort((a, b) => b.rank - a.rank);
}

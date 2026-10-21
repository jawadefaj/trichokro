export const C = {
  green: '#12753E',
  greenDark: '#0B5A2E',
  greenMid: '#1E9150',
  mint: '#E6F4EB',
  mintSoft: '#F3FAF5',
  red: '#E0262B',
  redDark: '#B51C21',
  redSoft: '#FDECEC',
  ink: '#132A1E',
  text: '#2B3D33',
  muted: '#66776D',
  faint: '#9AA8A0',
  line: '#E1E9E3',
  bg: '#F5F8F6',
  white: '#FFFFFF',
  amber: '#C27803',
  amberSoft: '#FFF4DC',
  blue: '#2563EB',
  blueSoft: '#E8EFFD',
  bkash: '#E2136E',
  nagad: '#EC5B24',
};

export const R = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const shadow = {
  shadowColor: '#0E3B22',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const T = {
  title: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  h2: { fontSize: 17, fontWeight: '700', color: C.ink },
  h3: { fontSize: 15, fontWeight: '700', color: C.ink },
  body: { fontSize: 14, color: C.text, lineHeight: 20 },
  small: { fontSize: 12.5, color: C.muted, lineHeight: 17 },
  tiny: { fontSize: 11, color: C.muted },
  money: { fontSize: 20, fontWeight: '800', color: C.ink },
};

export function money(n) {
  if (n === null || n === undefined || isNaN(n)) return '৳ —';
  return '৳ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

export function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
}

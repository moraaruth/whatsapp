import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...i) => twMerge(clsx(i));

export const STATUS_MAP = {
  NEW:        { label: 'New',        cls: 's-new',        dot: '#3b82f6' },
  CONTACTED:  { label: 'Contacted',  cls: 's-contacted',  dot: '#eab308' },
  INTERESTED: { label: 'Interested', cls: 's-interested', dot: '#f97316' },
  CLOSED:     { label: 'Closed',     cls: 's-closed',     dot: '#22c55e' },
  LOST:       { label: 'Lost',       cls: 's-lost',       dot: '#ef4444' },
};

export const getS = (s) => STATUS_MAP[s] || STATUS_MAP.NEW;

const AV_COLORS = [
  'from-blue-900/60 to-blue-800/40 text-blue-300 border-blue-700/30',
  'from-violet-900/60 to-violet-800/40 text-violet-300 border-violet-700/30',
  'from-emerald-900/60 to-emerald-800/40 text-emerald-300 border-emerald-700/30',
  'from-orange-900/60 to-orange-800/40 text-orange-300 border-orange-700/30',
  'from-rose-900/60 to-rose-800/40 text-rose-300 border-rose-700/30',
];
export const avColor = (n = '') => AV_COLORS[(n.charCodeAt(0) || 0) % AV_COLORS.length];
export const initials = (n = '') => n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?';

export const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
export const fmtKES  = (n) => `KES ${(n || 0).toLocaleString()}`;

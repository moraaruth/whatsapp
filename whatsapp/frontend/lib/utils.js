import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind class merger
 */
export const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * =========================
 * LEAD STATUS SYSTEM
 * =========================
 */

export const STATUS_MAP = {
  NEW: {
    label: 'New',
    cls: 's-new',
    dot: '#3b82f6',
  },
  CONTACTED: {
    label: 'Contacted',
    cls: 's-contacted',
    dot: '#eab308',
  },
  INTERESTED: {
    label: 'Interested',
    cls: 's-interested',
    dot: '#f97316',
  },
  CLOSED: {
    label: 'Closed',
    cls: 's-closed',
    dot: '#22c55e',
  },
  LOST: {
    label: 'Lost',
    cls: 's-lost',
    dot: '#ef4444',
  },
};

/**
 * SAFE STATUS GETTER (IMPORTANT)
 * Supports both getS and getStatus imports
 */
export const getS = (status) => {
  return STATUS_MAP[status] || STATUS_MAP.NEW;
};

// alias (prevents future import bugs)
export const getStatus = getS;

/**
 * =========================
 * TIME UTILITIES
 * =========================
 */

/**
 * IMPORTANT: supports both ago() and timeAgo()
 * (fixes your runtime crash immediately)
 */
export const ago = (date) => formatTimeAgo(date);
export const timeAgo = (date) => formatTimeAgo(date);

const formatTimeAgo = (date) => {
  if (!date) return '';

  const diff = Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return 'now';

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;

  const months = Math.floor(days / 30);
  return `${months}mo`;
};

/**
 * =========================
 * UI HELPERS
 * =========================
 */

const AV_COLORS = [
  'from-blue-900/60 to-blue-800/40 text-blue-300 border-blue-700/30',
  'from-violet-900/60 to-violet-800/40 text-violet-300 border-violet-700/30',
  'from-emerald-900/60 to-emerald-800/40 text-emerald-300 border-emerald-700/30',
  'from-orange-900/60 to-orange-800/40 text-orange-300 border-orange-700/30',
  'from-rose-900/60 to-rose-800/40 text-rose-300 border-rose-700/30',
];

export const avColor = (name = '') =>
  AV_COLORS[(name?.charCodeAt(0) || 0) % AV_COLORS.length];

/**
 * Get initials safely
 */
export const initials = (name = '') => {
  if (!name) return '?';

  return name
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * =========================
 * FORMATTING HELPERS
 * =========================
 */

export const fmtTime = (date) =>
  new Date(date).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const fmtDate = (date) =>
  new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  });

export const fmtKES = (amount) =>
  `KES ${(amount || 0).toLocaleString()}`;
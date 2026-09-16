/** chhote helpers - class names, dates, initials etc. */

export const cn = (...classes) => classes.filter(Boolean).join(' ');

/** "2 hours ago", "1 day ago", "Today" */
export const timeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
};

/** "Today" / "Yesterday" / date */
export const friendlyDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);

  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, yest)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fullDateTime = (date) => (date ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const truncate = (str = '', n = 80) => (str.length > n ? `${str.slice(0, n)}...` : str);

export const isEmail = (v = '') => /^\S+@\S+\.\S+$/.test(v);

/** word count from editor text */
export const countWords = (text = '') => text.split(/\s+/).filter(Boolean).length;

/** download helper (PDF / markdown / json export) */
export const downloadBlob = (content, filename, type = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const slugify = (s = '') =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'note';

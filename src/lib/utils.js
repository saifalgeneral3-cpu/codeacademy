// Small helpers used across the app.

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatCount(n) {
  if (n == null) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

export function levelColor(level) {
  switch (level) {
    case 'beginner': return 'green';
    case 'intermediate': return 'amber';
    case 'advanced': return 'red';
    default: return 'blue';
  }
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Validate a strong password: min 8 chars, at least one letter and one number.
export function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  return null;
}

export function validateEmail(email) {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

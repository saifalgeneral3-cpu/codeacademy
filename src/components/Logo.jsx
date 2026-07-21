import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="logo" aria-label="كود أكاديمي الصفحة الرئيسية">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="34" height="34" fill="none">
          <rect width="64" height="64" rx="14" fill="var(--primary)" />
          <path d="M24 22 L14 32 L24 42" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 22 L50 32 L40 42" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M35 18 L29 46" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="logo-text">
          كود <span className="logo-accent">أكاديمي</span>
        </span>
      )}
    </Link>
  );
}

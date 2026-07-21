import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SearchDialog from './SearchDialog.jsx';

const NAV_LINKS = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الدورات', to: '/courses' },
  { label: 'المميزات', to: '/#features' },
  { label: 'الآراء', to: '/#reviews' },
  { label: 'من نحن', to: '/about' },
  { label: 'تواصل معنا', to: '/contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { profile, session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const isAuthenticated = Boolean(session || profile);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />

          <nav className="nav-links" aria-label="الرئيسية">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.label} to={l.to} end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive && l.to !== '/' ? 'active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="بحث في الدورات">
              <SearchIcon />
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="تبديل الوضع الليلي">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {isAuthenticated ? (
              <div className="nav-user">
                <button className="icon-btn nav-avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="قائمة الحساب">
                  <Avatar profile={profile} />
                </button>
                {menuOpen && (
                  <div className="nav-menu glass animate-scale-in" role="menu">
                    <div className="nav-menu-head">
                      <Avatar profile={profile} />
                      <div>
                        <div className="nav-menu-name">{profile.full_name || profile.username}</div>
                        <div className="nav-menu-role">{profile.role === 'admin' ? 'مشرف' : 'طالب'}</div>
                      </div>
                    </div>
                    <Link to="/dashboard" className="nav-menu-item">لوحة الطالب</Link>
                    {profile.role === 'admin' && <Link to="/admin" className="nav-menu-item">لوحة المشرف</Link>}
                    <button className="nav-menu-item" onClick={handleSignOut}>تسجيل الخروج</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-ghost btn-sm">تسجيل الدخول</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">إنشاء حساب</Link>
              </div>
            )}

            <button className="icon-btn nav-burger" onClick={() => setOpen((v) => !v)} aria-label="القائمة" aria-expanded={open}>
              {open ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>

        {open && (
          <div className="nav-mobile glass animate-fade-up">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="nav-mobile-link">{l.label}</Link>
            ))}
            {!isAuthenticated && (
              <div className="nav-mobile-auth">
                <Link to="/login" className="btn btn-secondary btn-block">تسجيل الدخول</Link>
                <Link to="/signup" className="btn btn-primary btn-block">إنشاء حساب</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function Avatar({ profile }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" className="avatar" />;
  }
  const name = profile?.full_name || profile?.username || '?';
  const init = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return <span className="avatar avatar-fallback">{init}</span>;
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const BurgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

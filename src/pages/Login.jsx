import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateEmail } from '../lib/utils.js';

export default function Login() {
  const { signIn, signInWithGoogle, session, loading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!loading && session) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (validateEmail(email)) errs.email = validateEmail(email);
    if (!password) errs.password = 'كلمة المرور مطلوبة.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const { error: err } = await signIn({ email, password });
    setSubmitting(false);
    if (err) { error(err.message.includes('Invalid login') ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : err.message); return; }
    success('مرحبًا بعودتك!');
    navigate(from);
  };

  const google = async () => {
    const { error: err } = await signInWithGoogle();
    if (err) error(err.message);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card animate-scale-in">
        <h1 className="auth-title">مرحبًا بعودتك</h1>
        <p className="auth-sub">سجّل الدخول لمتابعة رحلة تعلمك.</p>

        <button className="google-btn mt-5" onClick={google}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          المتابعة بحساب Google
        </button>

        <div className="auth-divider">أو سجّل الدخول بالبريد الإلكتروني</div>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor="email">البريد الإلكتروني</label>
            <input id="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`}
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" dir="ltr" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label className="label" htmlFor="pw">كلمة المرور</label>
            <div className="relative">
              <input id="pw" type={showPw ? 'text' : 'password'} className={`input ${errors.password ? 'input-error' : ''}`}
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" dir="ltr"
                style={{ paddingRight: 48 }} />
              <button type="button" className="absolute" style={{ left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                onClick={() => setShowPw((v) => !v)} aria-label="إظهار كلمة المرور">
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="flex justify-between items-center mb-4" style={{ fontSize: '0.88rem' }}>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> تذكّرني
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 600 }}>نسيت كلمة المرور؟</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="auth-foot">ليس لديك حساب؟ <Link to="/signup">أنشئ حسابًا مجانيًا</Link></p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateEmail, validatePassword } from '../lib/utils.js';

export default function Signup() {
  const { signUp, signInWithGoogle, session, loading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username || form.username.length < 3) errs.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل.';
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const pwErr = validatePassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (form.confirm !== form.password) errs.confirm = 'كلمتا المرور غير متطابقتين.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const { data, error: err } = await signUp({
      email: form.email,
      password: form.password,
      username: form.username,
      fullName: form.username,
    });
    setSubmitting(false);
    if (err) { error(err.message); return; }
    if (data?.user) {
      success('تم إنشاء الحساب! تحقق من بريدك إن طُلب التأكيد ثم سجّل الدخول.');
      navigate('/login');
    } else {
      success('تحقق من بريدك لتأكيد حسابك.');
      navigate('/login');
    }
  };

  const google = async () => {
    const { error: err } = await signInWithGoogle();
    if (err) error(err.message);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card animate-scale-in">
        <h1 className="auth-title">أنشئ حسابك</h1>
        <p className="auth-sub">ابدأ تعلم البرمجة — مجاني 100%.</p>

        <button className="google-btn mt-5" onClick={google}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          التسجيل بحساب Google
        </button>

        <div className="auth-divider">أو أنشئ بالبريد الإلكتروني</div>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor="username">اسم المستخدم</label>
            <input id="username" className={`input ${errors.username ? 'input-error' : ''}`}
              value={form.username} onChange={set('username')} placeholder="yourname" autoComplete="username" dir="ltr" />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="field">
            <label className="label" htmlFor="email">البريد الإلكتروني</label>
            <input id="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`}
              value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" dir="ltr" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label className="label" htmlFor="pw">كلمة المرور</label>
            <div className="relative">
              <input id="pw" type={showPw ? 'text' : 'password'} className={`input ${errors.password ? 'input-error' : ''}`}
                value={form.password} onChange={set('password')} placeholder="8 أحرف على الأقل، حرف ورقم"
                autoComplete="new-password" dir="ltr" style={{ paddingRight: 48 }} />
              <button type="button" className="absolute" style={{ left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                onClick={() => setShowPw((v) => !v)} aria-label="إظهار كلمة المرور">
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div className="field">
            <label className="label" htmlFor="confirm">تأكيد كلمة المرور</label>
            <input id="confirm" type={showPw ? 'text' : 'password'} className={`input ${errors.confirm ? 'input-error' : ''}`}
              value={form.confirm} onChange={set('confirm')} placeholder="أعد إدخال كلمة المرور" autoComplete="new-password" dir="ltr" />
            {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="auth-foot">لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link></p>
      </div>
    </div>
  );
}

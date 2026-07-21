import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateEmail } from '../lib/utils.js';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const v = validateEmail(email);
    if (v) { setErr(v); return; }
    setErr('');
    setLoading(true);
    const { error: e2 } = await resetPassword(email);
    setLoading(false);
    if (e2) { error(e2.message); return; }
    setSent(true);
    success('تم إرسال رابط الاستعادة! تحقق من بريدك.');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card animate-scale-in">
        <h1 className="auth-title">نسيت كلمة المرور؟</h1>
        <p className="auth-sub">أدخل بريدك وسنرسل لك رابط استعادة.</p>

        {sent ? (
          <div className="card mt-5" style={{ padding: 'var(--space-5)', background: 'var(--success-soft)', borderColor: 'var(--success)' }}>
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>✓ تم إرسال رابط الاستعادة إلى {email}.</p>
            <p className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>تحقق من بريدك (ومجلد الرسائل غير المرغوبة) للرابط لإعادة تعيين كلمة المرور.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5">
            <div className="field">
              <label className="label" htmlFor="email">البريد الإلكتروني</label>
              <input id="email" type="email" className={`input ${err ? 'input-error' : ''}`}
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" dir="ltr" />
              {err && <div className="field-error">{err}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'إرسال رابط الاستعادة'}
            </button>
          </form>
        )}

        <p className="auth-foot"><Link to="/login">→ العودة لتسجيل الدخول</Link></p>
      </div>
    </div>
  );
}

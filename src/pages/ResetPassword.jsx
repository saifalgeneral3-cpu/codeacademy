import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validatePassword } from '../lib/utils.js';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { supabase } = await import('../lib/supabase.js');
      const { data } = await supabase.auth.getSession();
      if (active) setReady(!!data.session);
    };
    check();
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    const pwErr = validatePassword(pw);
    if (pwErr) next.pw = pwErr;
    if (confirm !== pw) next.confirm = 'كلمتا المرور غير متطابقتين.';
    setErrs(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error: err } = await updatePassword(pw);
    setLoading(false);
    if (err) { error(err.message); return; }
    success('تم تحديث كلمة المرور! يمكنك الآن تسجيل الدخول.');
    navigate('/login');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card animate-scale-in">
        <h1 className="auth-title">تعيين كلمة مرور جديدة</h1>
        <p className="auth-sub">اختر كلمة مرور قوية لحسابك.</p>

        {!ready ? (
          <div className="card mt-5" style={{ padding: 'var(--space-5)' }}>
            <p className="text-muted">جارٍ التحقق من رابط الاستعادة… إن لم يحدث شيء فقد انتهت صلاحية الرابط. <Link to="/forgot-password" style={{ color: 'var(--primary)' }}>اطلب واحدًا جديدًا</Link>.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5">
            <div className="field">
              <label className="label" htmlFor="pw">كلمة المرور الجديدة</label>
              <input id="pw" type="password" className={`input ${errs.pw ? 'input-error' : ''}`}
                value={pw} onChange={(e) => setPw(e.target.value)} placeholder="8 أحرف على الأقل" autoComplete="new-password" dir="ltr" />
              {errs.pw && <div className="field-error">{errs.pw}</div>}
            </div>
            <div className="field">
              <label className="label" htmlFor="cf">تأكيد كلمة المرور</label>
              <input id="cf" type="password" className={`input ${errs.confirm ? 'input-error' : ''}`}
                value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="أعد إدخال كلمة المرور" autoComplete="new-password" dir="ltr" />
              {errs.confirm && <div className="field-error">{errs.confirm}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'تحديث كلمة المرور'}
            </button>
          </form>
        )}

        <p className="auth-foot"><Link to="/login">→ العودة لتسجيل الدخول</Link></p>
      </div>
    </div>
  );
}

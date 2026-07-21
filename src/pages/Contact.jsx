import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function Contact() {
  const { success, error } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { error('يرجى ملء جميع الحقول.'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      success('شكرًا! تم استلام رسالتك. سنرد قريبًا.');
      setForm({ name: '', email: '', message: '' });
    }, 800);
  };

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1 className="page-title">تواصل معنا</h1>
          <p className="page-sub">أسئلة أو ملاحظات أو أفكار شراكة؟ يسعدنا سماعك.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container contact-grid">
          <div className="contact-info-card">
            <h2 className="mb-5">معلومات التواصل</h2>
            <div className="contact-item">
              <div className="contact-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>البريد الإلكتروني</div>
                <div className="text-muted" dir="ltr">saifalgeneral3@gmail.com</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>المؤسس</div>
                <div className="text-muted">سيف عمرو متولي</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>المهمة</div>
                <div className="text-muted">تعليم برمجة مجاني للجميع.</div>
              </div>
            </div>
          </div>

          <div className="contact-info-card">
            <h2 className="mb-5">أرسل رسالة</h2>
            <form onSubmit={submit}>
              <div className="field">
                <label className="label">الاسم</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك" />
              </div>
              <div className="field">
                <label className="label">البريد الإلكتروني</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" dir="ltr" />
              </div>
              <div className="field">
                <label className="label">الرسالة</label>
                <textarea className="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا المساعدة؟" />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={sending}>
                {sending ? <span className="spinner" /> : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

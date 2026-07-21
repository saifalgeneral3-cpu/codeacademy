import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function About() {
  const { session } = useAuth();

  return (
    <>
      <section className="section">
        <div className="container about-grid">
          <div className="animate-fade-up">
            <span className="hero-eyebrow">مهمتنا</span>
            <h1 className="mt-4">تعليم البرمجة بأبسط طريقة ممكنة.</h1>
            <p className="mt-4" style={{ fontSize: '1.1rem' }}>
              تأسست كود أكاديمي على يد <strong>سيف عمر</strong> بإيمان واحد: يجب أن تكون البرمجة
              متاحة للجميع. عبر دورات مجانية منظمة وعالية الجودة، نساعد المبتدئين والمحترفين
              على بناء مهارات حقيقية — لا جدارات دفع ولا قيود.
            </p>
            <p className="mt-4">
              كل دورة منظمة خطوة بخطوة، مع مشاريع عملية وموارد قابلة للتحميل وتتبع التقدم
              لتعرف دائمًا أين أنت وإلى أين تتجه.
            </p>
            <div className="flex gap-3 mt-5 wrap">
              <Link to="/courses" className="btn btn-primary btn-lg">تصفّح الدورات</Link>
              {!session && <Link to="/signup" className="btn btn-secondary btn-lg">انضم مجانًا</Link>}
            </div>
          </div>
          <div className="animate-fade-up">
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div className="dash-stat-grid">
                <div className="stat-card"><div className="stat-num">+16</div><div className="stat-label">تصنيف</div></div>
                <div className="stat-card"><div className="stat-num">100%</div><div className="stat-label">مجاني</div></div>
                <div className="stat-card"><div className="stat-num">∞</div><div className="stat-label">وصول مدى الحياة</div></div>
                <div className="stat-card"><div className="stat-num">2026</div><div className="stat-label">تأسست</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">قيمنا</h2>
            <p className="section-subtitle">المبادئ وراء كل ما نبنيه.</p>
          </div>
          <div className="features-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="feature-card">
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: v.icon }} />
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const VALUES = [
  { title: 'مجاني دائمًا', desc: 'المعرفة لا ينبغي أن تكون خلف جدار دفع. كل دورة وكل درس مجاني للأبد.', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8 8 14.31"/></svg>' },
  { title: 'الوضوح أولًا', desc: 'نشرح المفاهيم بلغة بسيطة. لا مصطلحات معقدة لمجرد التعقيد.', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' },
  { title: 'تعلّم بالممارسة', desc: 'كل دورة تتضمن مشاريع حقيقية. تتعلم بالبناء لا بالمشاهدة فقط.', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 11 2-2-2-2"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>' },
];

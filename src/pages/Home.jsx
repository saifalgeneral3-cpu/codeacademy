import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import CourseCard from '../components/CourseCard.jsx';
import { SkeletonGrid } from '../components/Skeletons.jsx';
import ReviewsSlider from '../components/ReviewsSlider.jsx';
import { FEATURES } from '../data/content.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, instructor, thumbnail_url, category_name, level')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!active) return;
      setCourses(data || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <>
      <Hero session={session} />
      <Features />
      <section className="section" id="courses">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">دورات شهيرة</h2>
            <p className="section-subtitle">دورات مختارة للمبتدئين — مجانية بالكامل وإلى الأبد.</p>
          </div>
          {loading ? <SkeletonGrid count={6} /> : (
            <div className="courses-grid">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
          <div className="text-center mt-6">
            <Link to="/courses" className="btn btn-secondary btn-lg">تصفّح كل الدورات ←</Link>
          </div>
        </div>
      </section>
      <ReviewsSlider />
      <CTA session={session} />
    </>
  );
}

function Hero({ session }) {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-content animate-fade-up">
          <span className="hero-eyebrow">⭐ مجاني 100% · تعلّم بسرعتك</span>
          <h1 className="hero-title">
            تعلم البرمجة <br />
            بالطريقة <span className="hero-title-accent">الذكية</span>
          </h1>
          <p className="hero-sub">
            البرمجة تصبح سهلة عبر دروس عملية خطوة بخطوة. ابنِ مشاريع حقيقية وتتبع تقدمك
            وانتقل من المبتدئ إلى جاهز للعمل — كل ذلك مجانًا.
          </p>
          {!session && (
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">ابدأ التعلم</Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">تصفّح الدورات</Link>
            </div>
          )}
          <div className="hero-stats">
            <div><div className="hero-stat-num">+16</div><div className="hero-stat-label">تصنيف</div></div>
            <div><div className="hero-stat-num">100%</div><div className="hero-stat-label">مجاني للأبد</div></div>
            <div><div className="hero-stat-num">∞</div><div className="hero-stat-label">وصول مدى الحياة</div></div>
          </div>
        </div>

        <div className="hero-illustration animate-fade-up">
          <div className="hero-code-card">
            <div className="hero-code-head">
              <span className="hero-code-dot r" />
              <span className="hero-code-dot y" />
              <span className="hero-code-dot g" />
              <span className="hero-code-title">hello.js</span>
            </div>
            <div className="hero-code-body">
              <div className="hero-code-line"><span className="hero-code-ln">1</span><span className="hero-code-content"><span className="code-com">// أول برنامج لك</span></span></div>
              <div className="hero-code-line"><span className="hero-code-ln">2</span><span className="hero-code-content"><span className="code-kw">function</span> <span className="code-fn">greet</span>(<span className="code-var">name</span>) {'{'}</span></div>
              <div className="hero-code-line"><span className="hero-code-ln">3</span><span className="hero-code-content">  <span className="code-kw">return</span> <span className="code-str">`مرحبًا، ${'${name}'}!`</span>;</span></div>
              <div className="hero-code-line"><span className="hero-code-ln">4</span><span className="hero-code-content">{'}'}</span></div>
              <div className="hero-code-line"><span className="hero-code-ln">5</span><span className="hero-code-content">&nbsp;</span></div>
              <div className="hero-code-line"><span className="hero-code-ln">6</span><span className="hero-code-content"><span className="code-fn">console</span>.<span className="code-fn">log</span>(<span className="code-fn">greet</span>(<span className="code-str">'عالم'</span>));</span></div>
            </div>
          </div>
          <div className="hero-float hero-float-1">
            <div className="hero-float-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>✓</div>
            <div>اكتمل الدرس</div>
          </div>
          <div className="hero-float hero-float-2">
            <div className="hero-float-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>▶</div>
            <div>التالي: الدوال</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section section-soft" id="features">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">لماذا كود أكاديمي؟</h2>
          <p className="section-subtitle">كل ما تحتاجه لتعلم البرمجة بفعالية في مكان واحد.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card animate-fade-up">
              <div className="feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ session }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta animate-fade-up">
          <h2>مستعد لبدء رحلة البرمجة؟</h2>
          <p>انضم لآلاف المتعلمين الذين يبنون مستقبلهم مع كود أكاديمي. لا بطاقة ائتمان. لا فخ. تعلم فقط.</p>
          {!session && (
            <div className="flex justify-center gap-3 mt-5 wrap">
              <Link to="/signup" className="btn btn-primary btn-lg">أنشئ حسابًا مجانيًا</Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">استكشف الدورات</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

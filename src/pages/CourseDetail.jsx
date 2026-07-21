import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonLine } from '../components/Skeletons.jsx';

const LEVEL_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function CourseDetail() {
  const { slug } = useParams();
  const { session } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCourse(null);
    (async () => {
      const { data: crs } = await supabase
        .from('courses').select('*').eq('slug', slug).maybeSingle();
      if (!active) return;
      if (!crs) { setLoading(false); return; }
      setCourse(crs);

      const { data: lsns } = await supabase
        .from('lessons').select('id, title, description, position, duration_min')
        .eq('course_id', crs.id).order('position', { ascending: true });
      if (active) setLessons(lsns || []);

      const { data: revs } = await supabase
        .from('reviews').select('id, rating, body, created_at, user_id')
        .eq('course_id', crs.id).order('created_at', { ascending: false });
      if (active) setReviews(revs || []);

      if (session?.user?.id) {
        const { data: prog } = await supabase
          .from('lesson_progress').select('lesson_id, completed')
          .eq('user_id', session.user.id).in('lesson_id', (lsns || []).map((l) => l.id));
        if (active && prog) setCompletedIds(new Set(prog.filter((p) => p.completed).map((p) => p.lesson_id)));

        const { data: fav } = await supabase
          .from('favorites').select('id').eq('user_id', session.user.id).eq('course_id', crs.id).maybeSingle();
        if (active) setIsFavorite(!!fav);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug, session?.user?.id]);

  const total = lessons.length;
  const done = completedIds.size;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggleFavorite = async () => {
    if (!session) { navigate('/login', { state: { from: `/courses/${slug}` } }); return; }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('course_id', course.id);
      setIsFavorite(false);
      success('أُزيل من المفضلة');
    } else {
      const { error: e } = await supabase.from('favorites').insert({ user_id: session.user.id, course_id: course.id });
      if (e) error(e.message); else { setIsFavorite(true); success('أُضيف إلى المفضلة'); }
    }
  };

  if (loading) {
    return (
      <section className="section"><div className="container">
        <SkeletonLine w="60%" h={36} />
        <div className="mt-5"><SkeletonLine h={300} /></div>
      </div></section>
    );
  }

  if (!course) {
    return (
      <section className="section"><div className="container empty-state">
        <h3>الدورة غير موجودة</h3>
        <Link to="/courses" className="btn btn-primary mt-4">العودة إلى الدورات</Link>
      </div></section>
    );
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="flex gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/courses">الدورات</Link> <span>/</span> <span>{course.category_name}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container course-hero">
          <div>
            <div className="flex gap-3 wrap mb-4">
              <span className="badge badge-free">مجاني</span>
              {course.level && <span className={`badge badge-${course.level}`}>{LEVEL_LABELS[course.level]}</span>}
              <span className="badge badge-blue">{course.category_name}</span>
            </div>
            <h1>{course.title}</h1>
            <p className="mt-4" style={{ fontSize: '1.1rem' }}>{course.description}</p>

            <div className="flex items-center gap-4 mt-5 wrap">
              <div className="course-instructor">
                <span className="course-instructor-dot">{course.instructor?.[0]}</span>
                <span>بقلم <strong>{course.instructor}</strong></span>
              </div>
              <span className="text-muted">·</span>
              <span className="text-muted">{total} درس</span>
            </div>

            <div className="flex gap-3 mt-5 wrap">
              {lessons[0] && (
                <Link to={`/courses/${slug}/lessons/${lessons[0].id}`} className="btn btn-primary btn-lg">
                  {pct > 0 ? 'متابعة التعلم' : 'ابدأ الدورة'} ←
                </Link>
              )}
              <button className={`btn btn-secondary btn-lg`} onClick={toggleFavorite}>
                {isFavorite ? '★ في المفضلة' : '☆ أضف للمفضلة'}
              </button>
            </div>
          </div>

          <div className="course-info-card">
            <div className="text-center mb-5">
              <div className="progress-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle className="progress-ring-track" cx="60" cy="60" r="52" fill="none" strokeWidth="10" />
                  <circle className="progress-ring-fill" cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)} />
                </svg>
                <div className="progress-ring-label">{pct}%</div>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>{done} من {total} درس مكتمل</p>
            </div>
            <div className="course-info-row"><span>التصنيف</span><span>{course.category_name}</span></div>
            <div className="course-info-row"><span>المستوى</span><span>{LEVEL_LABELS[course.level]}</span></div>
            <div className="course-info-row"><span>الدروس</span><span>{total}</span></div>
            <div className="course-info-row"><span>السعر</span><span style={{ color: 'var(--success)' }}>مجاني</span></div>
          </div>
        </div>
      </section>

      <section className="section section-soft" style={{ paddingTop: 'var(--space-7)' }}>
        <div className="container">
          <h2 className="mb-5">محتوى الدورة</h2>
          {total === 0 ? (
            <div className="empty-state"><p>الدروس قادمة قريبًا.</p></div>
          ) : (
            <div className="lesson-list">
              {lessons.map((l, i) => {
                const done = completedIds.has(l.id);
                return (
                  <Link key={l.id} to={`/courses/${slug}/lessons/${l.id}`} className={`lesson-item ${done ? 'completed' : ''}`}>
                    <span className="lesson-check">{done ? '✓' : ''}</span>
                    <span className="lesson-num">{i + 1}</span>
                    <span className="lesson-item-title">{l.title}</span>
                    <span className="lesson-dur">{l.duration_min} د</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
          <div className="container">
            <h2 className="mb-5">آراء الطلاب</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {reviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: 'var(--space-5)' }}>
                  <div className="review-stars">
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text)' }}>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

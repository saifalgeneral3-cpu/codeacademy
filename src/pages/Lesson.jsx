import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonLine } from '../components/Skeletons.jsx';

export default function Lesson() {
  const { slug, lessonId } = useParams();
  const { session } = useAuth();
  const { success, error } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data: crs } = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle();
      if (!active || !crs) { setLoading(false); return; }
      setCourse(crs);

      const { data: lsns } = await supabase
        .from('lessons').select('*').eq('course_id', crs.id).order('position', { ascending: true });
      if (!active) return;
      setLessons(lsns || []);
      const current = (lsns || []).find((l) => l.id === lessonId);
      setLesson(current || null);

      if (current) {
        const { data: res } = await supabase.from('resources').select('*').eq('lesson_id', current.id);
        if (active) setResources(res || []);
      }

      if (session?.user?.id && current) {
        const { data: prog } = await supabase
          .from('lesson_progress').select('completed').eq('user_id', session.user.id).eq('lesson_id', current.id).maybeSingle();
        if (active) setCompleted(!!prog?.completed);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug, lessonId, session?.user?.id]);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const toggleComplete = async () => {
    if (!session?.user?.id || !lesson) return;
    const nextVal = !completed;
    setCompleted(nextVal);
    const { error: e } = await supabase.from('lesson_progress').upsert({
      user_id: session.user.id,
      lesson_id: lesson.id,
      completed: nextVal,
      completed_at: nextVal ? new Date().toISOString() : null,
    }, { onConflict: 'user_id,lesson_id' });
    if (e) { error(e.message); setCompleted(!nextVal); }
    else { success(nextVal ? 'تم تعليم الدرس كمكتمل!' : 'تم التعليم كغير مكتمل'); }
  };

  if (loading) {
    return (
      <section className="section"><div className="container">
        <SkeletonLine w="50%" h={32} />
        <div className="mt-5"><SkeletonLine h={360} /></div>
      </div></section>
    );
  }

  if (!course || !lesson) {
    return (
      <section className="section"><div className="container empty-state">
        <h3>الدرس غير موجود</h3>
        <Link to={`/courses/${slug}`} className="btn btn-primary mt-4">العودة إلى الدورة</Link>
      </div></section>
    );
  }

  return (
    <>
      <section className="page-head" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="flex gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/courses">الدورات</Link> <span>/</span>
            <Link to={`/courses/${slug}`}>{course.title}</Link> <span>/</span>
            <span>الدرس {currentIndex + 1}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="container lesson-layout">
          <div>
            <h1 className="mb-4">{lesson.title}</h1>

            <div className="lesson-video-wrap">
              {lesson.video_url ? (
                <video key={lesson.video_url} controls preload="metadata" poster={course.cover_url}>
                  <source src={lesson.video_url} />
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <div className="lesson-video-empty">
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>▶</div>
                    <div>الفيديو لهذا الدرس قادم قريبًا.</div>
                  </div>
                </div>
              )}
            </div>

            {lesson.description && (
              <p className="mt-5" style={{ fontSize: '1.05rem' }}>{lesson.description}</p>
            )}

            {lesson.notes && (
              <div className="card mt-5" style={{ padding: 'var(--space-5)' }}>
                <h3 className="mb-3">ملاحظات</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font)', color: 'var(--text-soft)' }}>{lesson.notes}</pre>
              </div>
            )}

            {lesson.source_code_url && (
              <a href={lesson.source_code_url} target="_blank" rel="noreferrer" className="resource-item mt-5">
                <div className="resource-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>الكود المصدري</div>
                  <div className="text-muted" style={{ fontSize: '0.82rem' }}>حمّل ملفات الكود المصدري للدرس</div>
                </div>
              </a>
            )}

            {resources.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3">الموارد</h3>
                <div className="flex flex-col gap-3">
                  {resources.map((r) => (
                    <a key={r.id} href={r.file_url} target="_blank" rel="noreferrer" className="resource-item">
                      <div className="resource-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.82rem' }}>{r.file_type || 'ملف'}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="lesson-nav">
              {prev ? (
                <Link to={`/courses/${slug}/lessons/${prev.id}`} className="btn btn-secondary">
                  → السابق
                </Link>
              ) : <span />}
              <button className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleComplete}>
                {completed ? '✓ مكتمل' : 'علّم كمكتمل'}
              </button>
              {next ? (
                <Link to={`/courses/${slug}/lessons/${next.id}`} className="btn btn-primary">
                  التالي ←
                </Link>
              ) : (
                <Link to={`/courses/${slug}`} className="btn btn-secondary">إنهاء الدورة</Link>
              )}
            </div>
          </div>

          <aside className="lesson-sidebar">
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h3 className="mb-4" style={{ fontSize: '1.05rem' }}>دروس الدورة</h3>
              <div className="lesson-list">
                {lessons.map((l, i) => {
                  const isCurrent = l.id === lesson.id;
                  return (
                    <Link key={l.id} to={`/courses/${slug}/lessons/${l.id}`}
                      className={`lesson-item ${isCurrent ? 'active' : ''}`}>
                      <span className="lesson-num">{i + 1}</span>
                      <span className="lesson-item-title" style={{ fontSize: '0.9rem' }}>{l.title}</span>
                      <span className="lesson-dur">{l.duration_min}د</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

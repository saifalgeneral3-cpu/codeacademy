import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { SkeletonGrid } from '../components/Skeletons.jsx';

const TABS = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'learning', label: 'متابعة التعلم' },
  { id: 'completed', label: 'المكتمل' },
  { id: 'favorites', label: 'المفضلة' },
  { id: 'profile', label: 'تعديل الملف' },
];

export default function Dashboard() {
  const { session, profile, refreshProfile } = useAuth();
  const { success, error } = useToast();
  const [tab, setTab] = useState('overview');
  const [inProgress, setInProgress] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ courses: 0, completed: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', full_name: '', bio: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = session.user.id;
      const { data: prog } = await supabase
        .from('lesson_progress').select('lesson_id, completed, lesson:lessons(id, title, course:courses(*))')
        .eq('user_id', uid);

      const completed = (prog || []).filter((p) => p.completed);
      const courseMap = new Map();
      for (const p of prog || []) {
        if (!p.lesson?.course) continue;
        const c = p.lesson.course;
        if (!courseMap.has(c.id)) courseMap.set(c.id, { course: c, total: 0, done: 0 });
        const entry = courseMap.get(c.id);
        entry.total += 1;
        if (p.completed) entry.done += 1;
      }
      const inProg = [...courseMap.values()]
        .map((e) => ({ ...e.course, progress: e.total ? (e.done / e.total) * 100 : 0 }))
        .filter((c) => c.progress > 0 && c.progress < 100);

      const { data: favs } = await supabase
        .from('favorites').select('course:courses(*)').eq('user_id', uid);
      const favCourses = (favs || []).map((f) => f.course).filter(Boolean);

      if (active) {
        setInProgress(inProg);
        setFavorites(favCourses);
        setStats({ courses: courseMap.size, completed: completed.length, favorites: favCourses.length });
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (profile) setForm({ username: profile.username || '', full_name: profile.full_name || '', bio: profile.bio || '' });
  }, [profile]);

  const saveProfile = async () => {
    const { error: e } = await supabase.from('profiles').update({
      username: form.username, full_name: form.full_name, bio: form.bio,
    }).eq('id', session.user.id);
    if (e) { error(e.message); return; }
    await refreshProfile();
    setEditing(false);
    success('تم تحديث الملف');
  };

  return (
    <section className="section">
      <div className="container">
        <div className="page-head" style={{ paddingTop: 0 }}>
          <h1 className="page-title">مرحبًا، {profile?.username || 'متعلم'} 👋</h1>
          <p className="page-sub">تتبع تقدمك وواصل التعلم.</p>
        </div>

        <div className="dash-layout">
          <aside className="dash-side">
            <div className="dash-side-links">
              {TABS.map((t) => (
                <button key={t.id} className={`dash-side-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="dash-main">
            {tab === 'overview' && (
              <>
                <div className="dash-stat-grid mb-6">
                  <StatCard icon="📚" label="دورات بدأت" value={stats.courses} />
                  <StatCard icon="✓" label="دروس مكتملة" value={stats.completed} />
                  <StatCard icon="★" label="دورات مفضلة" value={stats.favorites} />
                </div>
                <h2 className="mb-4">متابعة التعلم</h2>
                {loading ? <SkeletonGrid count={3} /> : (
                  inProgress.length === 0 ? (
                    <div className="empty-state">
                      <h3>لا دورات قيد التقدم</h3>
                      <p>تصفّح الكتالوج وابدأ أول دورة لك.</p>
                      <Link to="/courses" className="btn btn-primary mt-4">تصفّح الدورات</Link>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {inProgress.map((c) => <CourseCard key={c.id} course={c} progress={c.progress} />)}
                    </div>
                  )
                )}
              </>
            )}

            {tab === 'learning' && (
              <>
                <h2 className="mb-4">قيد التقدم</h2>
                {inProgress.length === 0 ? (
                  <div className="empty-state"><p>لا دورات نشطة. ابدأ واحدة اليوم!</p>
                    <Link to="/courses" className="btn btn-primary mt-4">تصفّح الدورات</Link>
                  </div>
                ) : (
                  <div className="courses-grid">
                    {inProgress.map((c) => <CourseCard key={c.id} course={c} progress={c.progress} />)}
                  </div>
                )}
              </>
            )}

            {tab === 'completed' && (
              <>
                <h2 className="mb-4">الدروس المكتملة</h2>
                <p className="text-muted mb-5">{stats.completed} درس مكتمل عبر {stats.courses} دورة.</p>
                {inProgress.length === 0 && stats.completed === 0 ? (
                  <div className="empty-state"><p>أكمل دروسًا لرؤيتها هنا.</p></div>
                ) : (
                  <div className="courses-grid">
                    {inProgress.map((c) => <CourseCard key={c.id} course={c} progress={c.progress} />)}
                  </div>
                )}
              </>
            )}

            {tab === 'favorites' && (
              <>
                <h2 className="mb-4">الدورات المفضلة</h2>
                {favorites.length === 0 ? (
                  <div className="empty-state"><p>لا مفضلات بعد. اضغط النجمة على دورة لحفظها.</p>
                    <Link to="/courses" className="btn btn-primary mt-4">تصفّح الدورات</Link>
                  </div>
                ) : (
                  <div className="courses-grid">
                    {favorites.map((c) => <CourseCard key={c.id} course={c} />)}
                  </div>
                )}
              </>
            )}

            {tab === 'profile' && (
              <>
                <h2 className="mb-4">تعديل الملف</h2>
                <div className="card" style={{ padding: 'var(--space-6)', maxWidth: 560 }}>
                  <div className="flex items-center gap-4 mb-5">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="avatar" style={{ width: 64, height: 64 }} alt="" /> :
                      <span className="avatar avatar-fallback" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>{(profile?.full_name || profile?.username || '?')[0]}</span>}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{profile?.full_name || profile?.username}</div>
                      <div className="text-muted" style={{ textTransform: 'capitalize' }}>{profile?.role === 'admin' ? 'مشرف' : 'طالب'}</div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">اسم المستخدم</label>
                    <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!editing} dir="ltr" />
                  </div>
                  <div className="field">
                    <label className="label">الاسم الكامل</label>
                    <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} disabled={!editing} />
                  </div>
                  <div className="field">
                    <label className="label">نبذة</label>
                    <textarea className="textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} disabled={!editing} placeholder="أخبرنا عنك" />
                  </div>
                  <div className="flex gap-3">
                    {!editing ? (
                      <button className="btn btn-primary" onClick={() => setEditing(true)}>تعديل الملف</button>
                    ) : (
                      <>
                        <button className="btn btn-primary" onClick={saveProfile}>حفظ التغييرات</button>
                        <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ username: profile.username, full_name: profile.full_name, bio: profile.bio }); }}>إلغاء</button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-num">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

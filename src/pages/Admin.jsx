import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import AdminCourses from '../components/admin/AdminCourses.jsx';
import AdminLessons from '../components/admin/AdminLessons.jsx';
import AdminCategories from '../components/admin/AdminCategories.jsx';
import AdminStudents from '../components/admin/AdminStudents.jsx';
import AdminStats from '../components/admin/AdminStats.jsx';

const TABS = [
  { id: 'stats', label: 'الإحصائيات', icon: '📊' },
  { id: 'courses', label: 'الدورات', icon: '📚' },
  { id: 'lessons', label: 'الدروس', icon: '🎬' },
  { id: 'categories', label: 'التصنيفات', icon: '🏷️' },
  { id: 'students', label: 'الطلاب', icon: '👥' },
];

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
  };
  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.all([loadCourses(), loadCategories()]);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="page-head" style={{ paddingTop: 0 }}>
          <h1 className="page-title">لوحة المشرف</h1>
          <p className="page-sub">إدارة الدورات والدروس والتصنيفات والطلاب.</p>
        </div>

        <div className="dash-layout">
          <aside className="dash-side">
            <div className="dash-side-links">
              {TABS.map((t) => (
                <button key={t.id} className={`dash-side-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  <span aria-hidden="true">{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="dash-main">
            {loading ? (
              <div className="page-loader"><div className="spinner spinner-lg" /></div>
            ) : (
              <>
                {tab === 'stats' && <AdminStats courses={courses} />}
                {tab === 'courses' && (
                  <AdminCourses courses={courses} categories={categories} reload={loadCourses} />
                )}
                {tab === 'lessons' && (
                  <AdminLessons courses={courses} reload={loadCourses} />
                )}
                {tab === 'categories' && (
                  <AdminCategories categories={categories} reload={loadCategories} />
                )}
                {tab === 'students' && <AdminStudents />}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

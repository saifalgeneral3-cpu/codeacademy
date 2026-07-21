import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import CourseCard from '../components/CourseCard.jsx';
import { SkeletonGrid } from '../components/Skeletons.jsx';

const LEVEL_LABELS = { all: 'كل المستويات', beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: cats }, { data: crs }] = await Promise.all([
        supabase.from('categories').select('id, name, slug').order('name'),
        supabase.from('courses').select('id, title, slug, description, instructor, thumbnail_url, category_name, level').order('title'),
      ]);
      if (!active) return;
      setCategories(cats || []);
      setCourses(crs || []);

      const { data: counts } = await supabase
        .from('lessons')
        .select('course_id')
        .order('course_id');
      if (active && counts) {
        const map = {};
        for (const row of counts) map[row.course_id] = (map[row.course_id] || 0) + 1;
        setLessonCounts(map);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (cat !== 'all' && c.category_name !== cat) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (!term) return true;
      return (
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.instructor.toLowerCase().includes(term) ||
        (c.category_name || '').toLowerCase().includes(term)
      );
    });
  }, [courses, query, cat, level]);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1 className="page-title">كل الدورات</h1>
          <p className="page-sub">تصفّح كتالوجنا الكامل. كل دورة مجانية — ابدأ من حيث شئت.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="filter-bar mb-5">
            <div className="search-inline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                className="input"
                placeholder="ابحث في الدورات والمدرّسين..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="select" style={{ maxWidth: 200 }} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">كل التصنيفات</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select className="select" style={{ maxWidth: 180 }} value={level} onChange={(e) => setLevel(e.target.value)}>
              {Object.entries(LEVEL_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>

          {loading ? <SkeletonGrid count={6} /> : (
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3>لا دورات موجودة</h3>
                <p>جرّب بحثًا أو فلترًا مختلفًا.</p>
              </div>
            ) : (
              <div className="courses-grid">
                {filtered.map((c) => (
                  <CourseCard key={c.id} course={c} lessonCount={lessonCounts[c.id] ?? 0} />
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}

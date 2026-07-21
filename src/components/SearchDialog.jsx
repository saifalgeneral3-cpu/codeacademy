import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function SearchDialog({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setQ(''); setResults([]); return; }
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const term = q.trim();
    if (term.length < 2) { setResults([]); return; }
    setLoading(true);
    (async () => {
      const like = `%${term}%`;
      const [{ data: courses }, { data: lessons }] = await Promise.all([
        supabase.from('courses').select('id, title, slug, instructor, category_name, level')
          .or(`title.ilike.${like},instructor.ilike.${like},category_name.ilike.${like}`).limit(8),
        supabase.from('lessons').select('id, title, course:courses(slug, title)').ilike('title', like).limit(6),
      ]);
      if (!active) return;
      const courseHits = (courses || []).map((c) => ({ type: 'course', ...c }));
      const lessonHits = (lessons || []).map((l) => ({ type: 'lesson', id: l.id, title: l.title, courseSlug: l.course?.slug, courseTitle: l.course?.title }));
      setResults([...courseHits, ...lessonHits]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [q, open]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="search-dialog glass animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <SearchIcon />
          <input
            autoFocus
            className="search-input"
            placeholder="ابحث في الدورات والدروس والمدرّسين..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd className="kbd">ESC</kbd>
        </div>

        <div className="search-results">
          {loading && <div className="search-state"><div className="spinner" /> جارٍ البحث...</div>}
          {!loading && q.trim().length >= 2 && results.length === 0 && (
            <div className="search-state">لا نتائج لـ “{q}”.</div>
          )}
          {!loading && q.trim().length < 2 && (
            <div className="search-state">ابدأ الكتابة للبحث في الدورات والدروس والمدرّسين.</div>
          )}
          {results.map((r) => (
            r.type === 'course' ? (
              <Link key={`c-${r.id}`} to={`/courses/${r.slug}`} className="search-result" onClick={onClose}>
                <div className="search-result-icon course">د</div>
                <div className="search-result-body">
                  <div className="search-result-title">{r.title}</div>
                  <div className="search-result-meta">{r.instructor} · {r.category_name} · {r.level === 'beginner' ? 'مبتدئ' : r.level === 'intermediate' ? 'متوسط' : 'متقدم'}</div>
                </div>
              </Link>
            ) : (
              <Link key={`l-${r.id}`} to={`/courses/${r.courseSlug}`} className="search-result" onClick={onClose}>
                <div className="search-result-icon lesson">در</div>
                <div className="search-result-body">
                  <div className="search-result-title">{r.title}</div>
                  <div className="search-result-meta">درس في {r.courseTitle}</div>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);

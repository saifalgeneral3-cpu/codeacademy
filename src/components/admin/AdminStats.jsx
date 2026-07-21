import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

export default function AdminStats({ courses }) {
  const [stats, setStats] = useState({ courses: 0, lessons: 0, students: 0, videos: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ count: lessons }, { count: students }, { count: videos }, { count: downloads }] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }).not('video_url', 'is', null),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
      ]);
      if (!active) return;
      setStats({
        courses: courses.length,
        lessons: lessons || 0,
        students: students || 0,
        videos: videos || 0,
        downloads: downloads || 0,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [courses]);

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  const cards = [
    { icon: '📚', label: 'إجمالي الدورات', value: stats.courses, color: 'var(--primary)' },
    { icon: '🎬', label: 'إجمالي الدروس', value: stats.lessons, color: 'var(--success)' },
    { icon: '👥', label: 'إجمالي الطلاب', value: stats.students, color: '#8b5cf6' },
    { icon: '🎥', label: 'إجمالي الفيديوهات', value: stats.videos, color: '#ec4899' },
    { icon: '⬇️', label: 'إجمالي التنزيلات', value: stats.downloads, color: '#f59e0b' },
  ];

  return (
    <>
      <h2 className="mb-5">إحصائيات المنصة</h2>
      <div className="dash-stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
            <div className="stat-num">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

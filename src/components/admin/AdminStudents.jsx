import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminStudents() {
  const { success, error } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (active) { setStudents(data || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const toggleRole = async (s) => {
    const newRole = s.role === 'admin' ? 'student' : 'admin';
    const { error: e } = await supabase.from('profiles').update({ role: newRole }).eq('id', s.id);
    if (e) { error(e.message); return; }
    success(`${s.username} أصبح الآن ${newRole === 'admin' ? 'مشرفًا' : 'طالبًا'}`);
    setStudents(students.map((x) => x.id === s.id ? { ...x, role: newRole } : x));
  };

  const filtered = students.filter((s) =>
    !query || s.username.toLowerCase().includes(query.toLowerCase()) || (s.full_name || '').toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-5 wrap gap-3">
        <h2>الطلاب ({students.length})</h2>
        <input className="input" style={{ maxWidth: 280 }} placeholder="ابحث في المستخدمين..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>المستخدم</th><th>الدور</th><th>تاريخ الانضمام</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="avatar avatar-fallback" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{(s.full_name || s.username)[0]}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.username}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.full_name || '—'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${s.role === 'admin' ? 'blue' : 'beginner'}`}>{s.role === 'admin' ? 'مشرف' : 'طالب'}</span>
                </td>
                <td className="text-muted">{new Date(s.created_at).toLocaleDateString('ar')}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(s)}>
                    {s.role === 'admin' ? 'اجعله طالبًا' : 'اجعله مشرفًا'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>لا مستخدمين.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

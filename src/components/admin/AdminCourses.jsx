import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../context/ToastContext.jsx';
import { slugify } from '../../lib/utils.js';
import { uploadFile, isImage } from '../../lib/uploads.js';
import Modal from '../Modal.jsx';

const LEVEL_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function AdminCourses({ courses, categories, reload }) {
  const { success, error } = useToast();
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = courses.filter((c) =>
    !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.instructor.toLowerCase().includes(query.toLowerCase())
  );

  const remove = async (c) => {
    if (!confirm(`حذف "${c.title}"؟ هذا يحذف دروسه أيضًا.`)) return;
    const { error: e } = await supabase.from('courses').delete().eq('id', c.id);
    if (e) { error(e.message); return; }
    success('تم حذف الدورة');
    reload();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-5 wrap gap-3">
        <h2>الدورات ({courses.length})</h2>
        <div className="flex gap-3 wrap">
          <input className="input" style={{ maxWidth: 240 }} placeholder="ابحث في الدورات..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-primary" onClick={() => setModal({ mode: 'create', course: {} })}>+ إضافة دورة</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>العنوان</th><th>التصنيف</th><th>المستوى</th><th>المدرّس</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td>{c.category_name || '—'}</td>
                <td>{LEVEL_LABELS[c.level]}</td>
                <td>{c.instructor}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ mode: 'edit', course: c })}>تعديل</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => remove(c)}>حذف</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>لا دورات.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <CourseModal
          mode={modal.mode}
          course={modal.course}
          categories={categories}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            setSaving(true);
            if (modal.mode === 'create') {
              const { error: e } = await supabase.from('courses').insert(payload);
              if (e) { error(e.message); setSaving(false); return; }
              success('تم إنشاء الدورة');
            } else {
              const { error: e } = await supabase.from('courses').update(payload).eq('id', modal.course.id);
              if (e) { error(e.message); setSaving(false); return; }
              success('تم تحديث الدورة');
            }
            setSaving(false);
            setModal(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function CourseModal({ mode, course, categories, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    instructor: course.instructor || 'Saif Amr',
    level: course.level || 'beginner',
    category_id: course.category_id || '',
    thumbnail_url: course.thumbnail_url || '',
    cover_url: course.cover_url || '',
  });
  const [thumbUploading, setThumbUploading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleUpload = async (file, field) => {
    if (!file) return;
    if (!isImage(file.name)) { alert('يرجى رفع ملف صورة.'); return; }
    setThumbUploading(true);
    const { url, error: e } = await uploadFile(file, 'thumbnails');
    setThumbUploading(false);
    if (e) { alert(e); return; }
    setForm({ ...form, [field]: url });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.instructor) { alert('العنوان والوصف والمدرّس مطلوبة.'); return; }
    const cat = categories.find((c) => c.id === form.category_id);
    onSave({
      ...form,
      slug: slugify(form.title),
      category_name: cat?.name || null,
      category_id: form.category_id || null,
    });
  };

  return (
    <Modal title={mode === 'create' ? 'إضافة دورة' : 'تعديل دورة'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label className="label">العنوان</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="عنوان الدورة" />
        </div>
        <div className="field">
          <label className="label">الوصف</label>
          <textarea className="textarea" value={form.description} onChange={set('description')} placeholder="وصف مختصر" />
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="field">
            <label className="label">المدرّس</label>
            <input className="input" value={form.instructor} onChange={set('instructor')} />
          </div>
          <div className="field">
            <label className="label">المستوى</label>
            <select className="select" value={form.level} onChange={set('level')}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label">التصنيف</label>
          <select className="select" value={form.category_id} onChange={set('category_id')}>
            <option value="">— لا شيء —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="field">
            <label className="label">صورة مصغّرة</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => handleUpload(e.target.files[0], 'thumbnail_url')} />
            {thumbUploading && <div className="field-hint">جارٍ الرفع…</div>}
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="" style={{ marginTop: 8, borderRadius: 8, maxHeight: 80 }} />}
          </div>
          <div className="field">
            <label className="label">صورة الغلاف</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => handleUpload(e.target.files[0], 'cover_url')} />
            {form.cover_url && <img src={form.cover_url} alt="" style={{ marginTop: 8, borderRadius: 8, maxHeight: 80 }} />}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'حفظ'}</button>
        </div>
      </form>
    </Modal>
  );
}

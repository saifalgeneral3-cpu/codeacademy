import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../context/ToastContext.jsx';
import { uploadFile, isVideo, isDoc } from '../../lib/uploads.js';
import Modal from '../Modal.jsx';

export default function AdminLessons({ courses, reload }) {
  const { success, error } = useToast();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedCourse) { setLessons([]); return; }
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from('lessons').select('*').eq('course_id', selectedCourse).order('position', { ascending: true });
      if (active) { setLessons(data || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [selectedCourse]);

  const remove = async (l) => {
    if (!confirm(`حذف الدرس "${l.title}"؟`)) return;
    const { error: e } = await supabase.from('lessons').delete().eq('id', l.id);
    if (e) { error(e.message); return; }
    success('تم حذف الدرس');
    reload();
    setLessons(lessons.filter((x) => x.id !== l.id));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-5 wrap gap-3">
        <h2>الدروس</h2>
        <div className="flex gap-3 wrap">
          <select className="select" style={{ maxWidth: 280 }} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!selectedCourse} onClick={() => setModal({ mode: 'create', lesson: {} })}>+ إضافة درس</button>
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : lessons.length === 0 ? (
        <div className="empty-state"><p>لا دروس بعد. أضف الأول.</p></div>
      ) : (
        <div className="lesson-list">
          {lessons.map((l, i) => (
            <div key={l.id} className="lesson-item">
              <span className="lesson-num">{i + 1}</span>
              <span className="lesson-item-title">{l.title}</span>
              <span className="lesson-dur">{l.duration_min}د</span>
              {l.video_url && <span className="badge badge-blue">فيديو</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ mode: 'edit', lesson: l })}>تعديل</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => remove(l)}>حذف</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <LessonModal
          mode={modal.mode}
          lesson={modal.lesson}
          courseId={selectedCourse}
          nextPosition={lessons.length + 1}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={async (payload, resources) => {
            setSaving(true);
            let lessonId = modal.lesson.id;
            if (modal.mode === 'create') {
              const { data, error: e } = await supabase.from('lessons').insert(payload).select().single();
              if (e) { error(e.message); setSaving(false); return; }
              lessonId = data.id;
            } else {
              const { error: e } = await supabase.from('lessons').update(payload).eq('id', lessonId);
              if (e) { error(e.message); setSaving(false); return; }
            }
            if (resources && resources.length) {
              const rows = resources.map((r) => ({ lesson_id: lessonId, name: r.name, file_url: r.url, file_type: r.type }));
              const { error: re } = await supabase.from('resources').insert(rows);
              if (re) error(re.message);
            }
            setSaving(false);
            success(modal.mode === 'create' ? 'تم إنشاء الدرس' : 'تم تحديث الدرس');
            setModal(null);
            reload();
            const { data } = await supabase.from('lessons').select('*').eq('course_id', selectedCourse).order('position', { ascending: true });
            setLessons(data || []);
          }}
        />
      )}
    </>
  );
}

function LessonModal({ mode, lesson, courseId, nextPosition, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    title: lesson.title || '',
    description: lesson.description || '',
    notes: lesson.notes || '',
    duration_min: lesson.duration_min || 10,
    position: lesson.position || nextPosition,
    video_url: lesson.video_url || '',
    source_code_url: lesson.source_code_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [newResources, setNewResources] = useState([]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleVideo = async (file) => {
    if (!file) return;
    if (!isVideo(file.name)) { alert('الصيغ المدعومة: MP4, WebM, MOV'); return; }
    setUploading(true);
    const { url, error: e } = await uploadFile(file, 'videos');
    setUploading(false);
    if (e) { alert(e); return; }
    setForm({ ...form, video_url: url });
  };

  const handleSource = async (file) => {
    if (!file) return;
    setUploading(true);
    const { url, error: e } = await uploadFile(file, 'source');
    setUploading(false);
    if (e) { alert(e); return; }
    setForm({ ...form, source_code_url: url });
  };

  const handleResource = async (file) => {
    if (!file) return;
    if (!isDoc(file.name)) { alert('المدعوم: PDF, ZIP, TXT, MD'); return; }
    setUploading(true);
    const { url, error: e } = await uploadFile(file, 'resources');
    setUploading(false);
    if (e) { alert(e); return; }
    setNewResources([...newResources, { name: file.name, url, type: file.name.split('.').pop().toUpperCase() }]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) { alert('العنوان مطلوب.'); return; }
    onSave({ ...form, course_id: courseId, duration_min: Number(form.duration_min) || 0, position: Number(form.position) || 0 }, newResources);
  };

  return (
    <Modal title={mode === 'create' ? 'إضافة درس' : 'تعديل درس'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label className="label">العنوان</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="عنوان الدرس" />
        </div>
        <div className="field">
          <label className="label">الوصف</label>
          <textarea className="textarea" value={form.description} onChange={set('description')} placeholder="ما يغطه هذا الدرس" />
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="field">
            <label className="label">المدة (دقيقة)</label>
            <input type="number" className="input" value={form.duration_min} onChange={set('duration_min')} min="0" />
          </div>
          <div className="field">
            <label className="label">الترتيب</label>
            <input type="number" className="input" value={form.position} onChange={set('position')} min="1" />
          </div>
        </div>
        <div className="field">
          <label className="label">ملاحظات</label>
          <textarea className="textarea" value={form.notes} onChange={set('notes')} placeholder="ملاحظات الدرس / النقاط الرئيسية" />
        </div>
        <div className="field">
          <label className="label">فيديو (MP4 / WebM / MOV)</label>
          <input type="file" accept="video/mp4,video/webm,video/quicktime" className="input" onChange={(e) => handleVideo(e.target.files[0])} />
          {uploading && <div className="field-hint">جارٍ الرفع…</div>}
          {form.video_url && <div className="field-hint" style={{ color: 'var(--success)' }}>✓ تم رفع الفيديو</div>}
        </div>
        <div className="field">
          <label className="label">الكود المصدري (ZIP)</label>
          <input type="file" accept=".zip,.rar,.7z" className="input" onChange={(e) => handleSource(e.target.files[0])} />
          {form.source_code_url && <div className="field-hint" style={{ color: 'var(--success)' }}>✓ تم رفع الكود</div>}
        </div>
        <div className="field">
          <label className="label">موارد (PDF / ZIP)</label>
          <input type="file" accept=".pdf,.zip,.txt,.md" className="input" onChange={(e) => handleResource(e.target.files[0])} multiple />
          {newResources.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {newResources.map((r, i) => (
                <div key={i} className="resource-item"><div className="resource-icon">📎</div><div>{r.name}</div></div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'حفظ'}</button>
        </div>
      </form>
    </Modal>
  );
}

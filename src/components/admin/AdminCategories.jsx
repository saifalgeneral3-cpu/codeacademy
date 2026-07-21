import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../context/ToastContext.jsx';
import { slugify } from '../../lib/utils.js';
import Modal from '../Modal.jsx';

export default function AdminCategories({ categories, reload }) {
  const { success, error } = useToast();
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const remove = async (c) => {
    if (!confirm(`حذف التصنيف "${c.name}"؟`)) return;
    const { error: e } = await supabase.from('categories').delete().eq('id', c.id);
    if (e) { error(e.message); return; }
    success('تم حذف التصنيف');
    reload();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-5 wrap gap-3">
        <h2>التصنيفات ({categories.length})</h2>
        <button className="btn btn-primary" onClick={() => setModal({ name: '', icon: '' })}>+ إضافة تصنيف</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>الأيقونة</th><th>الاسم</th><th>المعرّف</th><th>إجراءات</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td style={{ fontSize: '1.2rem' }}>{c.icon || '🏷️'}</td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="text-muted" dir="ltr">{c.slug}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>تعديل</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => remove(c)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CategoryModal
          category={modal}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            setSaving(true);
            if (modal.id) {
              const { error: e } = await supabase.from('categories').update(payload).eq('id', modal.id);
              if (e) { error(e.message); setSaving(false); return; }
              success('تم تحديث التصنيف');
            } else {
              const { error: e } = await supabase.from('categories').insert({ ...payload, slug: slugify(payload.name) });
              if (e) { error(e.message); setSaving(false); return; }
              success('تم إنشاء التصنيف');
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

function CategoryModal({ category, saving, onClose, onSave }) {
  const [form, setForm] = useState({ name: category.name || '', icon: category.icon || '' });
  return (
    <Modal title={category.id ? 'تعديل تصنيف' : 'إضافة تصنيف'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.name) { alert('الاسم مطلوب'); return; } onSave(form); }}>
        <div className="field">
          <label className="label">الاسم</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: Rust" />
        </div>
        <div className="field">
          <label className="label">الأيقونة (إيموجي)</label>
          <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🦀" />
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'حفظ'}</button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToUserPortals, createPortal, updatePortal, deletePortal,
  closePortalAndShuffle,
} from '../utils/portalService';
import PortalBadge from '../components/PortalBadge';
import Modal from '../components/Modal';
import Toast, { showToast } from '../components/Toast';

export default function Portals() {
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [delModal, setDelModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', slug: '', groupSize: 4, maxStudents: 0,
  });

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, setPortals);
  }, [user]);

  function set(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPortal(user.uid, {
        name: form.name,
        description: form.description,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        groupSize: Number(form.groupSize),
        maxStudents: Number(form.maxStudents),
        questions: [],
        bgImageUrl: null,
        accentColor: '#e85d26',
      });
      showToast('Portal created! 🚀', 'success');
      setCreateModal(false);
      setForm({ name: '', description: '', slug: '', groupSize: 4, maxStudents: 0 });
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  }

  async function handleDelete(portalId) {
    await deletePortal(portalId);
    showToast('Portal deleted', 'info');
    setDelModal(null);
  }

  async function togglePortal(portal) {
    await updatePortal(portal.id, { isOpen: !portal.isOpen });
    showToast(portal.isOpen ? 'Portal closed' : 'Portal opened ✅', 'info');
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10">
        <div className="font-syne text-xl font-bold">My Portals</div>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}>+ New Portal</button>
      </div>

      <div className="px-8 py-8">
        {portals.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="font-syne text-xl font-bold mb-2">No portals yet</h3>
            <p className="text-muted mb-6 text-sm">Create your first registration portal to get started.</p>
            <button className="btn btn-primary px-7 py-3" onClick={() => setCreateModal(true)}>Create First Portal</button>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="border-b-2 border-border">
                <tr>
                  {['Portal Name', 'Students', 'Group Size', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portals.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-none hover:bg-cream/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-muted mt-0.5">/p/{p.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-sm">{p.studentCount || 0}</td>
                    <td className="px-5 py-4 text-sm">{p.groupSize} per group</td>
                    <td className="px-5 py-4"><PortalBadge isOpen={p.isOpen} /></td>
                    <td className="px-5 py-4 text-xs text-muted">
                      {p.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/app/settings/${p.id}`} className="btn btn-outline px-3 py-1.5 text-xs">⚙ Edit</Link>
                        {p.isOpen ? (
                          <button className="btn btn-danger px-3 py-1.5 text-xs" onClick={() => togglePortal(p)}>Close</button>
                        ) : (
                          <>
                            <button className="btn btn-success px-3 py-1.5 text-xs" onClick={() => togglePortal(p)}>Open</button>
                            <Link to={`/app/groups/${p.id}`} className="btn btn-blue px-3 py-1.5 text-xs">📊 Export</Link>
                          </>
                        )}
                        <button className="btn btn-outline px-3 py-1.5 text-xs text-red-500 border-red-200" onClick={() => setDelModal(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Portal"
        subtitle="Set up a new student group registration portal"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating…' : 'Create Portal →'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Portal Name *</label>
            <input className="input-field" placeholder="e.g. BIO 202 — Lab Groups" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Description</label>
            <textarea className="input-field" rows={2} placeholder="Instructions for students…" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Students per Group *</label>
              <input type="number" className="input-field" min={2} max={50} value={form.groupSize} onChange={set('groupSize')} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Max Students (0 = ∞)</label>
              <input type="number" className="input-field" min={0} value={form.maxStudents} onChange={set('maxStudents')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Portal Slug</label>
            <input className="input-field" placeholder="bio202-lab-2025" value={form.slug} onChange={set('slug')} />
            <p className="text-xs text-muted mt-1">{window.location.origin}/p/<strong>{form.slug || 'your-slug'}</strong></p>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!delModal}
        onClose={() => setDelModal(null)}
        title="Delete Portal?"
        subtitle="This action cannot be undone. All student data will be permanently deleted."
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDelModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(delModal)}>Delete Permanently</button>
          </>
        }
      >
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          All registered students and their data in this portal will be permanently deleted.
        </div>
      </Modal>

      <Toast />
    </div>
  );
}

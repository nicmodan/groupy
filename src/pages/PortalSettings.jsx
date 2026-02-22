import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, updatePortal } from '../utils/portalService';
import Toggle from '../components/Toggle';
import Toast, { showToast } from '../components/Toast';

export default function PortalSettings() {
  const { portalId } = useParams();
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activeId, setActiveId] = useState(portalId || '');
  const [form, setForm] = useState({
    name: '', description: '', slug: '', groupSize: 4,
    maxStudents: 0, isOpen: true, closedMessage: '',
    requireEmail: true, requireStudentId: true, requirePhone: false,
    allowOverflow: true, showGroupsToStudents: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      const target = ps.find(p => p.id === activeId) || ps[0];
      if (target) {
        setActiveId(target.id);
        setForm(f => ({
          ...f,
          name: target.name || '',
          description: target.description || '',
          slug: target.slug || '',
          groupSize: target.groupSize || 4,
          maxStudents: target.maxStudents || 0,
          isOpen: target.isOpen ?? true,
          closedMessage: target.closedMessage || 'Registration is now closed. Please contact your instructor.',
          requireEmail: target.requireEmail ?? true,
          requireStudentId: target.requireStudentId ?? true,
          requirePhone: target.requirePhone ?? false,
          allowOverflow: target.allowOverflow ?? true,
          showGroupsToStudents: target.showGroupsToStudents ?? false,
        }));
      }
    });
  }, [user]);

  function set(key) {
    return (val) => setForm(f => ({ ...f, [key]: val }));
  }
  function setInput(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      await updatePortal(activeId, form);
      showToast('Settings saved! ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Portal Settings</div>
        <div className="flex gap-3">
          {portals.length > 1 && (
            <select className="input-field w-52" value={activeId} onChange={e => setActiveId(e.target.value)}>
              {portals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="px-8 py-8 grid md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-syne font-bold">Basic Information</h3>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Portal Name</label>
              <input className="input-field" value={form.name} onChange={setInput('name')} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Description / Instructions</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={setInput('description')} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Portal Slug (URL)</label>
              <input className="input-field" value={form.slug} onChange={setInput('slug')} />
              <p className="text-xs text-muted mt-1">{window.location.origin}/p/<strong>{form.slug}</strong></p>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-syne font-bold">Group Configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Students per Group</label>
                <input type="number" className="input-field" min={2} value={form.groupSize} onChange={setInput('groupSize')} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Max Students (0 = ∞)</label>
                <input type="number" className="input-field" min={0} value={form.maxStudents} onChange={setInput('maxStudents')} />
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-semibold">Allow Overflow Group</div>
                <div className="text-xs text-muted">Last group may be smaller if uneven</div>
              </div>
              <Toggle checked={form.allowOverflow} onChange={set('allowOverflow')} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-semibold">Show Group to Students</div>
                <div className="text-xs text-muted">After shuffling, students can see their group</div>
              </div>
              <Toggle checked={form.showGroupsToStudents} onChange={set('showGroupsToStudents')} />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-syne font-bold">Portal Access</h3>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-semibold">Portal Open</div>
                <div className="text-xs text-muted">Toggle registration on/off</div>
              </div>
              <Toggle checked={form.isOpen} onChange={set('isOpen')} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Custom Closed Message</label>
              <textarea className="input-field" rows={2} value={form.closedMessage} onChange={setInput('closedMessage')} />
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-syne font-bold">Required Student Fields</h3>
            {[
              { key: 'requireEmail', label: 'Email Address', required: true },
              { key: 'requireStudentId', label: 'Student ID / Matric No.' },
              { key: 'requirePhone', label: 'Phone Number' },
            ].map(({ key, label, required }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div className="text-sm font-semibold">{label}</div>
                <Toggle
                  checked={form[key]}
                  onChange={required ? undefined : set(key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}

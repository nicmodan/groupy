import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, closePortalAndShuffle, updatePortal } from '../utils/portalService';
import { subscribeToStudents } from '../utils/portalService';
import PortalBadge from '../components/PortalBadge';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activePortal, setActivePortal] = useState(null);
  const [students, setStudents] = useState([]);
  const [closeModal, setCloseModal] = useState(false);
  const [groupSize, setGroupSize] = useState(4);
  const [closing, setClosing] = useState(false);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.displayName || 'Admin';

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      if (ps.length > 0 && !activePortal) setActivePortal(ps[0]);
    });
  }, [user]);

  useEffect(() => {
    if (!activePortal) return;
    return subscribeToStudents(activePortal.id, setStudents);
  }, [activePortal?.id]);

  async function handleClosePortal() {
    if (!activePortal) return;
    setClosing(true);
    try {
      await closePortalAndShuffle(
        activePortal.id,
        groupSize,
        activePortal.name,
        activePortal.questions || []
      );
      showToast('Portal closed! Excel downloaded. 📊', 'success');
      setCloseModal(false);
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
    setClosing(false);
  }

  async function handleOpenPortal() {
    if (!activePortal) return;
    await updatePortal(activePortal.id, { isOpen: true, closedAt: null });
    showToast('Portal reopened! ✅', 'success');
  }

  const numGroups = Math.ceil(students.length / (groupSize || 4));
  const recentStudents = students.slice(0, 8);

  return (
    <div className="animate-fade-in">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Dashboard</div>
        <div className="flex items-center gap-3 flex-wrap">
          {activePortal && <PortalBadge isOpen={activePortal.isOpen} />}
          {activePortal?.isOpen ? (
            <button className="btn btn-danger" onClick={() => setCloseModal(true)}>
              🔒 Close Portal
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleOpenPortal}>
              🔓 Open Portal
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-8">
        {portals.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="font-syne text-2xl font-bold mb-2">Welcome, {displayName}!</h2>
            <p className="text-muted mb-7">You don't have any portals yet. Create your first one to get started.</p>
            <Link to="/app/portals" className="btn btn-primary px-7 py-3 text-base">
              Create Your First Portal →
            </Link>
          </div>
        ) : (
          <>
            {/* Portal selector */}
            {portals.length > 1 && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Active Portal</label>
                <select
                  className="input-field max-w-xs"
                  value={activePortal?.id || ''}
                  onChange={e => setActivePortal(portals.find(p => p.id === e.target.value))}
                >
                  {portals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {[
                { icon: '👥', val: students.length, label: 'Students Registered' },
                { icon: '🗂️', val: numGroups, label: 'Estimated Groups' },
                { icon: '🚪', val: portals.length, label: 'Total Portals' },
                { icon: '📐', val: activePortal?.groupSize || groupSize, label: 'Students / Group' },
              ].map(s => (
                <div key={s.label} className="card">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-syne text-3xl font-extrabold text-ink">{s.val}</div>
                  <div className="text-xs text-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent registrations */}
              <div className="card">
                <h3 className="font-syne font-bold mb-1">Recent Registrations</h3>
                <p className="text-xs text-muted mb-5">Live feed from your active portal</p>
                {recentStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted text-sm">No students registered yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left text-[11px] font-bold text-muted uppercase tracking-wider pb-2">Name</th>
                        <th className="text-left text-[11px] font-bold text-muted uppercase tracking-wider pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map(s => (
                        <tr key={s.id} className="border-b border-border last:border-none hover:bg-cream transition-colors">
                          <td className="py-3 font-medium text-sm">{s.name}</td>
                          <td className="py-3">
                            <span className="badge bg-green-100 text-green-700">Registered</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Quick actions */}
              <div className="card">
                <h3 className="font-syne font-bold mb-1">Quick Actions</h3>
                <p className="text-xs text-muted mb-5">Manage your current session</p>
                <div className="flex flex-col gap-3">
                  <Link to="/app/portals" className="btn btn-primary justify-center py-3">+ Create New Portal</Link>
                  <Link to={`/app/groups/${activePortal?.id || ''}`} className="btn btn-blue justify-center py-3">🎲 Shuffle & View Groups</Link>
                  <a
                    href={`/p/${activePortal?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline justify-center py-3"
                  >👁 Preview Student Portal</a>
                  {!activePortal?.isOpen && (
                    <Link to={`/app/groups/${activePortal?.id || ''}`} className="btn btn-success justify-center py-3">📊 Export to Excel</Link>
                  )}
                </div>
                <hr className="my-5 border-border" />
                <div className="font-syne font-bold text-sm mb-2">Portal Link</div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    className="input-field bg-cream text-sm"
                    value={activePortal ? `${window.location.origin}/p/${activePortal.slug}` : ''}
                  />
                  <button
                    className="btn btn-outline px-3 flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/p/${activePortal?.slug}`);
                      showToast('Link copied! 📋', 'info');
                    }}
                  >📋</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Close Portal Modal */}
      <Modal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="⚠️ Close Registration Portal?"
        subtitle="This will stop new registrations. Students will see a closed message."
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCloseModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClosePortal} disabled={closing}>
              {closing ? 'Processing…' : '🔒 Close & Download Excel'}
            </button>
          </>
        }
      >
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-xl mb-5">
          After closing, all <strong>{students.length}</strong> registered students will be shuffled into groups and the Excel file will download automatically.
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Students per Group</label>
          <input
            type="number"
            className="input-field"
            min={2}
            max={50}
            value={groupSize}
            onChange={e => setGroupSize(Number(e.target.value))}
          />
          <p className="text-xs text-muted mt-1">
            Estimated groups: <strong>{Math.ceil(students.length / (groupSize || 1))}</strong>
          </p>
        </div>
      </Modal>

      <Toast />
    </div>
  );
}

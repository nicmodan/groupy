import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, subscribeToStudents, closePortalAndShuffle } from '../utils/portalService';
import { assignGroups, groupByNumber } from '../utils/shuffle';
import { exportGroupsToExcel } from '../utils/exportExcel';
import Modal from '../components/Modal';
import Toast, { showToast } from '../components/Toast';

const GROUP_COLORS = ['#e85d26','#2563eb','#16a34a','#9333ea','#c2410c','#0891b2','#ca8a04','#be185d','#0f766e','#7c3aed'];

export default function Groups() {
  const { portalId } = useParams();
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activeId, setActiveId] = useState(portalId || '');
  const [students, setStudents] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [groupSize, setGroupSize] = useState(4);
  const [closeModal, setCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      if (!activeId && ps.length > 0) {
        setActiveId(ps[0].id);
        setGroupSize(ps[0].groupSize || 4);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    return subscribeToStudents(activeId, (ss) => {
      setStudents(ss);
      // If already assigned, use those groups
      const hasGroups = ss.some(s => s.groupNumber);
      if (hasGroups) setShuffled(ss);
    });
  }, [activeId]);

  const activePortal = portals.find(p => p.id === activeId);

  function doShuffle() {
    const gs = activePortal?.groupSize || groupSize;
    const result = assignGroups(students, gs);
    setShuffled(result);
    showToast('Students shuffled! 🎲', 'success');
  }

  function handleExport() {
    const data = shuffled.length ? shuffled : students;
    exportGroupsToExcel(data, activePortal?.name || 'Groups', activePortal?.questions || []);
    showToast('Excel downloaded! 📊', 'success');
  }

  async function handleCloseAndExport() {
    if (!activePortal) return;
    setClosing(true);
    try {
      const grouped = await closePortalAndShuffle(
        activePortal.id,
        groupSize,
        activePortal.name,
        activePortal.questions || []
      );
      setShuffled(grouped);
      showToast('Portal closed! Excel downloaded. 📊', 'success');
      setCloseModal(false);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setClosing(false);
  }

  const displayData = shuffled.length ? shuffled : students;
  const groups = groupByNumber(displayData);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Shuffled Groups</div>
        <div className="flex items-center gap-3 flex-wrap">
          {portals.length > 1 && (
            <select className="input-field w-52" value={activeId} onChange={e => {
              setActiveId(e.target.value);
              const p = portals.find(x => x.id === e.target.value);
              if (p) setGroupSize(p.groupSize || 4);
            }}>
              {portals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn btn-blue" onClick={doShuffle}>🎲 Re-Shuffle</button>
          <button className="btn btn-outline" onClick={handleExport}>📊 Export Excel</button>
          {activePortal?.isOpen && (
            <button className="btn btn-danger" onClick={() => setCloseModal(true)}>🔒 Close & Export</button>
          )}
        </div>
      </div>

      <div className="px-8 py-8">
        {students.length === 0 ? (
          <div className="text-center py-20 text-muted text-sm">
            No students registered yet. Share your portal link to get started.
          </div>
        ) : !shuffled.length && !students.some(s => s.groupNumber) ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎲</div>
            <h3 className="font-syne text-xl font-bold mb-2">Ready to Shuffle</h3>
            <p className="text-muted text-sm mb-6">{students.length} students registered. Click shuffle to assign groups.</p>
            <button className="btn btn-blue px-7 py-3 text-base" onClick={doShuffle}>Shuffle Now</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-sm text-muted">
                <strong>{students.length}</strong> students → <strong>{Object.keys(groups).length}</strong> groups of ~<strong>{activePortal?.groupSize || groupSize}</strong>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(groups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([g, members], idx) => (
                  <div
                    key={g}
                    className="bg-white border border-border rounded-xl p-5 animate-shuffle-in shadow-sm hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div
                      className="font-syne text-sm font-bold mb-3"
                      style={{ color: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                    >
                      🎲 Group {g}
                      <span className="text-muted font-normal text-xs ml-1">({members.length})</span>
                    </div>
                    {members.map(s => (
                      <div key={s.id} className="flex items-center gap-2.5 py-2 border-b border-border last:border-none">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                        >
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">{s.name}</div>
                          {s.studentId && <div className="text-[10px] text-muted">{s.studentId}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <Modal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Close Portal & Export?"
        subtitle="Students will no longer be able to register."
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCloseModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleCloseAndExport} disabled={closing}>
              {closing ? 'Processing…' : '🔒 Close & Download Excel'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-semibold mb-1.5">Students per Group</label>
          <input type="number" className="input-field" min={2} value={groupSize} onChange={e => setGroupSize(Number(e.target.value))} />
          <p className="text-xs text-muted mt-1">
            {students.length} students → ~{Math.ceil(students.length / (groupSize || 1))} groups
          </p>
        </div>
      </Modal>

      <Toast />
    </div>
  );
}

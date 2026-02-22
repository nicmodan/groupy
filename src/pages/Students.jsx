import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, subscribeToStudents } from '../utils/portalService';
import { exportGroupsToExcel } from '../utils/exportExcel';
import Toast, { showToast } from '../components/Toast';

export default function Students() {
  const { portalId } = useParams();
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activeId, setActiveId] = useState(portalId || '');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      if (!activeId && ps.length > 0) setActiveId(ps[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    return subscribeToStudents(activeId, setStudents);
  }, [activeId]);

  const activePortal = portals.find(p => p.id === activeId);
  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  function handleExport() {
    exportGroupsToExcel(students, activePortal?.name || 'Students', activePortal?.questions || []);
    showToast('Excel downloaded! 📊', 'success');
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Registered Students</div>
        <div className="flex items-center gap-3 flex-wrap">
          {portals.length > 1 && (
            <select className="input-field w-56" value={activeId} onChange={e => setActiveId(e.target.value)}>
              {portals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <input
            className="input-field w-52"
            placeholder="Search students…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-outline" onClick={handleExport}>📊 Export</button>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="card p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted text-sm">
              {search ? 'No students match your search.' : 'No students registered yet.'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b-2 border-border">
                <tr>
                  {['#', 'Name', 'Email', 'Student ID', 'Registered', 'Group'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-border last:border-none hover:bg-cream/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">{s.email}</td>
                    <td className="px-5 py-3.5 text-sm">{s.studentId || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {s.registeredAt?.toDate?.().toLocaleString() || 'Recently'}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.groupNumber ? (
                        <span className="badge bg-orange-100 text-orange-700">Group {s.groupNumber}</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-muted mt-3">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</p>
      </div>
      <Toast />
    </div>
  );
}

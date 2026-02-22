import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function timeAgo(ts) {
  if (!ts?.toDate) return 'Recently';
  const diff = Date.now() - ts.toDate().getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return ts.toDate().toLocaleDateString();
}

export default function PortalDirectory() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | open | closed
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchPortals() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'portals'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        all.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setPortals(all);
      } catch (e) {
        console.error('Error fetching portals:', e);
      }
      setLoading(false);
    }
    fetchPortals();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = portals.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ||
      (filter === 'open' && p.isOpen) ||
      (filter === 'closed' && !p.isOpen);
    return matchSearch && matchFilter;
  });

  const openCount = portals.filter(p => p.isOpen).length;
  const closedCount = portals.filter(p => !p.isOpen).length;

  return (
    <div className="bg-ink min-h-screen text-paper">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-paper/10 sticky top-0 z-50 backdrop-blur-md bg-ink/90">
        <Link to="/" className="font-syne text-xl font-extrabold">
          Group<span className="text-accent">ify</span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm text-paper/60">
          <Link to="/" className="hover:text-paper transition-colors">Home</Link>
          <Link to="/portals" className="text-paper font-semibold">Portal Directory</Link>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn btn-ghost text-sm px-4 py-2">Sign In</Link>
          <Link to="/login" className="btn btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </nav>

      {/* HERO SEARCH HEADER */}
      <div className="relative overflow-hidden border-b border-paper/10">
        {/* BG glow effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent2/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
            🚪 Public Portal Directory
          </div>
          <h1 className="font-syne text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find Your <span className="text-accent">Registration Portal</span>
          </h1>
          <p className="text-paper/50 text-base mb-10 leading-relaxed">
            Search for your class or group portal below. Click a portal to register — no account needed.
          </p>

          {/* SEARCH BAR */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/30 text-lg pointer-events-none">🔍</div>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-paper/8 border border-paper/20 rounded-2xl pl-12 pr-5 py-4 text-paper placeholder-paper/30 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Search by class name, course code, or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-paper/30 hover:text-paper/70 transition-colors text-lg"
                onClick={() => setSearch('')}
              >✕</button>
            )}
          </div>

          {/* FILTERS */}
          <div className="flex items-center justify-center gap-3 mt-5">
            {[
              { key: 'all', label: `All (${portals.length})` },
              { key: 'open', label: `Open (${openCount})` },
              { key: 'closed', label: `Closed (${closedCount})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filter === f.key
                    ? 'bg-accent border-accent text-white'
                    : 'border-paper/20 text-paper/50 hover:border-paper/40 hover:text-paper/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PORTAL GRID */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-paper/5 border border-paper/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-paper/10 rounded mb-3 w-3/4" />
                <div className="h-3 bg-paper/8 rounded mb-5 w-1/2" />
                <div className="h-3 bg-paper/8 rounded mb-2 w-full" />
                <div className="h-3 bg-paper/8 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-syne text-2xl font-bold mb-2">
              {search ? `No portals matching "${search}"` : 'No portals yet'}
            </h3>
            <p className="text-paper/40 text-sm mb-6">
              {search
                ? 'Try a different search term or browse all portals.'
                : 'Portals created by instructors will appear here.'}
            </p>
            {search && (
              <button
                className="btn btn-ghost text-sm px-5 py-2.5"
                onClick={() => setSearch('')}
              >Clear search</button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-paper/40 text-sm">
                {search
                  ? <><span className="text-paper/70 font-semibold">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''} for "<span className="text-accent">{search}</span>"</>
                  : <><span className="text-paper/70 font-semibold">{filtered.length}</span> portal{filtered.length !== 1 ? 's' : ''} available</>
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((portal, idx) => (
                <PortalCard key={portal.id} portal={portal} idx={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FOOTER BAND */}
      <div className="border-t border-paper/10 py-8 px-8 text-center">
        <p className="text-paper/30 text-sm">
          Are you an instructor?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">Create your own portal →</Link>
        </p>
      </div>
    </div>
  );
}

function PortalCard({ portal, idx }) {
  const accentColor = portal.accentColor || '#e85d26';

  return (
    <Link
      to={`/p/${portal.slug}`}
      className="group block bg-paper/4 border border-paper/12 rounded-2xl overflow-hidden hover:border-paper/25 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      {/* Card top strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: portal.isOpen ? accentColor : '#6b7280' }}
      />

      {/* Card body */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-syne font-bold text-base text-paper leading-tight truncate group-hover:text-accent transition-colors">
              {portal.name}
            </h3>
            <div className="text-[11px] text-paper/35 mt-0.5 font-mono">/p/{portal.slug}</div>
          </div>
          {/* Status badge */}
          {portal.isOpen ? (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/25 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Open
            </span>
          ) : (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-paper/8 border border-paper/15 text-paper/35 px-2.5 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-paper/30" />
              Closed
            </span>
          )}
        </div>

        {portal.description && (
          <p className="text-paper/45 text-xs leading-relaxed mb-4 line-clamp-2">
            {portal.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-paper/30 pt-3 border-t border-paper/10">
          <span>👥 {portal.studentCount || 0} registered</span>
          <span>🎲 {portal.groupSize || 4} per group</span>
          <span className="ml-auto">{timeAgo(portal.createdAt)}</span>
        </div>
      </div>

      {/* Hover CTA footer */}
      <div
        className="px-6 py-3 flex items-center justify-between text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: portal.isOpen ? `${accentColor}18` : 'rgba(255,255,255,0.04)', color: portal.isOpen ? accentColor : 'rgba(245,243,238,0.4)' }}
      >
        <span>{portal.isOpen ? 'Register now' : 'View portal'}</span>
        <span>→</span>
      </div>
    </Link>
  );
}

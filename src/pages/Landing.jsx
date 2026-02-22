import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const features = [
  { tag: 'Core', icon: '🎲', title: 'True Random Shuffling', desc: 'Cryptographically random Fisher-Yates shuffle ensures every student has an equal chance of any group placement.' },
  { tag: 'Admin', icon: '🚪', title: 'Open/Close Portal Control', desc: 'Toggle your registration portal on or off from the dashboard. Students see a clean message when closed.' },
  { tag: 'Export', icon: '📊', title: 'One-Click Excel Export', desc: 'When you close the portal, download a beautifully formatted Excel sheet with all students organized by group.' },
  { tag: 'Flexible', icon: '⚙️', title: 'Custom Group Sizes', desc: 'Set exactly how many students per group. Groupify auto-calculates groups and handles remainders gracefully.' },
  { tag: 'Survey', icon: '❓', title: 'Custom Questions', desc: 'Add multiple-choice questions to your portal — collect preferences, skill levels, or icebreaker answers.' },
  { tag: 'Branding', icon: '🎨', title: 'Custom Background Images', desc: 'Upload a background image to brand your student-facing portal. Make it feel like your classroom.' },
  { tag: 'Auth', icon: '🔐', title: 'Secure Admin Accounts', desc: 'Firebase-powered authentication. Each admin gets their own isolated workspace and portals.' },
  { tag: 'Realtime', icon: '⚡', title: 'Live Registration Feed', desc: 'Watch students register in real time from your dashboard. See count, names, and responses instantly.' },
  { tag: 'Multiple', icon: '📁', title: 'Multiple Portals', desc: 'Create as many portals as you need — one per class, per assignment, or per semester.' },
];

const steps = [
  { num: '1', title: 'Create Account', desc: 'Sign up for free and set up your admin workspace in seconds.' },
  { num: '2', title: 'Build Portal', desc: 'Name it, set group size, add questions, upload a background.' },
  { num: '3', title: 'Share Link', desc: 'Share your portal link with students. They register with their details.' },
  { num: '4', title: 'Close & Export', desc: 'Close the portal, shuffle, and download your Excel sheet instantly.' },
];

export default function Landing() {
  const [portals, setPortals] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingPortals, setLoadingPortals] = useState(true);

  useEffect(() => {
    async function fetchPortals() {
      try {
        const snap = await getDocs(collection(db, 'portals'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        all.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setPortals(all);
      } catch (e) {
        console.error(e);
      }
      setLoadingPortals(false);
    }
    fetchPortals();
  }, []);

  const filteredPortals = portals.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  return (
    <div className="bg-ink text-paper min-h-screen">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-paper/10 sticky top-0 z-50 backdrop-blur-md bg-ink/85">
        <div className="font-syne text-xl font-extrabold">Group<span className="text-accent">ify</span></div>
        <div className="hidden md:flex gap-8 text-sm text-paper/60">
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
          <a href="#how" className="hover:text-paper transition-colors">How it works</a>
          <a href="#portals" className="hover:text-paper transition-colors">Find a Portal</a>
          <a href="#pricing" className="hover:text-paper transition-colors">Pricing</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn btn-ghost text-sm px-4 py-2">Sign In</Link>
          <Link to="/login" className="btn btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            🎓 Built for Educators
          </div>
          <h1 className="font-syne text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Shuffle Students.<br />Build <em className="not-italic text-accent">Better</em><br />Groups Instantly.
          </h1>
          <p className="text-paper/60 text-lg leading-relaxed mb-8 max-w-md">
            Create a portal, collect student responses, and let Groupify randomly assign everyone into balanced, fair groups — then export to Excel with one click.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/login" className="btn btn-primary px-7 py-3.5 text-base font-semibold">
              Create Your Portal ↗
            </Link>
            <a href="#how" className="btn btn-ghost px-7 py-3.5 text-base">
              See How It Works
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="bg-paper/5 border border-paper/12 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
          {[
            { group: 'A', students: ['Alice M.', 'James O.', 'Sarah K.', 'Tom L.'] },
            { group: 'B', students: ['Emeka R.', 'Zara A.', 'Chris N.', 'Lisa B.'] },
          ].map(g => (
            <div key={g.group} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3 relative z-10">
              <div className="text-[11px] font-bold text-gold uppercase tracking-widest mb-3">
                🎲 Group {g.group} — {g.students.length} Students
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.students.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3 py-1 text-xs text-paper/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />{s}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="relative z-10 flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <span className="text-xs text-paper/60">✅ Portal closed — Excel ready</span>
            <span className="text-xs font-bold text-green-400 tracking-wide">DOWNLOAD ↓</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="border-y border-paper/10 py-10">
        <div className="max-w-4xl mx-auto px-8 flex justify-around flex-wrap gap-8">
          {[['5k+','Portals Created'],['200k+','Students Grouped'],['99.9%','Uptime'],['< 1s','Shuffle Speed']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-syne text-4xl font-extrabold text-accent">{num}</div>
              <div className="text-xs text-paper/40 mt-1 tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-8 md:px-16 py-24">
        <div className="text-[11px] font-bold text-accent tracking-widest uppercase mb-4">Features</div>
        <h2 className="font-syne text-4xl font-extrabold tracking-tight mb-4">Everything you need<br />in one place.</h2>
        <p className="text-paper/50 mb-14 max-w-xl leading-relaxed">Groupify is purpose-built for teachers and event organizers who want to stop manually creating groups forever.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-paper/4 border border-paper/10 rounded-2xl p-8 hover:bg-paper/7 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300">
              <span className="inline-block bg-accent/15 text-accent text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">{f.tag}</span>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-syne text-base font-bold mb-2">{f.title}</h3>
              <p className="text-xs text-paper/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-paper/10 py-24 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] font-bold text-accent tracking-widest uppercase mb-4">How It Works</div>
          <h2 className="font-syne text-4xl font-extrabold tracking-tight mb-14">Four steps to perfectly shuffled groups.</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            {steps.map(s => (
              <div key={s.num} className="text-center relative z-10">
                <div className="w-14 h-14 rounded-full border-2 border-accent bg-accent/10 flex items-center justify-center font-syne font-extrabold text-accent text-lg mx-auto mb-6">{s.num}</div>
                <h4 className="font-syne font-bold text-base mb-2">{s.title}</h4>
                <p className="text-xs text-paper/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PORTAL DIRECTORY SECTION */}
      <section id="portals" className="border-t border-paper/10 py-24 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] font-bold text-accent tracking-widest uppercase mb-4">Portal Directory</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-syne text-4xl font-extrabold tracking-tight mb-2">Find Your Portal</h2>
              <p className="text-paper/50 text-base max-w-lg">Search all active registration portals. Click one to register for your group — no account needed.</p>
            </div>
            <Link to="/portals" className="btn btn-ghost flex-shrink-0 text-sm px-5 py-2.5">
              View all portals →
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative max-w-lg mb-8">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/30 pointer-events-none">🔍</span>
            <input
              type="text"
              className="w-full bg-paper/6 border border-paper/15 rounded-xl pl-11 pr-4 py-3.5 text-paper placeholder-paper/25 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Search by class name or course code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/30 hover:text-paper/60 transition-colors" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Portal cards */}
          {loadingPortals ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-paper/4 border border-paper/10 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-paper/10 rounded mb-3 w-3/4" />
                  <div className="h-3 bg-paper/8 rounded mb-2 w-full" />
                  <div className="h-3 bg-paper/8 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPortals.length === 0 ? (
            <div className="text-center py-16 border border-paper/10 rounded-2xl">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-syne font-bold text-lg mb-1">{search ? `No portals matching "${search}"` : 'No portals available yet'}</div>
              <div className="text-paper/40 text-sm">{search ? 'Try a different search term' : 'Portals created by instructors will appear here'}</div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredPortals.slice(0, 6).map((portal, idx) => (
                  <Link
                    key={portal.id}
                    to={`/p/${portal.slug}`}
                    className="group block bg-paper/4 border border-paper/12 rounded-2xl overflow-hidden hover:border-paper/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="h-1" style={{ background: portal.isOpen ? (portal.accentColor || '#e85d26') : '#4b5563' }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-syne font-bold text-sm text-paper leading-tight group-hover:text-accent transition-colors truncate">
                          {portal.name}
                        </div>
                        {portal.isOpen ? (
                          <span className="flex-shrink-0 flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Open
                          </span>
                        ) : (
                          <span className="flex-shrink-0 flex items-center gap-1 bg-paper/8 text-paper/30 border border-paper/12 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-paper/30" />Closed
                          </span>
                        )}
                      </div>
                      {portal.description && (
                        <p className="text-paper/40 text-xs leading-relaxed mb-3 line-clamp-2">{portal.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-paper/25 pt-3 border-t border-paper/8">
                        <span>👥 {portal.studentCount || 0} registered</span>
                        <span>🎲 {portal.groupSize || 4}/group</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredPortals.length > 6 && (
                <div className="text-center">
                  <Link to={`/portals${search ? `?q=${encodeURIComponent(search)}` : ''}`} className="btn btn-ghost px-6 py-2.5 text-sm">
                    View all {filteredPortals.length} portals →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="px-8 md:px-16 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-accent via-[#c94d1e] to-[#9b3a15] p-16 text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/8" />
            <h2 className="font-syne text-4xl font-extrabold tracking-tight mb-4 relative z-10">Free forever for educators.</h2>
            <p className="text-white/80 mb-10 relative z-10">No credit card required. Unlimited portals, unlimited students, unlimited groups.</p>
            <Link
              to="/login"
              className="relative z-10 inline-flex items-center gap-2 bg-paper text-ink font-semibold px-8 py-4 rounded-xl hover:bg-white hover:-translate-y-0.5 transition-all shadow-xl"
            >
              Create Your Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-paper/10 px-8 md:px-16 py-8 flex flex-wrap justify-between items-center gap-4 text-xs text-paper/30">
        <div className="font-syne font-extrabold text-base">Group<span className="text-accent">ify</span></div>
        <div>© 2025 Groupify. Built for educators everywhere.</div>
        <div className="flex gap-5">
          <span className="hover:text-paper/60 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-paper/60 cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-paper/60 cursor-pointer transition-colors">Contact</span>
        </div>
      </footer>
    </div>
  );
}

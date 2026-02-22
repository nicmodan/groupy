import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPortalBySlug, registerStudent } from '../utils/portalService';

export default function PortalView() {
  const { slug } = useParams();
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', studentId: '', phone: '' });
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getPortalBySlug(slug).then(p => {
      setPortal(p);
      setLoading(false);
    });
  }, [slug]);

  function setField(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await registerStudent(portal.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        studentId: form.studentId.trim(),
        phone: form.phone.trim(),
        answers,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-paper/40 animate-pulse font-syne text-lg">Loading portal…</div>
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-syne text-xl font-bold mb-2">Portal Not Found</h2>
          <p className="text-muted text-sm">This portal link is invalid or has been removed.</p>
        </div>
      </div>
    );
  }

  const overlayOpacity = (portal.overlayOpacity ?? 40) / 100;
  const accentColor = portal.accentColor || '#e85d26';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: portal.bgImageUrl ? `url(${portal.bgImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: portal.bgImageUrl ? undefined : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {portal.bgImageUrl && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
      )}

      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl p-10 w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎓</div>
          <h1 className="font-syne text-2xl font-extrabold text-ink mb-2">{portal.name}</h1>
          {portal.description && (
            <p className="text-muted text-sm leading-relaxed">{portal.description}</p>
          )}
        </div>

        {/* CLOSED */}
        {!portal.isOpen ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-syne text-xl font-bold mb-3">Registration Closed</h2>
            <p className="text-muted text-sm leading-relaxed">
              {portal.closedMessage || 'Registration is now closed. Please contact your instructor.'}
            </p>
          </div>
        ) : submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-syne text-xl font-bold mb-2">You're Registered!</h2>
            <p className="text-muted text-sm">Your registration has been recorded. Your instructor will announce group assignments soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Full Name *</label>
              <input className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent2 focus:ring-2 focus:ring-accent2/20 transition-all" placeholder="e.g. John Doe" value={form.name} onChange={setField('name')} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email Address *</label>
              <input type="email" className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent2 focus:ring-2 focus:ring-accent2/20 transition-all" placeholder="yourname@university.edu" value={form.email} onChange={setField('email')} required />
            </div>
            {portal.requireStudentId !== false && (
              <div>
                <label className="block text-sm font-semibold mb-1.5">Student ID / Matric Number *</label>
                <input className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent2 focus:ring-2 focus:ring-accent2/20 transition-all" placeholder="e.g. 20/CSC/001" value={form.studentId} onChange={setField('studentId')} required />
              </div>
            )}
            {portal.requirePhone && (
              <div>
                <label className="block text-sm font-semibold mb-1.5">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent2 transition-all" placeholder="+234 800 000 0000" value={form.phone} onChange={setField('phone')} />
              </div>
            )}

            {/* Questions */}
            {portal.questions?.length > 0 && (
              <>
                <hr className="border-border my-2" />
                <div className="font-syne font-bold text-sm mb-1">Survey Questions</div>
                {portal.questions.map((q, idx) => (
                  <div key={q.id} className="bg-cream rounded-xl p-4">
                    <div className="font-semibold text-sm mb-3">
                      Q{idx + 1}: {q.text}
                      {!q.required && <span className="text-muted font-normal text-xs ml-2">(optional)</span>}
                    </div>
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className="flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-2.5 cursor-pointer hover:border-accent2 hover:bg-blue-50/50 transition-all text-sm">
                          <input
                            type={q.type === 'multi' ? 'checkbox' : 'radio'}
                            name={`q_${q.id}`}
                            value={opt}
                            className="accent-accent2 w-4 h-4"
                            onChange={() => {
                              if (q.type === 'multi') {
                                setAnswers(a => {
                                  const cur = a[q.id] ? a[q.id].split(',') : [];
                                  const has = cur.includes(opt);
                                  const next = has ? cur.filter(x => x !== opt) : [...cur, opt];
                                  return { ...a, [q.id]: next.join(',') };
                                });
                              } else {
                                setAnswers(a => ({ ...a, [q.id]: opt }));
                              }
                            }}
                            checked={q.type === 'multi'
                              ? (answers[q.id] || '').split(',').includes(opt)
                              : answers[q.id] === opt
                            }
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: accentColor }}
            >
              {submitting ? 'Registering…' : 'Register for Groups →'}
            </button>
            <p className="text-center text-xs text-muted">
              Your data is securely stored and only used for group assignment purposes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

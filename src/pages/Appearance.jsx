import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, updatePortal, uploadPortalBackground, removePortalBackground } from '../utils/portalService';
import Toast, { showToast } from '../components/Toast';

export default function Appearance() {
  const { portalId } = useParams();
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activeId, setActiveId] = useState(portalId || '');
  const [bgPreview, setBgPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    accentColor: '#e85d26', titleColor: '#0a0a14', overlayOpacity: 40,
  });

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      const target = ps.find(p => p.id === activeId) || ps[0];
      if (target) {
        setActiveId(target.id);
        setBgPreview(target.bgImageUrl || null);
        setSettings({
          accentColor: target.accentColor || '#e85d26',
          titleColor: target.titleColor || '#0a0a14',
          overlayOpacity: target.overlayOpacity ?? 40,
        });
      }
    });
  }, [user]);

  const activePortal = portals.find(p => p.id === activeId);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !activeId) return;
    setUploading(true);
    try {
      // Local preview first
      const localUrl = URL.createObjectURL(file);
      setBgPreview(localUrl);
      // Upload to Firebase Storage
      const url = await uploadPortalBackground(activeId, file);
      setBgPreview(url);
      showToast('Background uploaded! 🎨', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setUploading(false);
  }

  async function handleRemoveImage() {
    if (!activeId) return;
    await removePortalBackground(activeId);
    setBgPreview(null);
    showToast('Background removed', 'info');
  }

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      await updatePortal(activeId, settings);
      showToast('Appearance saved! ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Portal Appearance</div>
        <div className="flex gap-3">
          {portals.length > 1 && (
            <select className="input-field w-52" value={activeId} onChange={e => setActiveId(e.target.value)}>
              {portals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <a href={`/p/${activePortal?.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline">👁 Preview</a>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="px-8 py-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Background Image */}
          <div className="card">
            <h3 className="font-syne font-bold mb-1">Background Image</h3>
            <p className="text-xs text-muted mb-5">Shown behind the student registration form</p>

            {!bgPreview ? (
              <label className="block border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent2 hover:bg-blue-50/50 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="text-4xl mb-3">🖼️</div>
                <div className="font-semibold text-sm mb-1">{uploading ? 'Uploading…' : 'Click to upload image'}</div>
                <div className="text-xs text-muted">PNG, JPG, WebP — max 5MB · Recommended: 1920×1080</div>
              </label>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={bgPreview} alt="Background" className="w-full h-44 object-cover" />
                <div className="px-4 py-3 flex justify-between items-center bg-cream">
                  <span className="text-xs text-muted">Background image set</span>
                  <div className="flex gap-2">
                    <label className="btn btn-outline px-3 py-1.5 text-xs cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      Change
                    </label>
                    <button className="btn btn-danger px-3 py-1.5 text-xs" onClick={handleRemoveImage}>Remove</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="card space-y-5">
            <h3 className="font-syne font-bold">Color & Branding</h3>
            {[
              { key: 'accentColor', label: 'Accent / Button Color' },
              { key: 'titleColor', label: 'Portal Title Color' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2">{label}</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings[key]}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    className="w-12 h-10 rounded-lg p-1 border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings[key]}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    className="input-field flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Background Overlay Opacity: <strong>{settings.overlayOpacity}%</strong>
              </label>
              <input
                type="range" min={0} max={90} step={5}
                value={settings.overlayOpacity}
                onChange={e => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) }))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0% (full image visible)</span>
                <span>90% (mostly solid)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="card">
          <h3 className="font-syne font-bold mb-1">Live Preview</h3>
          <p className="text-xs text-muted mb-5">How students will see your portal</p>
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <div
              className="relative flex flex-col items-center justify-center py-10 px-6 min-h-[140px]"
              style={{
                backgroundImage: bgPreview ? `url(${bgPreview})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                background: bgPreview ? undefined : 'linear-gradient(135deg, #1a1a2e, #16213e)',
              }}
            >
              {bgPreview && (
                <div
                  className="absolute inset-0"
                  style={{ background: `rgba(0,0,0,${settings.overlayOpacity / 100})` }}
                />
              )}
              <div className="relative z-10 text-center">
                <div
                  className="font-syne text-xl font-extrabold mb-1"
                  style={{ color: settings.titleColor === '#0a0a14' ? '#fff' : settings.titleColor }}
                >
                  {activePortal?.name || 'CSC 301 Lab Groups'}
                </div>
                <div className="text-sm text-white/60">Register below for your group assignment</div>
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="text-sm font-semibold mb-3">Your Details</div>
              <div className="space-y-2">
                {['Full Name', 'Email Address', 'Student ID'].map(f => (
                  <div key={f} className="h-9 bg-cream rounded-lg border border-border flex items-center px-3 text-xs text-muted">{f}</div>
                ))}
                <button
                  className="w-full py-2.5 rounded-lg text-white text-sm font-semibold mt-1 transition-opacity"
                  style={{ background: settings.accentColor }}
                >
                  Register for Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPortals, updatePortal } from '../utils/portalService';
import Modal from '../components/Modal';
import Toast, { showToast } from '../components/Toast';
import { nanoid } from '../utils/nanoid';

export default function Questions() {
  const { portalId } = useParams();
  const { user } = useAuth();
  const [portals, setPortals] = useState([]);
  const [activeId, setActiveId] = useState(portalId || '');
  const [questions, setQuestions] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [form, setForm] = useState({ text: '', type: 'single', options: ['', ''], required: true });

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPortals(user.uid, (ps) => {
      setPortals(ps);
      const target = ps.find(p => p.id === activeId) || ps[0];
      if (target) {
        setActiveId(target.id);
        setQuestions(target.questions || []);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    const p = portals.find(x => x.id === activeId);
    if (p) setQuestions(p.questions || []);
  }, [activeId, portals]);

  function openAdd() {
    setEditQuestion(null);
    setForm({ text: '', type: 'single', options: ['', ''], required: true });
    setAddModal(true);
  }

  function openEdit(q) {
    setEditQuestion(q);
    setForm({ text: q.text, type: q.type, options: [...q.options], required: q.required });
    setAddModal(true);
  }

  async function saveQuestion() {
    if (!form.text.trim() || form.options.filter(o => o.trim()).length < 2) {
      showToast('Please fill in the question and at least 2 options', 'error');
      return;
    }
    const cleanOptions = form.options.filter(o => o.trim());
    let updated;
    if (editQuestion) {
      updated = questions.map(q => q.id === editQuestion.id
        ? { ...q, text: form.text, type: form.type, options: cleanOptions, required: form.required }
        : q
      );
    } else {
      updated = [...questions, { id: nanoid(), text: form.text, type: form.type, options: cleanOptions, required: form.required }];
    }
    await updatePortal(activeId, { questions: updated });
    setQuestions(updated);
    setAddModal(false);
    showToast(editQuestion ? 'Question updated! ✅' : 'Question added! ✅', 'success');
  }

  async function deleteQuestion(id) {
    const updated = questions.filter(q => q.id !== id);
    await updatePortal(activeId, { questions: updated });
    setQuestions(updated);
    showToast('Question deleted', 'info');
  }

  function setOption(idx, val) {
    setForm(f => { const opts = [...f.options]; opts[idx] = val; return { ...f, options: opts }; });
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-paper sticky top-0 z-10 flex-wrap gap-3">
        <div className="font-syne text-xl font-bold">Custom Questions</div>
        <div className="flex gap-3">
          {portals.length > 1 && (
            <select className="input-field w-52" value={activeId} onChange={e => setActiveId(e.target.value)}>
              {portals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Question</button>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-xl mb-6">
          Questions are shown to students during registration. Answers are included in your Excel export.
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">❓</div>
            <h3 className="font-syne text-xl font-bold mb-2">No questions yet</h3>
            <p className="text-muted text-sm mb-6">Add questions to collect info from students during registration.</p>
            <button className="btn btn-primary px-7 py-3" onClick={openAdd}>Add First Question</button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="card">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-sm mb-1">Q{idx + 1}: {q.text}</div>
                    <div className="text-xs text-muted mb-3">
                      {q.type === 'single' ? 'Multiple Choice (Single)' : 'Multiple Choice (Multi)'} ·{' '}
                      {q.required ? 'Required' : 'Optional'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => (
                        <span key={opt} className="inline-flex items-center bg-cream border border-border rounded-full px-3 py-1 text-xs font-medium">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="btn btn-outline px-3 py-1.5 text-xs" onClick={() => openEdit(q)}>Edit</button>
                    <button className="btn btn-danger px-3 py-1.5 text-xs" onClick={() => deleteQuestion(q.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title={editQuestion ? 'Edit Question' : 'Add Question'}
        subtitle="Students will answer this when registering"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveQuestion}>
              {editQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Question Text *</label>
            <input className="input-field" placeholder="e.g. What is your skill level?" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Question Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="single">Multiple Choice (Single answer)</option>
              <option value="multi">Multiple Choice (Multiple answers)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Answer Options</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => setOption(i, e.target.value)}
                  />
                  {form.options.length > 2 && (
                    <button
                      className="btn btn-danger px-3 py-2 text-sm"
                      onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="btn btn-outline text-sm mt-2"
              onClick={() => setForm(f => ({ ...f, options: [...f.options, ''] }))}
            >+ Add Option</button>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-semibold">Required</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="sr-only" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </Modal>

      <Toast />
    </div>
  );
}

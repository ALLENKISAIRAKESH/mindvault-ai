import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Database,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'preference', label: 'Preference', emoji: '⚙️' },
  { value: 'goal', label: 'Goal', emoji: '🎯' },
  { value: 'project', label: 'Project', emoji: '📁' },
  { value: 'habit', label: 'Habit', emoji: '🔄' },
  { value: 'decision', label: 'Decision', emoji: '🔀' },
  { value: 'personal_context', label: 'Personal Context', emoji: '👤' },
];

export default function Memory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMemory, setNewMemory] = useState({ text: '', category: 'preference', importance: 'medium' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    try {
      const res = await api.getMemories();
      setMemories(res.memories || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newMemory.text.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res = await api.createMemory(newMemory);
      setMemories((prev) => [res.memory, ...prev]);
      setNewMemory({ text: '', category: 'preference', importance: 'medium' });
      setShowAdd(false);
    } catch (err) {
      setError(err.message || 'Failed to create memory');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(memory) {
    try {
      const res = await api.updateMemory(memory.id, { active: !memory.active });
      setMemories((prev) => prev.map((m) => (m.id === memory.id ? res.memory : m)));
    } catch (err) {
      setError('Failed to update memory');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this memory permanently?')) return;
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError('Failed to delete memory');
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading memories..." />;

  const activeCount = memories.filter((m) => m.active).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-white)' }}>AI Memory</h1>
          <p className="text-sm" style={{ color: 'var(--color-soft)' }}>
            What MindVault remembers about you · {activeCount} active
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancel' : 'Add Memory'}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass rounded-2xl p-5 space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-soft)' }}>
              What should MindVault remember?
            </label>
            <textarea
              value={newMemory.text}
              onChange={(e) => setNewMemory((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="e.g., I'm working on a machine learning project for my thesis..."
              className="input-field resize-none"
              rows={3}
              maxLength={2000}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-soft)' }}>Category</label>
              <select
                value={newMemory.category}
                onChange={(e) => setNewMemory((prev) => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-soft)' }}>Importance</label>
              <select
                value={newMemory.importance}
                onChange={(e) => setNewMemory((prev) => ({ ...prev, importance: e.target.value }))}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={saving || !newMemory.text.trim()} className="btn-primary">
            {saving ? 'Saving...' : 'Save Memory'}
          </button>
        </form>
      )}

      {/* Memory List */}
      {memories.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No memories yet"
          description="Add memories to help MindVault AI personalize your conversations. Your AI will use these to provide more relevant responses."
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <Plus size={16} /> Add Your First Memory
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {memories.map((memory, i) => (
            <div
              key={memory.id}
              className={`glass rounded-xl p-4 transition-all duration-200 animate-slide-in ${!memory.active ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm">{CATEGORIES.find((c) => c.value === memory.category)?.emoji || '📝'}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface)', color: 'var(--color-soft)' }}>
                      {CATEGORIES.find((c) => c.value === memory.category)?.label || memory.category}
                    </span>
                    <span className={`badge text-[10px] ${
                      memory.importance === 'high' ? 'badge-danger' :
                      memory.importance === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {memory.importance}
                    </span>
                    {!memory.active && <span className="badge badge-danger text-[10px]">Inactive</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{memory.text}</p>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-muted)' }}>
                    Added {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(memory)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: memory.active ? 'var(--color-accent-5)' : 'var(--color-muted)' }}
                    title={memory.active ? 'Deactivate' : 'Activate'}
                  >
                    {memory.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

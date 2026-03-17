import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';

const PRIORITIES = ['all', 'high', 'medium', 'low'];
const SOURCES   = ['all', 'manual', 'ai', 'telegram'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ priority: 'all', source: 'all', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', time: '', date: '', priority: 'medium' });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadTasks = async () => {
    setLoading(true);
    try { const r = await api.get('/tasks'); setTasks(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const res = await api.post('/tasks', { ...form, source: 'manual' });
      setTasks(prev => [res.data, ...prev]);
      setForm({ title: '', description: '', time: '', date: '', priority: 'medium' });
      setShowForm(false);
      showToast('Task created ✅');
    } catch { showToast('Error creating task'); }
  };

  const handleComplete = async (id, completed) => {
    try {
      const res = await api.put(`/tasks/${id}`, { completed });
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
      showToast(completed ? 'Marked complete ✓' : 'Reopened');
    } catch { showToast('Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted');
    } catch { showToast('Error'); }
  };

  const visible = tasks.filter(t => {
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
    if (filter.source   !== 'all' && t.source   !== filter.source)   return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const done  = tasks.filter(t => t.completed).length;
  const total = tasks.length;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{done}/{total} completed</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.97] transition-all"
        >
          <span className="material-symbols-outlined text-xl">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
          style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
        />
      </div>

      {/* Add task form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl border border-primary/30 bg-white dark:bg-slate-900 shadow-md flex flex-col gap-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              className="col-span-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Task title *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <input
              className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Time (e.g. 3:00 PM)"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
            <textarea
              rows={2}
              className="col-span-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <select
              className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
              Create Task
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search tasks…"
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select
          className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={filter.priority}
          onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
        <select
          className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={filter.source}
          onChange={e => setFilter(f => ({ ...f, source: e.target.value }))}
        >
          {SOURCES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <button onClick={loadTasks} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-medium hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-3xl mr-2">autorenew</span>
          Loading tasks…
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-3">task_alt</span>
          <p className="font-medium">{tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filter'}</p>
          <p className="text-xs mt-1">{tasks.length === 0 ? 'Create one above ↑' : 'Try changing the filter'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((task, idx) => (
            <TaskCard key={task._id||idx} task={task} onComplete={handleComplete} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl">
            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            <p className="text-sm font-bold">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

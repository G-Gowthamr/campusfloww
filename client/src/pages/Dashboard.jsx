import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import TimelineItem from '../components/TimelineItem';

function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-bounce-short">
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-white/10">
        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
        <p className="text-sm font-bold">{message}</p>
        <button onClick={onDismiss} className="ml-3 text-xs opacity-70 hover:underline font-bold">Dismiss</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [conflicts, setConflicts] = useState(0);
  const [suggestion, setSuggestion] = useState(
    "Based on your recent energy levels, I've moved your Deep Work session to 4 PM. You usually finish tasks 15% faster then."
  );
  const [timeline, setTimeline] = useState([
    { id: '1', title: 'Lunch Break',                      time: '12:00 PM – 1:00 PM',  status: 'current'  },
    { id: '2', title: 'Advanced Algorithms Lab',          time: '2:00 PM – 3:30 PM',   status: 'upcoming' },
    { id: '3', title: 'Meeting with Dean (Conflict)',     time: '2:30 PM – 3:00 PM',   status: 'conflict' },
  ]);
  const [telegramSync, setTelegramSync] = useState({
    lastMessage: '"Add task tomorrow at 5 PM"', timeAgo: '2m ago',
  });
  const [toast, setToast] = useState(null);
  const [dbStatus, setDbStatus] = useState('checking');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const applyResponse = useCallback((data) => {
    if (data.tasks?.length)   setTasks(data.tasks);
    if (data.conflicts !== undefined) setConflicts(Array.isArray(data.conflicts) ? data.conflicts.length : Number(data.conflicts));
    if (data.suggestion)      setSuggestion(data.suggestion);
    if (data.timeline?.length) setTimeline(data.timeline);
    if (data.telegramSync)    setTelegramSync(data.telegramSync);
  }, []);

  useEffect(() => {
    (async () => {
      try { const h = await api.get('/health'); setDbStatus(h.data.db); } catch { setDbStatus('disconnected'); }
      try {
        const r = await api.get('/tasks');
        if (r.data.length) { setTasks(r.data); setConflicts(r.data.filter(t => t.isConflict).length); }
      } catch (e) { console.warn('Could not load tasks:', e.message); }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/schedule', { message: input, chatId: 'UI_USER' });
      applyResponse(res.data);
      try { const fresh = await api.get('/tasks'); if (fresh.data.length) setTasks(fresh.data); } catch {}
      showToast('✅ Event scheduled successfully');
      setInput('');
    } catch { showToast('⚠️ Error — check that backend is running on :5000'); }
    finally { setLoading(false); }
  };

  const handleComplete = async (id, completed) => {
    try {
      const res = await api.put(`/tasks/${id}`, { completed });
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
      showToast(completed ? 'Task marked complete ✓' : 'Task reopened');
    } catch { showToast('Error updating task'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted');
    } catch { showToast('Error deleting task'); }
  };

  const handleAutoFix = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auto-fix');
      applyResponse(res.data);
      setConflicts(0);
      showToast('✅ Schedule conflicts resolved');
    } catch { showToast('Auto-fix error'); }
    finally { setLoading(false); }
  };

  const handlePlanDay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/plan-day');
      applyResponse(res.data);
      showToast('📅 Your day has been planned');
    } catch { showToast('Plan-day error'); }
    finally { setLoading(false); }
  };

  const handleRefreshSync = async () => {
    try {
      const res = await api.get('/tasks?source=telegram');
      if (res.data.length) setTelegramSync({ lastMessage: `"${res.data[0].title}"`, timeAgo: 'Just now' });
      else showToast('No Telegram messages yet');
    } catch { showToast('Refresh failed'); }
  };

  const conflictCount = tasks.filter(t => t.isConflict).length || conflicts;

  return (
    <div className="flex h-full">
      {/* Telegram sidebar panel */}
      <div className="hidden xl:flex w-64 flex-col border-r border-slate-200 dark:border-primary/10 p-5 gap-5 bg-background-light dark:bg-background-dark">
        {/* AI Command */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">terminal</span>
            <h3 className="font-bold text-sm">AI Command Bar</h3>
          </div>
          <textarea
            rows={3}
            className="w-full rounded-xl bg-slate-100 dark:bg-primary/10 p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-slate-400"
            placeholder='"Meeting tomorrow at 5 PM"'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="w-full py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Scheduling…' : 'Schedule →'}
          </button>
        </div>

        {/* Telegram Sync */}
        <div className="flex flex-col gap-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500 text-lg">send</span>
              <span className="text-sm font-bold">Telegram Sync</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 text-[11px] border border-slate-200 dark:border-slate-700">
            <p className="text-sky-500 font-bold mb-1 tracking-wider text-[9px] uppercase">Last · {telegramSync.timeAgo}</p>
            <p className="italic text-slate-600 dark:text-slate-300">{telegramSync.lastMessage}</p>
          </div>
          <div className="flex flex-col gap-1">
            {['"Add task tomorrow at 5 PM"', '"Show my tasks"', '"What\'s next?"'].map(cmd => (
              <div key={cmd} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <code className="text-slate-600 dark:text-slate-300">{cmd}</code>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-sky-500 font-semibold">Connected</span>
            <button onClick={handleRefreshSync} className="text-slate-400 hover:text-primary transition-colors">Refresh</button>
          </div>
        </div>

        {/* DB badge */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl ${
          dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          MongoDB {dbStatus}
        </div>

        <div className="mt-auto">
          <button
            onClick={handlePlanDay}
            disabled={loading}
            className="w-full py-3 bg-primary rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all shadow-lg shadow-primary/25 text-sm"
          >
            <span className="material-symbols-outlined text-xl">bolt</span>
            Plan My Day
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight">Morning, Alex 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {conflictCount > 0
                ? <><span className="text-red-500 font-bold">{conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span> detected in your schedule.</>
                : <>Your schedule looks <span className="text-emerald-500 font-bold">conflict-free</span> today.</>}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-primary/10 font-bold text-sm hover:bg-slate-300 dark:hover:bg-primary/20 transition-colors">Review Changes</button>
            <button onClick={handleAutoFix} disabled={loading} className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] disabled:opacity-60 transition-all">
              Auto-Fix Schedule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon:'schedule',  color:'text-primary',   title:'Focus Window',     val:'4 – 6 PM',              sub:'Predicted peak productivity',  subC:'text-emerald-500' },
            { icon:'warning',   color:'text-amber-500', title:'Conflicts',         val:`${conflictCount} Event${conflictCount!==1?'s':''}`, sub: conflictCount>0?'Click Auto-Fix to resolve':'All clear!', subC: conflictCount>0?'text-amber-500':'text-emerald-500' },
            { icon:'smart_toy', color:'text-purple-500',title:'AI Tasks',          val:`${tasks.filter(t=>t.source==='ai').length} Pending`, sub:'Suggested by AI + Telegram', bg:'psychology' },
          ].map(s => (
            <div key={s.title} className="p-5 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
              {s.bg && <div className="absolute top-0 right-0 p-3 opacity-[0.07]"><span className="material-symbols-outlined text-7xl">{s.bg}</span></div>}
              <div className="flex items-center gap-3 mb-3"><span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span><h3 className="font-bold text-sm">{s.title}</h3></div>
              <p className="text-2xl font-black mb-1">{s.val}</p>
              <p className={`text-xs font-medium ${s.subC||'text-slate-500'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Tasks */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Upcoming Tasks</h2>
              <span className="text-xs text-slate-400">{tasks.filter(t=>!t.completed).length} active</span>
            </div>
            <div className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">task_alt</span>
                  <p className="text-sm font-medium">No tasks yet</p>
                  <p className="text-xs mt-1">Type a command in the left panel or go to Tasks</p>
                </div>
              ) : tasks.map((task, idx) => (
                <TaskCard key={task._id||idx} task={task} onComplete={handleComplete} onDelete={handleDelete} />
              ))}
            </div>
          </div>

          {/* Intelligence feed */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Intelligence Feed</h2>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined">auto_fix_high</span>
                <h3 className="font-bold">Next Smart Move</h3>
              </div>
              <p className="text-sm leading-relaxed mb-5 opacity-90">"{suggestion}"</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors">Undo</button>
                <button className="flex-1 py-2 bg-white text-primary rounded-xl text-sm font-bold hover:shadow-lg transition-colors">Keep It</button>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="font-bold mb-4 text-sm">Today's Timeline</h3>
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-5">
                {timeline.map((item, idx) => <TimelineItem key={item.id||idx} item={item} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

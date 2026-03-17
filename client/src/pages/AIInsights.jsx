import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TIPS = [
  { icon: 'schedule',    color: 'text-primary',    bg: 'bg-primary/10',    title: 'Optimal Focus: 4–6 PM', body: 'Your productivity peaks in the late afternoon. Schedule deep work then.' },
  { icon: 'local_cafe', color: 'text-amber-500',   bg: 'bg-amber-500/10',  title: 'Take a Break', body: "You've been active 3 hours straight. A 15-min break improves output by 23%." },
  { icon: 'bedtime',    color: 'text-purple-500',  bg: 'bg-purple-500/10', title: 'Sleep Hygiene', body: 'You completed tasks 18% faster after 7+ hours of sleep. Keep it up!' },
  { icon: 'directions_run', color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Exercise Boost', body: 'Your gym days correlate with 31% more tasks completed. Great habit!' },
];

export default function AIInsights() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const aiTasks   = tasks.filter(t => t.source === 'ai').length;
  const tgTasks   = tasks.filter(t => t.source === 'telegram').length;
  const conflicts = tasks.filter(t => t.isConflict).length;
  const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentTasks = [...tasks].slice(0, 5);

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your productivity intelligence dashboard</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${rate}%`,   icon: 'percent',       color: 'text-primary',    bar: rate },
          { label: 'AI Suggested',    value: aiTasks,       icon: 'smart_toy',     color: 'text-purple-500', bar: total>0?Math.round(aiTasks/total*100):0 },
          { label: 'Via Telegram',    value: tgTasks,       icon: 'send',          color: 'text-sky-500',     bar: total>0?Math.round(tgTasks/total*100):0 },
          { label: 'Conflicts',       value: conflicts,     icon: 'warning',       color: 'text-red-500',    bar: total>0?Math.round(conflicts/total*100):0 },
        ].map(k => (
          <div key={k.label} className="p-5 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{k.label}</p>
              <span className={`material-symbols-outlined text-xl ${k.color}`}>{k.icon}</span>
            </div>
            <p className="text-3xl font-black">{k.value}</p>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700" style={{ width: `${k.bar}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: AI tips */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <h2 className="text-xl font-bold">AI Recommendations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIPS.map((tip, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3 hover:border-primary/40 transition-all`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tip.bg}`}>
                  <span className={`material-symbols-outlined ${tip.color}`}>{tip.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{tip.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly focus chart (visual only) */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="font-bold text-sm mb-4">Weekly Productivity Score</h3>
            <div className="flex items-end gap-2 h-32">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                const heights = [60, 85, 45, 95, 70, 30, 50];
                const isToday = i === (new Date().getDay() + 6) % 7;
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                      style={{ height: `${heights[i]}%` }}
                    />
                    <p className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-slate-400'}`}>{d}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: recent tasks + source breakdown */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>

          {/* Source pie summary */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="font-bold text-sm mb-4">Task Sources</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Manual',   count: tasks.filter(t=>t.source==='manual').length,   color: 'bg-primary',     icon: 'edit' },
                { label: 'AI',       count: aiTasks,                                        color: 'bg-purple-500',  icon: 'smart_toy' },
                { label: 'Telegram', count: tgTasks,                                        color: 'bg-sky-500',     icon: 'send' },
              ].map(s => {
                const pct = total > 0 ? Math.round((s.count/total)*100) : 0;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${s.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-symbols-outlined text-sm ${s.color.replace('bg-','text-')}`}>{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold">{s.label}</p>
                        <p className="text-xs text-slate-500">{s.count} ({pct}%)</p>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${s.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent tasks list */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="font-bold text-sm mb-4">Last 5 Tasks</h3>
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading…</p>
            ) : recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No tasks yet — add some from Dashboard</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTasks.map((t, idx) => (
                  <div key={t._id||idx} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${t.completed ? 'bg-emerald-500' : t.isConflict ? 'bg-red-500' : 'bg-primary'}`} />
                    <p className={`text-sm font-medium flex-1 truncate ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{t.source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Move card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined">psychology</span>
              <h3 className="font-bold">Focus Prediction</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Based on your patterns, your peak productivity window today is <strong>4:00 – 6:00 PM</strong>.
              Schedule your most important task then for best results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

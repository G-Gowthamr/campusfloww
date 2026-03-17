import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM – 8 PM
const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLORS = {
  manual: 'bg-primary/20 border-primary/50 text-primary',
  ai:     'bg-purple-500/20 border-purple-500/50 text-purple-400',
  telegram: 'bg-sky-500/20 border-sky-500/50 text-sky-400',
};

const EVENT_BG = [
  { title: 'Algorithms Lab',    day: 1, start: 9,  dur: 1.5, color: 'bg-primary/20 border-primary/50 text-primary' },
  { title: 'Lunch',             day: 1, start: 12, dur: 1,   color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
  { title: 'Meeting with Dean', day: 2, start: 14, dur: 0.5, color: 'bg-red-500/20 border-red-500/50 text-red-400' },
  { title: 'Gym Session',       day: 3, start: 7,  dur: 1,   color: 'bg-amber-500/20 border-amber-500/50 text-amber-400' },
  { title: 'Deep Work Block',   day: 4, start: 16, dur: 2,   color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
];

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('week'); // week | list

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
  }, []);

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 gap-1">
            {['week', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all capitalize ${
                  view === v ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">
            <span className="material-symbols-outlined text-xl">add</span>
            Event
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 overflow-auto">
          {/* Day headers */}
          <div className="grid border-b border-slate-200 dark:border-slate-800" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div className="p-3" />
            {weekDates.map((d, i) => (
              <div key={i} className={`p-3 text-center border-l border-slate-100 dark:border-slate-800 ${isToday(d) ? 'bg-primary/5' : ''}`}>
                <p className="text-xs font-medium text-slate-500">{DAYS[i]}</p>
                <p className={`text-lg font-black mt-0.5 ${isToday(d) ? 'text-primary' : ''}`}>{d.getDate()}</p>
                {isToday(d) && <div className="h-1 w-1 rounded-full bg-primary mx-auto mt-1" />}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative" style={{ minHeight: `${HOURS.length * 60}px` }}>
            {HOURS.map(h => (
              <div key={h} className="grid border-b border-slate-100 dark:border-slate-800/60" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', height: '60px' }}>
                <div className="px-3 pt-1 text-[10px] text-slate-400 font-medium flex-shrink-0">
                  {h === 12 ? '12 PM' : h > 12 ? `${h-12} PM` : `${h} AM`}
                </div>
                {weekDates.map((_, di) => (
                  <div key={di} className={`border-l border-slate-100 dark:border-slate-800/60 relative ${isToday(weekDates[di]) ? 'bg-primary/[0.02]' : ''}`} />
                ))}
              </div>
            ))}

            {/* Static events */}
            {EVENT_BG.map((ev, idx) => {
              const topOffset = (ev.start - 7) * 60 + 30;
              const height = ev.dur * 60 - 4;
              const leftPercent = (ev.day / 7) * 100;
              return (
                <div
                  key={idx}
                  className={`absolute rounded-xl border px-2 py-1.5 text-xs font-bold cursor-pointer hover:scale-[1.02] transition-all ${ev.color}`}
                  style={{
                    top: `${topOffset}px`, height: `${height}px`,
                    left: `calc(60px + ${leftPercent}%)`,
                    width: `calc(${(1/7)*100}% - 8px)`,
                  }}
                  title={ev.title}
                >
                  <p className="truncate">{ev.title}</p>
                  <p className="opacity-70 text-[10px]">{ev.start > 12 ? `${ev.start-12}:00 PM` : `${ev.start}:00 AM`}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">event_note</span>
              <p className="font-medium">No scheduled events</p>
              <p className="text-xs mt-1">Add tasks from the Dashboard or Tasks page</p>
            </div>
          ) : tasks.map((t, idx) => (
            <div key={t._id||idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/40 transition-all">
              <div className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center ${COLORS[t.source]||COLORS.manual}`}>
                <span className="material-symbols-outlined text-xl">
                  {t.source === 'telegram' ? 'send' : t.source === 'ai' ? 'smart_toy' : 'event'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.time || 'No time set'} · {t.date ? new Date(t.date).toLocaleDateString() : 'No date'}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                t.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                t.priority === 'low' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>{(t.priority||'medium').toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

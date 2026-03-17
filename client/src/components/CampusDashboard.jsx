import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import TaskCard from "./TaskCard";
import TimelineItem from "./TimelineItem";

// ─── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-bounce-short">
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-white/10">
        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
        <p className="text-sm font-bold">{message}</p>
        <button onClick={onDismiss} className="ml-3 text-xs font-bold hover:underline opacity-70">
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CampusDashboard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [conflicts, setConflicts] = useState(0);
  const [suggestion, setSuggestion] = useState(
    "Based on your recent energy levels, I've moved your Deep Work session to 4 PM. You usually finish tasks 15% faster then."
  );
  const [timeline, setTimeline] = useState([
    { id: "1", title: "Lunch Break", time: "12:00 PM – 1:00 PM", status: "current" },
    { id: "2", title: "Advanced Algorithms Lab", time: "2:00 PM – 3:30 PM", status: "upcoming" },
    { id: "3", title: "Meeting with Dean (Conflict)", time: "2:30 PM – 3:00 PM", status: "conflict" },
  ]);
  const [telegramSync, setTelegramSync] = useState({
    lastMessage: '"Add task tomorrow at 5 PM"',
    timeAgo: "2m ago",
  });
  const [toast, setToast] = useState(null);
  const [dbStatus, setDbStatus] = useState("checking");

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Apply n8n/API response to state ─────────────────────────────────────────
  const applyResponse = useCallback((data) => {
    if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
    if (data.conflicts !== undefined) setConflicts(Array.isArray(data.conflicts) ? data.conflicts.length : data.conflicts);
    if (data.suggestion) setSuggestion(data.suggestion);
    if (data.timeline && Array.isArray(data.timeline)) setTimeline(data.timeline);
    if (data.telegramSync) setTelegramSync(data.telegramSync);
  }, []);

  // ── Load tasks from DB on mount ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // health check
        const health = await api.get("/health");
        setDbStatus(health.data.db);
      } catch {
        setDbStatus("disconnected");
      }
      try {
        const res = await api.get("/tasks");
        if (res.data.length > 0) setTasks(res.data);
        const conflictCount = res.data.filter((t) => t.isConflict).length;
        setConflicts(conflictCount);
      } catch (err) {
        console.warn("Could not load tasks from DB:", err.message);
      }
    };
    init();
  }, []);

  // ── Submit command bar ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/schedule", { message: input, chatId: "UI_USER" });
      applyResponse(res.data);
      // Reload tasks fresh from DB and merge
      try {
        const fresh = await api.get("/tasks");
        if (fresh.data.length > 0) setTasks(fresh.data);
      } catch {}
      showToast("✅ Event scheduled successfully");
      setInput("");
    } catch (err) {
      console.error(err);
      showToast("⚠️ Error — check that the backend is running on :5000");
    } finally {
      setLoading(false);
    }
  };

  // ── Complete task ────────────────────────────────────────────────────────────
  const handleComplete = async (id, completed) => {
    try {
      const res = await api.put(`/tasks/${id}`, { completed });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      showToast(completed ? "Task marked complete ✓" : "Task reopened");
    } catch (err) {
      console.error(err);
      showToast("Error updating task");
    }
  };

  // ── Delete task ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast("Task deleted");
    } catch (err) {
      console.error(err);
      showToast("Error deleting task");
    }
  };

  // ── Auto-Fix ─────────────────────────────────────────────────────────────────
  const handleAutoFix = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auto-fix");
      applyResponse(res.data);
      if (res.data.tasks) setTasks(res.data.tasks);
      setConflicts(0);
      showToast("✅ Schedule conflicts resolved");
    } catch (err) {
      console.error(err);
      showToast("Auto-fix error — check backend");
    } finally {
      setLoading(false);
    }
  };

  // ── Plan My Day ───────────────────────────────────────────────────────────────
  const handlePlanDay = async () => {
    setLoading(true);
    try {
      const res = await api.post("/plan-day");
      applyResponse(res.data);
      showToast("📅 Your day has been planned");
    } catch (err) {
      console.error(err);
      showToast("Plan-day error — check backend");
    } finally {
      setLoading(false);
    }
  };

  // ── Refresh Telegram sync ─────────────────────────────────────────────────────
  const handleRefreshSync = async () => {
    try {
      const res = await api.get("/tasks?source=telegram");
      if (res.data.length > 0) {
        const last = res.data[0];
        setTelegramSync({ lastMessage: `"${last.title}"`, timeAgo: "Just now" });
      } else {
        showToast("No Telegram messages yet");
      }
    } catch {
      showToast("Refresh failed");
    }
  };

  const conflictCount = tasks.filter((t) => t.isConflict).length || conflicts;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-primary/20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-3 lg:px-10">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">CampusFlow</h2>
          </div>

          {/* Command bar */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="relative flex items-center flex-1">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">
                {loading ? "autorenew" : "search"}
              </span>
              <input
                className="w-full rounded-xl border-none bg-slate-100 dark:bg-primary/10 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                placeholder='Try: "Meeting tomorrow at 5 PM"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Schedule
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* DB status badge */}
          <div className={`hidden lg:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            dbStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-500"
              : dbStatus === "disconnected"
              ? "bg-red-500/10 text-red-500"
              : "bg-slate-200 dark:bg-slate-700 text-slate-500"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dbStatus === "connected" ? "bg-emerald-500" : dbStatus === "disconnected" ? "bg-red-500" : "bg-slate-400"}`} />
            MongoDB {dbStatus}
          </div>

          <div className="relative group">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-primary/10 hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              {conflictCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            <div className="absolute right-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 p-4 shadow-2xl hidden group-hover:block z-50">
              <h3 className="font-bold mb-3 text-sm">Recent Alerts</h3>
              {conflictCount > 0 ? (
                <div className="flex gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                  <div>
                    <p className="text-xs font-semibold">{conflictCount} conflict{conflictCount > 1 ? "s" : ""} detected</p>
                    <p className="text-[10px] opacity-70">Use Auto-Fix to resolve</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No active alerts</p>
              )}
            </div>
          </div>

          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-primary/10 hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 border-2 border-white dark:border-slate-800 shadow-md" title="User" />
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-slate-200 dark:border-primary/10 p-5 gap-6 overflow-y-auto flex-shrink-0 bg-background-light dark:bg-background-dark">
          <nav className="flex flex-col gap-1.5">
            {[
              { icon: "dashboard", label: "Dashboard", active: true },
              { icon: "calendar_month", label: "Calendar" },
              { icon: "check_circle", label: "Tasks" },
              { icon: "insights", label: "AI Insights" },
            ].map(({ icon, label, active }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "hover:bg-primary/10 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
                {label}
              </a>
            ))}
          </nav>

          {/* Telegram Sync panel */}
          <div className="flex flex-col gap-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-500 text-lg">send</span>
                <span className="text-sm font-bold">Telegram Sync</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 text-[11px] border border-slate-200 dark:border-slate-700">
              <p className="text-sky-500 font-bold mb-1 uppercase tracking-wider text-[9px]">
                Last Message · {telegramSync.timeAgo}
              </p>
              <p className="italic text-slate-600 dark:text-slate-300">{telegramSync.lastMessage}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Try Commands</p>
              {['"Add task tomorrow at 5 PM"', '"Show my tasks"', '"What\'s next?"'].map((cmd) => (
                <div
                  key={cmd}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <code className="text-slate-600 dark:text-slate-300">{cmd}</code>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-500 font-semibold">Connected</span>
              <button onClick={handleRefreshSync} className="text-slate-400 hover:text-primary transition-colors text-xs">
                Refresh
              </button>
            </div>
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
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col gap-6 p-6 lg:p-8 overflow-y-auto">

          {/* Hero row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight">Morning, Alex 👋</h1>
              <p className="text-slate-500 dark:text-slate-400">
                {conflictCount > 0 ? (
                  <>
                    AI found{" "}
                    <span className="text-red-500 font-bold">{conflictCount} conflict{conflictCount > 1 ? "s" : ""}</span>{" "}
                    in your schedule today.
                  </>
                ) : (
                  <>
                    Your schedule looks <span className="text-emerald-500 font-bold">conflict-free</span> today.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-primary/10 font-bold text-sm hover:bg-slate-300 dark:hover:bg-primary/20 transition-colors">
                Review Changes
              </button>
              <button
                onClick={handleAutoFix}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 transition-all"
              >
                Auto-Fix Schedule
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon="schedule"
              iconColor="text-primary"
              title="Focus Window"
              value="4 – 6 PM"
              sub="Predicted peak productivity"
              subColor="text-emerald-500"
            />
            <StatCard
              icon="warning"
              iconColor="text-amber-500"
              title="Calendar Conflicts"
              value={`${conflictCount} Event${conflictCount !== 1 ? "s" : ""}`}
              sub={conflictCount > 0 ? "Use Auto-Fix to resolve" : "All clear!"}
              subColor={conflictCount > 0 ? "text-amber-500" : "text-emerald-500"}
            />
            <StatCard
              icon="smart_toy"
              iconColor="text-purple-500"
              title="AI Tasks"
              value={`${tasks.filter((t) => t.source === "ai").length} Pending`}
              sub="Suggested from Telegram + AI"
              bgIcon="psychology"
            />
          </div>

          {/* Content split */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">

            {/* ─ Task list ─ */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Upcoming Tasks</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Filter:</span>
                  <select className="bg-slate-100 dark:bg-slate-800 border-none text-xs rounded-lg py-1 px-2 focus:ring-1 focus:ring-primary outline-none">
                    <option>All</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>AI</option>
                    <option>Telegram</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">task_alt</span>
                    <p className="text-sm font-medium">No tasks yet</p>
                    <p className="text-xs mt-1">Type a command above to create your first task</p>
                  </div>
                ) : (
                  tasks.map((task, idx) => (
                    <TaskCard
                      key={task._id || idx}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ─ Intelligence feed ─ */}
            <div className="xl:col-span-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold">Intelligence Feed</h2>

              {/* Smart Move card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  <h3 className="font-bold">Next Smart Move</h3>
                </div>
                <p className="text-sm leading-relaxed mb-5 opacity-90">"{suggestion}"</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors">
                    Undo
                  </button>
                  <button className="flex-1 py-2 bg-white text-primary rounded-xl text-sm font-bold transition-colors hover:shadow-lg">
                    Keep It
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900 shadow-sm flex-1">
                <h3 className="font-bold mb-4 text-sm">Today's Timeline</h3>
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-5">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No timeline events yet</p>
                  ) : (
                    timeline.map((item, idx) => (
                      <TimelineItem key={item.id || idx} item={item} isFirst={idx === 0} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

// ─── Stat card sub-component ──────────────────────────────────────────────────
function StatCard({ icon, iconColor, title, value, sub, subColor, bgIcon }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
      {bgIcon && (
        <div className="absolute top-0 right-0 p-3 opacity-[0.07]">
          <span className="material-symbols-outlined text-7xl">{bgIcon}</span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <p className="text-2xl font-black mb-1">{value}</p>
      <p className={`text-xs font-medium ${subColor || "text-slate-500"}`}>{sub}</p>
    </div>
  );
}

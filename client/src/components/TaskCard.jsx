import React from "react";

export default function TaskCard({ task, onComplete, onDelete }) {
  if (task.isConflict) {
    return (
      <div className="group relative p-5 rounded-2xl border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 rounded-md border-2 border-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-base">{task.title}</h4>
              <span className="text-xs text-red-500 font-bold tracking-wide">CONFLICT DETECTED</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-bold">FIX NOW</button>
            {onDelete && (
              <button
                onClick={() => onDelete(task._id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-xs opacity-70 pl-10">{task.conflictText || "Potential schedule overlap detected."}</p>
      </div>
    );
  }

  return (
    <div className={`group relative p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
      task.completed
        ? "border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/30 opacity-60"
        : "border-slate-200 dark:border-primary/10 bg-white dark:bg-slate-900/50 hover:border-primary/40"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onComplete && onComplete(task._id, !task.completed)}
            className={`mt-1 h-5 w-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? "border-primary bg-primary text-white"
                : "border-slate-300 dark:border-slate-600 group-hover:border-primary"
            }`}
          >
            {task.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
          </button>
          <div>
            <h4 className={`font-bold text-base leading-tight ${task.completed ? "line-through text-slate-400" : ""}`}>
              {task.title}
            </h4>
            {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {task.frequency && (
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  task.frequency === "WEEKLY"
                    ? "bg-primary/10 text-primary"
                    : task.frequency === "DAILY"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }`}>
                  <span className="material-symbols-outlined text-[12px]">repeat</span>
                  {task.frequency}
                </span>
              )}
              {task.source === "telegram" && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-500">
                  <span className="material-symbols-outlined text-[12px]">send</span>
                  Telegram Synced
                </span>
              )}
              {task.source === "ai" && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-500">
                  <span className="material-symbols-outlined text-[12px]">smart_toy</span>
                  AI Generated
                </span>
              )}
              {task.source === "n8n" && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500">
                  <span className="material-symbols-outlined text-[12px]">hub</span>
                  Automated Workflow
                </span>
              )}
              {task.time && <span className="text-xs text-slate-400">{task.time}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {onDelete && !task.completed && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          )}
          <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">drag_indicator</span>
        </div>
      </div>
      {task.aiSuggestion && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl ml-9">
          <span className="material-symbols-outlined text-amber-500 text-sm">lightbulb</span>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            AI Suggestion: <strong>{task.aiSuggestion}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function TimelineItem({ item, isFirst }) {
  const dotColor =
    item.status === "current"
      ? "bg-primary"
      : item.status === "conflict"
      ? "bg-red-500"
      : "bg-slate-300 dark:bg-slate-600";

  return (
    <div className="relative">
      <div
        className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-background-light dark:ring-background-dark ${dotColor}`}
      />
      {item.status === "current" && (
        <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Current</p>
      )}
      <h5
        className={`text-sm font-bold leading-tight ${
          item.status === "conflict" ? "text-red-500" : ""
        }`}
      >
        {item.title}
      </h5>
      <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
    </div>
  );
}

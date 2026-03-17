const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    time: { type: String, default: "" },
    date: { type: Date, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    completed: { type: Boolean, default: false },
    frequency: { type: String, default: "" }, // e.g. "DAILY", "WEEKLY"
    aiSuggestion: { type: String, default: "" },
    isConflict: { type: Boolean, default: false },
    conflictText: { type: String, default: "" },
    source: { type: String, enum: ["manual", "telegram", "ai"], default: "manual" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);

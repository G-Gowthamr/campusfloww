const Task = require("../models/Task");

// POST /api/schedule — Simulate AI parsing and resolving conflicts
exports.schedule = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    // 1. Simulate AI parsing the string into a structured task
    const simulatedTaskPayload = {
      title: message,
      time: "5:00 PM",
      date: new Date(),
      priority: "high",
      source: "ai"
    };

    // 2. Save the simulated task to the database
    const savedTask = await Task.create(simulatedTaskPayload);

    // 3. Construct a rich simulated response
    const simulatedResponse = {
      task: savedTask,
      conflicts: [],
      suggestion: "I've scheduled this. You have free time at 4 PM for deep work.",
      timeline: [
        { id: "1", title: "Study", time: "2:00 PM", status: "completed" },
        { id: savedTask._id, title: savedTask.title, time: savedTask.time, status: "upcoming" },
        { id: "2", title: "Meeting", time: "6:00 PM", status: "upcoming" }
      ]
    };

    return res.json(simulatedResponse);
  } catch (err) {
    console.error("[schedule] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/plan-day — Simulate generating a planned schedule
exports.planDay = async (req, res) => {
  try {
    const tasks = await Task.find({ completed: false }).sort({ createdAt: -1 }).limit(5);
    
    return res.json({
      tasks,
      timeline: tasks.map((t, i) => ({
        id: t._id,
        title: t.title,
        time: t.time || `${9 + i}:00 AM`,
        status: i === 0 ? "current" : "upcoming",
      })),
      suggestion: "I've organized your day to maximize focus time in the morning.",
      conflicts: []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auto-fix — Simulate resolving overlapping schedules
exports.autoFix = async (req, res) => {
  try {
    // Clear conflict flags in DB as a simple fix
    await Task.updateMany({ isConflict: true }, { $set: { isConflict: false } });
    const tasks = await Task.find({ completed: false }).sort({ createdAt: -1 }).limit(5);
    
    return res.json({ 
      message: "Conflicts resolved by shifting low-priority tasks.", 
      tasks, 
      conflicts: 0,
      suggestion: "Schedule auto-fixed. 2 tasks were moved."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/telegram — Simulate receiving webhook from Telegram/n8n
exports.telegramWebhook = async (req, res) => {
  const { message, chatId } = req.body;

  try {
    const payload = { 
      title: message || "Telegram task", 
      source: "telegram",
      time: "TBD",
      priority: "medium"
    };

    const saved = await Task.create(payload);
    console.log(`[Telegram Simulator] Saved task: ${saved.title}`);
    
    return res.json({ 
      success: true, 
      task: saved,
      reply: `Got it! I've added "${saved.title}" to CampusFlow.`
    });
  } catch (err) {
    console.error("[Telegram webhook] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/telegram/messages — Return recent Telegram tasks
exports.getTelegramMessages = async (req, res) => {
  try {
    const tasks = await Task.find({ source: "telegram" })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

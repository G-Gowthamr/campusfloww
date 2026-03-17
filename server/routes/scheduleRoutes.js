const express = require("express");
const router = express.Router();
const sc = require("../controllers/scheduleController");

router.post("/schedule", sc.schedule);
router.post("/plan-day", sc.planDay);
router.post("/auto-fix", sc.autoFix);

router.post("/telegram", sc.telegramWebhook);
router.get("/telegram/messages", sc.getTelegramMessages);

module.exports = router;

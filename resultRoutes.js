const express = require("express");
const Result = require("../models/Result");
const Question = require("../models/Question");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { answers = [] } = req.body;
    const ids = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: ids } });
    const byId = new Map(questions.map(q => [String(q._id), q]));
    let score = 0;
    const checked = answers.map(a => {
      const q = byId.get(String(a.questionId));
      const correct = !!q && Number(a.selectedIndex) === q.answerIndex;
      if (correct) score++;
      return { questionId: String(a.questionId), selectedIndex: Number(a.selectedIndex), correct };
    });
    const total = 10;
    if (!total) return res.status(400).json({ message: "No answers submitted." });
    const result = await Result.create({
      student: req.user.id, studentName: req.user.name, enrollment: req.user.enrollment,
      score, total, percentage: Math.round(score / total * 100), answers: checked
    });
    res.status(201).json({ message: "Result saved.", result: { score, total, percentage: result.percentage, createdAt: result.createdAt } });
  } catch { res.status(500).json({ message: "Could not save result." }); }
});
router.get("/mine", auth, async (req, res) => {
  const results = await Result.find({ student: req.user.id }).sort({ createdAt: -1 }).select("-answers");
  res.json(results);
});
router.get("/leaderboard", async (req, res) => {
  const rows = await Result.find().sort({ percentage: -1, score: -1, createdAt: 1 }).limit(20).select("studentName enrollment score total percentage createdAt");
  res.json(rows);
});
module.exports = router;

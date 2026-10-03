const express = require("express");
const Question = require("../models/Question");
const router = express.Router();

const safeQuestion = q => ({ _id: q._id, subject: q.subject, topic: q.topic, text: q.text, options: q.options, explanation: q.explanation });

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.topic) filter.topic = req.query.topic;
  const docs = await Question.find(filter).sort({ createdAt: 1 });
  res.json(docs.map(safeQuestion));
});
router.post("/", async (req, res) => {
  try {
    const { text, options, answerIndex, topic = "WAD", explanation = "" } = req.body;
    if (!text || !Array.isArray(options) || options.length !== 4 || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3)
      return res.status(400).json({ message: "Provide question text, four options, and answerIndex 0–3." });
    const q = await Question.create({ text, options, answerIndex, topic, explanation });
    res.status(201).json({ message: "Question added.", question: safeQuestion(q) });
  } catch { res.status(400).json({ message: "Invalid question data." }); }
});
router.put("/:id", async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ message: "Question not found." });
    res.json({ message: "Question updated.", question: safeQuestion(q) });
  } catch { res.status(400).json({ message: "Could not update question." }); }
});
router.delete("/:id", async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (!q) return res.status(404).json({ message: "Question not found." });
  res.json({ message: "Question deleted." });
});
module.exports = router;

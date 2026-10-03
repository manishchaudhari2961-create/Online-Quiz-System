const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
  subject: { type: String, default: "WAD" },
  topic: { type: String, enum: ["HTML", "CSS", "JavaScript", "WAD"], default: "WAD" },
  text: { type: String, required: true },
  options: { type: [String], required: true, validate: v => v.length === 4 },
  answerIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("Question", questionSchema);

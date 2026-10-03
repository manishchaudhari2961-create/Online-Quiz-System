const mongoose = require("mongoose");
const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: { type: String, required: true },
  enrollment: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [{ questionId: String, selectedIndex: Number, correct: Boolean }]
}, { timestamps: true });
module.exports = mongoose.model("Result", resultSchema);

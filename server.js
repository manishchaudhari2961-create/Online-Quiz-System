require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const Question = require("./models/Question");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/api/health", (req, res) => res.json({ status: "ok", app: "WAD Quiz API" }));
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use((err, req, res, next) => res.status(500).json({ message: "Server error." }));

const seed = async () => {
  if (await Question.countDocuments()) return;
  const rows = [
    ["Which HTML element creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1, "HTML"],
    ["Which tag is used for the largest heading?", ["<h6>", "<head>", "<h1>", "<heading>"], 2, "HTML"],
    ["Which attribute provides alternative text for an image?", ["title", "src", "alt", "name"], 2, "HTML"],
    ["Which CSS property changes text color?", ["font-style", "color", "background", "text-size"], 1, "CSS"],
    ["Which selector targets an element by id?", [".name", "#name", "*name", "name()"], 1, "CSS"],
    ["Which CSS layout is one-dimensional?", ["Grid", "Flexbox", "Table", "Float"], 1, "CSS"],
    ["Which keyword declares a block-scoped variable?", ["varonly", "let", "define", "dim"], 1, "JavaScript"],
    ["Which method selects an element by its id?", ["queryAll()", "getElementById()", "selectId()", "findId()"], 1, "JavaScript"],
    ["What does JSON stand for?", ["Java Source Object Notation", "JavaScript Object Notation", "Joined System Object Names", "Java Standard Output Network"], 1, "WAD"],
    ["Which HTTP method is commonly used to create a resource?", ["GET", "POST", "DELETE", "HEAD"], 1, "WAD"]
  ];
  await Question.insertMany(rows.map(([text, options, answerIndex, topic]) => ({ subject: "WAD", text, options, answerIndex, topic })));
  console.log("Sample WAD questions added");
};

const PORT = process.env.PORT || 5000;
connectDB().then(seed).then(() => app.listen(PORT, () => console.log(`Open http://localhost:${PORT}`)))
  .catch(err => { console.error(err.message); process.exit(1); });

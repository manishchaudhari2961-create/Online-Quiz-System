const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, enrollment, password } = req.body;
    if (!name || !email || !enrollment || !password || password.length < 6)
      return res.status(400).json({ message: "Enter all fields; password must be at least 6 characters." });
    const existing = await Student.findOne({ $or: [{ email: email.toLowerCase() }, { enrollment }] });
    if (existing) return res.status(409).json({ message: "Email or enrollment number already registered." });
    const passwordHash = await bcrypt.hash(password, 10);
    await Student.create({ name, email, enrollment, passwordHash });
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (e) { res.status(500).json({ message: "Could not register student." }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email: String(email || "").toLowerCase() });
    if (!student || !(await bcrypt.compare(password || "", student.passwordHash)))
      return res.status(401).json({ message: "Invalid email or password." });
    const token = jwt.sign({ id: student._id, name: student.name, enrollment: student.enrollment }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, student: { name: student.name, email: student.email, enrollment: student.enrollment } });
  } catch { res.status(500).json({ message: "Login failed." }); }
});
module.exports = router;

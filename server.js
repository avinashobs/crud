#npm install express mongoose bcryptjs jsonwebtoken cors
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/mern_jwt");

// Schemas
const User = mongoose.model("User", new mongoose.Schema({
  email: String, password: String
}));

const Task = mongoose.model("Task", new mongoose.Schema({
  userId: String, title: String
}));

// Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, "secret");
    next();
  } catch { res.status(401).send("Unauthorized"); }
};

// Register
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ email: req.body.email, password: hashed });
  res.json(user);
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(401).send("Invalid");
  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token });
});

// CRUD Tasks
app.post("/tasks", auth, async (req, res) => {
  res.json(await Task.create({ userId: req.user.id, title: req.body.title }));
});

app.get("/tasks", auth, async (req, res) => {
  res.json(await Task.find({ userId: req.user.id }));
});

app.put("/tasks/:id", auth, async (req, res) => {
  res.json(await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { title: req.body.title }, { new: true }
  ));
});

app.delete("/tasks/:id", auth, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("Server running on 5000"));

import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]), [title, setTitle] = useState("");

  async function login() {
    const res = await axios.post(`${API}/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  }

  async function loadTasks() {
    const res = await axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    setTasks(res.data);
  }

  async function addTask() {
    await axios.post(`${API}/tasks`, { title }, { headers: { Authorization: `Bearer ${token}` } });
    loadTasks();
    setTitle("");
  }

  async function delTask(id) {
    await axios.delete(`${API}/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadTasks();
  }

  useEffect(() => { if (token) loadTasks(); }, [token]);

  if (!token) return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={login}>Login</button>
    </div>
  );

  return (
    <div>
      <h2>My Tasks</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New Task" />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map(t => (
          <li key={t._id}>
            {t.title} <button onClick={() => delTask(t._id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

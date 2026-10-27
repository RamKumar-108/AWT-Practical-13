"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Static sample tasks for previewing the dashboard before the backend is configured.
const DEMO_TASKS = [
  { _id: "demo-1", title: "Complete AWT Practical 13", completed: true, demo: true },
  { _id: "demo-2", title: "Design the productivity dashboard", completed: true, demo: true },
  { _id: "demo-3", title: "Connect the MongoDB Atlas database", completed: false, demo: true },
  { _id: "demo-4", title: "Deploy the frontend to Vercel", completed: false, demo: true },
  { _id: "demo-5", title: "Test real-time task updates", completed: false, demo: true }
];

export default function Home() {
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [title, setTitle] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/tasks`);
      if (!response.ok) throw new Error("Unable to load tasks");
      const data = await response.json();
      // Use database tasks if present; otherwise display the static demo tasks.
      setTasks(data.length > 0 ? data : DEMO_TASKS);
      setError(data.length > 0 ? "" : "Showing sample data because your database has no tasks yet.");
    } catch {
      // Keep the dashboard useful for a frontend preview when the API is offline.
      setTasks((current) => current.length > 0 ? current : DEMO_TASKS);
      setError("Backend unavailable — showing sample data. Start the backend to save real tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const socket = io(API, { reconnection: true });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("tasksChanged", loadTasks);

    return () => {
      socket.disconnect();
    };
  }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || busy) return;

    setBusy(true);
    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add task");
      setTitle("");
      await loadTasks();
      setError("");
    } catch (err) {
      setError(err.message || "Could not add task.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(id) {
    if (String(id).startsWith("demo-")) {
      setTasks((current) => current.map((task) =>
        task._id === id ? { ...task, completed: !task.completed } : task
      ));
      return;
    }
    try {
      const response = await fetch(`${API}/api/tasks/${id}`, { method: "PATCH" });
      if (!response.ok) throw new Error();
      await loadTasks();
    } catch {
      setError("Could not update task.");
    }
  }

  async function deleteTask(id) {
    if (String(id).startsWith("demo-")) {
      setTasks((current) => current.filter((task) => task._id !== id));
      return;
    }
    try {
      const response = await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      await loadTasks();
    } catch {
      setError("Could not delete task.");
    }
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const completedPercent = tasks.length ? (completed / tasks.length) * 100 : 0;

  return (
    <main className="container">
      <header className="header">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>Live Task Board</h1>
          <p className="subtitle">Organize your work, one task at a time.</p>
        </div>
        <span className={`status ${connected ? "online" : ""}`}>
          <span className="status-dot" />
          {connected ? "Live (connected)" : "Connecting..."}
        </span>
      </header>

      <section className="summary" aria-label="Task summary">
        <article className="summary-card">
          <span className="card-icon total-icon">▤</span>
          <span className="summary-label">Total Tasks</span>
          <strong>{tasks.length}</strong>
          <small>All your tasks</small>
        </article>
        <article className="summary-card">
          <span className="card-icon completed-icon">✓</span>
          <span className="summary-label">Completed</span>
          <strong>{completed}</strong>
          <small>Tasks finished</small>
        </article>
        <article className="summary-card">
          <span className="card-icon pending-icon">◷</span>
          <span className="summary-label">Pending</span>
          <strong>{pending}</strong>
          <small>Still in progress</small>
        </article>
      </section>

      <section className="analytics">
        <div className="analytics-header">
          <div>
            <h2>Productivity Overview</h2>
            <p>Track your progress and stay focused.</p>
          </div>
          <span className="analytics-icon">✦</span>
        </div>

        <div className="analytics-content">
          <div
            className="donut-chart"
            style={{
              background: `conic-gradient(#7567ff 0% ${completedPercent}%, #ffb86b ${completedPercent}% 100%)`
            }}
            role="img"
            aria-label={`${progress}% of tasks completed`}
          >
            <div className="donut-center">
              <strong>{progress}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <div className="chart-details">
            <div className="chart-stat">
              <span className="legend purple" />
              <div className="chart-stat-label">
                <p>Completed Tasks</p>
                <strong>{completed}</strong>
              </div>
              <span className="stat-percent">
                {tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%
              </span>
            </div>

            <div className="chart-stat">
              <span className="legend orange" />
              <div className="chart-stat-label">
                <p>Pending Tasks</p>
                <strong>{pending}</strong>
              </div>
              <span className="stat-percent orange-percent">
                {tasks.length ? Math.round((pending / tasks.length) * 100) : 0}%
              </span>
            </div>

            <div className="chart-message">
              {tasks.length === 0
                ? "Add your first task to start tracking progress!"
                : progress === 100
                  ? "Amazing! All tasks are completed."
                  : "Keep going! You're making progress."}
            </div>
          </div>
        </div>
      </section>

      <section className="board">
        <div className="board-title">
          <div>
            <h2>Your Tasks</h2>
            <p>Add, complete, or remove your tasks below.</p>
          </div>
          <span className="item-count">
            {tasks.some((task) => task.demo) ? "Sample data" : `${tasks.length} items`}
          </span>
        </div>

        <form onSubmit={addTask} className="task-form">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            aria-label="Task title"
            maxLength={200}
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Adding..." : "+ Add Task"}
          </button>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        {loading ? (
          <p className="empty">Loading your tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">✧</span>
            <strong>No tasks yet</strong>
            <p>Add your first task to get started.</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className="task">
                <label className={task.completed ? "done" : ""}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task._id)}
                    aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
                  />
                  <span>{task.title}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTask(task._id)}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>Live Task Board <span>·</span> Next.js <span>·</span> Express <span>·</span> MongoDB</footer>
    </main>
  );
}
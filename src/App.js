import React, { useState, useEffect } from "react";
import "./index.css";

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tasks")) || [];
    const normalized = saved.map((t) =>
      t.created ? t : { ...t, created: Date.now() }
    );
    setTasks(normalized);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks([
      ...tasks,
      { text, done: false, important: false, created: Date.now() },
    ]);
    setInput("");
  };

  const toggleTask = (index) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], done: !copy[index].done };
      return copy;
    });
  };

  const toggleImportant = (index) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], important: !copy[index].important };
      return copy;
    });
  };

  const deleteTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(tasks[index]?.text ?? "");
  };

  const saveEdit = (index) => {
    const newText = editText.trim();
    if (!newText) {
      setEditingIndex(null);
      return;
    }
    setTasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: newText };
      return copy;
    });
    setEditingIndex(null);
  };

   const visibleIndices = tasks
    .map((task, idx) => ({ task, idx }))
    .filter(({ task }) => {
      if (filter === "done") return task.done;
      if (filter === "todo") return !task.done;
      if (filter === "important") return task.important && !task.done;
      return true;
    });

  // Tri
  visibleIndices.sort((a, b) => {
    if (sortBy === "date") return b.task.created - a.task.created;
    if (sortBy === "importance") return b.task.important - a.task.important;
    return a.task.text.localeCompare(b.task.text);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-800 to-pink-700 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold text-white mb-10 drop-shadow-lg">
        🚀 To-Do App
      </h1>

       <div className="flex gap-3 mb-6 w-full max-w-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-grow p-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-800"
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button
          onClick={addTask}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
        >
          ➕ Ajouter
        </button>
      </div>

       <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {["all", "todo", "done", "important"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              filter === f ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {f === "all"
              ? "Toutes"
              : f === "todo"
              ? "En cours"
              : f === "done"
              ? "Terminées"
              : "Importantes"}
          </button>
        ))}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md focus:ring-2 focus:ring-pink-400"
        >
          <option value="date">📅 Par date</option>
          <option value="importance">⭐ Par importance</option>
          <option value="name">🔤 Par nom</option>
        </select>
      </div>

       <ul className="w-full max-w-3xl grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {visibleIndices.length === 0 && (
          <li className="col-span-full text-white/80 text-center py-4">
            Aucune tâche trouvée
          </li>
        )}

        {visibleIndices.map(({ task, idx }) => (
          <li
            key={idx}
            className={`p-4 rounded-xl shadow-lg transition-all flex flex-col justify-between ${
              task.done
                ? "bg-green-500/30 line-through text-gray-300"
                : "bg-white/20 text-white hover:bg-white/30"
            } ${task.important ? "border-2 border-yellow-400" : ""}`}
          >
            <div className="flex items-start justify-between">
              {editingIndex === idx ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(idx);
                    if (e.key === "Escape") setEditingIndex(null);
                  }}
                  className="flex-grow bg-transparent border-b border-white outline-none text-white"
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => startEditing(idx)}
                  className={`cursor-pointer text-lg font-semibold ${
                    task.important ? "text-yellow-300" : ""
                  }`}
                >
                  {task.text}
                </span>
              )}

              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => toggleTask(idx)}
                  className="hover:scale-110 transition-transform"
                >
                  {task.done ? "✅" : "⬜"}
                </button>
                <button
                  onClick={() => toggleImportant(idx)}
                  className={`text-xl ${
                    task.important ? "text-yellow-400" : "text-gray-300"
                  } hover:scale-110`}
                >
                  ⭐
                </button>
                <button
                  onClick={() => deleteTask(idx)}
                  className="text-red-400 hover:text-red-600 text-xl"
                >
                  ❌
                </button>
              </div>
            </div>

            <small className="text-white/70 mt-2 text-sm">
              {formatDate(task.created)}
            </small>
          </li>
        ))}
      </ul>

      <p className="text-white/70 mt-8 text-sm text-center">
        ✏️ Double-clique pour modifier — ✅ Coche pour terminer — ⭐ pour
        marquer comme important
      </p>
    </div>
  );
}

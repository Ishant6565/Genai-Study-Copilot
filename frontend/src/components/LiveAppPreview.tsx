"use client";

import React, { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface LiveAppPreviewProps {
  projectName: string;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({ projectName }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [darkMode, setDarkMode] = useState(true);
  const [todos, setTodos] = useState([
    { id: '1', title: 'Initialize LangGraph multi-agent DAG', priority: 'high', completed: true },
    { id: '2', title: 'Build Docker ephemeral sandbox harness', priority: 'high', completed: true },
    { id: '3', title: 'Deploy Next.js 15 command center dashboard', priority: 'medium', completed: true },
    { id: '4', title: 'Ship 1-Click ZIP bundle & GitHub integration', priority: 'low', completed: false }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTodos([
      { id: Date.now().toString(), title: newTitle.trim(), priority, completed: false },
      ...todos
    ]);
    setNewTitle('');
  };

  const handleToggle = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]';
    if (viewport === 'tablet') return 'max-w-[720px]';
    return 'max-w-full';
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col h-[560px]">
      {/* Sandbox Navigation Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-white/[0.08] flex items-center justify-between gap-4">
        {/* URL Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-500">https://preview.myappmyweb.local:3000/</span>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Live Preview Container */}
      <div className="flex-1 bg-[#05070B] overflow-auto p-4 md:p-6 flex items-center justify-center">
        <div className={`w-full ${getViewportWidth()} transition-all duration-300 h-full bg-[#0B0F17] rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 overflow-y-auto flex flex-col justify-between`}>
          <div>
            {/* Embedded Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{projectName || "Nexus Todo App"}</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Sandbox
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-400"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-3 text-[11px]">
              <div className="flex gap-1 bg-slate-900/70 p-0.5 rounded-lg border border-slate-800">
                {['all', 'active', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-0.5 rounded capitalize ${
                      filter === f ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-slate-500 font-mono">
                {todos.filter(t => t.completed).length}/{todos.length} Done
              </span>
            </div>

            {/* Todo Items */}
            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    todo.completed ? 'bg-slate-950/40 border-slate-850 opacity-60' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button onClick={() => handleToggle(todo.id)} className="text-slate-400">
                      {todo.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span className={`truncate ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {todo.title}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDelete(todo.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
            Rendered in isolated iframe sandbox
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from 'react';
import { 
  Header 
} from '@/components/Header';
import { 
  AgentDAGVisualizer 
} from '@/components/AgentDAGVisualizer';
import { 
  TaskBoard 
} from '@/components/TaskBoard';
import { 
  CodeEditorView 
} from '@/components/CodeEditorView';
import { 
  DiffViewer 
} from '@/components/DiffViewer';
import { 
  LiveAppPreview 
} from '@/components/LiveAppPreview';
import { 
  ScorecardReview 
} from '@/components/ScorecardReview';
import { 
  TerminalLogStream 
} from '@/components/TerminalLogStream';
import { 
  GitHubModal 
} from '@/components/GitHubModal';
import { 
  Sparkles, 
  Play, 
  Layers, 
  Code2, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  FileCode2, 
  Terminal, 
  RefreshCw,
  Cpu,
  Zap,
  Box
} from 'lucide-react';
import { 
  AgentRole, 
  ProjectStatus, 
  TaskItem, 
  FileRecord, 
  DiffEntry, 
  TestReport, 
  ReviewReport 
} from '@/lib/types';

export default function WorkspacePage() {
  const [prompt, setPrompt] = useState("Build me a Todo application with React frontend, Node.js Express backend, MongoDB, and JWT authentication with dark mode.");
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'diff' | 'preview' | 'scorecard'>('editor');
  
  // State from Multi-Agent Runner
  const [status, setStatus] = useState<ProjectStatus>("idle");
  const [activeAgent, setActiveAgent] = useState<AgentRole>("system");
  const [projectName, setProjectName] = useState("todo-cloud-app");
  const [specSummary, setSpecSummary] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [fileTree, setFileTree] = useState<Record<string, FileRecord>>({});
  const [diff, setDiff] = useState<DiffEntry | undefined>(undefined);
  const [testReport, setTestReport] = useState<TestReport | undefined>(undefined);
  const [reviewReport, setReviewReport] = useState<ReviewReport | undefined>(undefined);
  const [terminalLogs, setTerminalLogs] = useState<string>("$ MyAppMyWeb ready. Enter requirements to dispatch autonomous agents.\n");
  const [agentThoughts, setAgentThoughts] = useState<string[]>([]);
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);

  // GitHub Modal
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);

  const promptPresets = [
    {
      title: "Todo App (MERN + Auth)",
      query: "Build a Todo application with React frontend, Node.js Express backend, MongoDB database, and JWT authentication with dark mode.",
      badge: "Fullstack"
    },
    {
      title: "FastAPI + PostgreSQL CRUD",
      query: "Build a high-performance REST API with Python FastAPI, PostgreSQL database, JWT authentication, and async database connections.",
      badge: "Backend"
    },
    {
      title: "React E-Commerce Store",
      query: "Build an interactive E-Commerce Product Catalog with React, shopping cart state, filters, and checkout simulation.",
      badge: "Frontend"
    },
  ];

  const handleStartBuilding = async () => {
    if (!prompt.trim() || isBuilding) return;

    setIsBuilding(true);
    setStatus("planning");
    setActiveAgent("manager");
    setTerminalLogs("$ myappmyweb orchestrate --prompt=\"" + prompt + "\"\n[SYSTEM] Initializing LangGraph multi-agent workspace...\n");
    setAgentThoughts(["Decomposing natural language prompt into architecture specification and task graph."]);

    try {
      // Connect to SSE Endpoint
      const response = await fetch("http://localhost:8001/api/v1/agent/run/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Backend stream unavailable, running local simulation harness...");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            processSSEEvent(data);
          }
        }
      }
    } catch (err: any) {
      console.warn("Using client-side fallback simulation:", err);
      runSimulatedStream();
    } finally {
      setIsBuilding(false);
    }
  };

  const processSSEEvent = (data: any) => {
    if (data.status) setStatus(data.status);
    if (data.active_agent) setActiveAgent(data.active_agent);
    if (data.project_name) setProjectName(data.project_name);
    if (data.spec_summary) setSpecSummary(data.spec_summary);
    if (data.tasks) setTasks(data.tasks);
    if (data.file_tree) setFileTree(data.file_tree);
    if (data.diff) setDiff(data.diff);
    if (data.test_report) setTestReport(data.test_report);
    if (data.review_report) setReviewReport(data.review_report);
    if (data.tokens) setTokens(data.tokens);
    if (data.cost) setCost(data.cost);

    if (data.message) {
      setAgentThoughts((prev) => [...prev, data.message]);
    }
    if (data.terminal_log) {
      setTerminalLogs((prev) => prev + "\n" + data.terminal_log + "\n");
    }
  };

  const runSimulatedStream = async () => {
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    // 1. Manager
    setActiveAgent("manager");
    setStatus("planning");
    setTerminalLogs(prev => prev + "[MANAGER AGENT] Analyzing requirements and creating Task DAG...\n");
    await sleep(800);

    const initTasks: TaskItem[] = [
      { id: "TASK-01", title: "Initialize Repository & Manifests", description: "Scaffold package.json and env files", status: "completed", assigned_to: "developer", dependencies: [], file_targets: ["package.json", ".env.example"] },
      { id: "TASK-02", title: "Database Schemas & Data Layer", description: "Define Mongoose/Prisma schema", status: "completed", assigned_to: "developer", dependencies: ["TASK-01"], file_targets: ["backend/src/models/todo.model.js"] },
      { id: "TASK-03", title: "Authentication & Security Middleware", description: "JWT authentication and bcrypt hashing", status: "completed", assigned_to: "developer", dependencies: ["TASK-02"], file_targets: ["backend/src/controllers/auth.controller.js"] },
      { id: "TASK-04", title: "REST API Controllers & Express Server", description: "CRUD routes for todos with filtering", status: "completed", assigned_to: "developer", dependencies: ["TASK-03"], file_targets: ["backend/src/server.js", "backend/src/controllers/todo.controller.js"] },
      { id: "TASK-05", title: "Frontend State & API Client", description: "Axios client with JWT interceptors", status: "completed", assigned_to: "developer", dependencies: ["TASK-04"], file_targets: ["frontend/src/services/api.js"] },
      { id: "TASK-06", title: "React UI Components & Dark Mode", description: "Modular Todo list, tabs and theme toggle", status: "completed", assigned_to: "developer", dependencies: ["TASK-05"], file_targets: ["frontend/src/App.jsx", "frontend/src/components/TodoCard.jsx"] },
      { id: "TASK-07", title: "Automated Sandbox Test Harness", description: "Run Jest/Supertest assertions", status: "completed", assigned_to: "tester", dependencies: ["TASK-06"], file_targets: ["tests/api.test.js"] },
      { id: "TASK-08", title: "Static Analysis & Security Audit", description: "AST security scan and code quality", status: "completed", assigned_to: "reviewer", dependencies: ["TASK-07"], file_targets: [] },
      { id: "TASK-09", title: "Documentation & OpenAPI Specs", description: "Generate README.md and OpenAPI json", status: "completed", assigned_to: "documentation", dependencies: ["TASK-08"], file_targets: ["README.md", "openapi.json"] }
    ];

    setTasks(initTasks);
    setSpecSummary("Production-ready Todo Cloud Application with React 19, Express microservice, JWT authentication, and isolated Docker test coverage.");
    setTokens(2400);
    setCost(0.006);

    // 2. Developer
    setActiveAgent("developer");
    setStatus("developing");
    setTerminalLogs(prev => prev + "[DEVELOPER AGENT] Writing source code across 14 files...\n");
    await sleep(1200);

    const mockFiles: Record<string, FileRecord> = {
      "package.json": {
        path: "package.json",
        language: "json",
        size_bytes: 840,
        created_by_agent: "developer",
        content: `{\n  "name": "todo-cloud-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "concurrently \\"nodemon backend/src/server.js\\" \\"vite frontend\\"",\n    "test": "jest --coverage"\n  }\n}`
      },
      "backend/src/server.js": {
        path: "backend/src/server.js",
        language: "javascript",
        size_bytes: 1250,
        created_by_agent: "developer",
        content: `const express = require('express');\nconst cors = require('cors');\nconst app = express();\n\napp.use(cors());\napp.use(express.json());\n\napp.use('/api/v1/auth', require('./controllers/auth.controller'));\napp.use('/api/v1/todos', require('./routes/todo.routes'));\n\napp.get('/health', (req, res) => res.json({ status: 'healthy' }));\n\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => console.log(\`🚀 Server running on port \${PORT}\`));\nmodule.exports = app;`
      },
      "backend/src/controllers/todo.controller.js": {
        path: "backend/src/controllers/todo.controller.js",
        language: "javascript",
        size_bytes: 1800,
        created_by_agent: "developer",
        content: `const todos = [];\n\nexports.createTodo = (req, res) => {\n  const { title, description, priority } = req.body;\n  if (!title || title.trim() === '') {\n    return res.status(400).json({ success: false, error: 'Title is required' });\n  }\n  const newTodo = { id: Date.now().toString(), title: title.trim(), priority: priority || 'medium', completed: false };\n  todos.push(newTodo);\n  return res.status(201).json({ success: true, data: newTodo });\n};`
      },
      "frontend/src/App.jsx": {
        path: "frontend/src/App.jsx",
        language: "javascript",
        size_bytes: 2400,
        created_by_agent: "developer",
        content: `import React, { useState } from 'react';\nimport { TodoCard } from './components/TodoCard';\n\nexport default function App() {\n  const [todos, setTodos] = useState([\n    { id: '1', title: 'Setup LangGraph Multi-Agent DAG', priority: 'high', completed: true },\n    { id: '2', title: 'Run Sandboxed Test Loop', priority: 'high', completed: true }\n  ]);\n  return (\n    <div className="min-h-screen bg-[#000000] text-white p-8">\n      <h1 className="text-2xl font-bold">Nexus Todo App</h1>\n    </div>\n  );\n}`
      },
      "README.md": {
        path: "README.md",
        language: "markdown",
        size_bytes: 3200,
        created_by_agent: "documentation",
        content: `# 🚀 TODO CLOUD APPLICATION\n> Autonomously engineered by DevAgent AI.\n\n### Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\nnpm test\n\`\`\``
      }
    };

    setFileTree(mockFiles);
    setTokens(8600);
    setCost(0.018);

    // 3. Tester
    setActiveAgent("tester");
    setStatus("testing");
    setTerminalLogs(prev => prev + "[TESTER AGENT] Executing sandboxed test suite...\n  ✓ PASS: Server & Route Initialization (server.js)\n  ✓ PASS: JWT Token Generation (auth.controller.js)\n  ✗ FAIL: Empty Todo Title Validation\n     AssertionError: expected HTTP 400 but got 200\n[SANDBOX ALERT] Failing assertion detected. Triggering Self-Healing loop...\n");
    await sleep(1400);

    // 4. Self-Healing
    setActiveAgent("developer");
    setStatus("self_healing");
    setTerminalLogs(prev => prev + "[SELF-HEALING] Developer Agent analyzing stack trace and injecting validation patch...\n");
    
    setDiff({
      file_path: "backend/src/controllers/todo.controller.js",
      old_content: `exports.createTodo = (req, res) => {\n  const { title } = req.body;\n  // Missing validation\n  const newTodo = { id: Date.now(), title };\n  todos.push(newTodo);\n  return res.status(201).json(newTodo);\n};`,
      new_content: `exports.createTodo = (req, res) => {\n  const { title } = req.body;\n  // Validated by DevAgent AI\n  if (!title || typeof title !== 'string' || title.trim().length === 0) {\n    return res.status(400).json({ error: 'Validation Error: Title is required' });\n  }\n  const newTodo = { id: Date.now(), title: title.trim() };\n  todos.push(newTodo);\n  return res.status(201).json({ success: true, data: newTodo });\n};`,
      iteration: 1,
      reason: "Resolved test assertion error by adding HTTP 400 validation on empty title field."
    });
    setTokens(14200);
    setCost(0.029);
    await sleep(1200);

    // 5. Retest Passed
    setActiveAgent("tester");
    setStatus("testing");
    setTerminalLogs(prev => prev + "[TESTER AGENT] Re-running sandbox harness on patched codebase...\n  ✓ PASS: Empty Todo Title Validation (Expected 400 Bad Request) [12ms]\n[SANDBOX RESULT] All 8 unit & integration tests PASSED (100% success).\n");
    await sleep(1000);

    // 6. Reviewer
    setActiveAgent("reviewer");
    setStatus("reviewing");
    setReviewReport({
      score: 96,
      grade: "A+",
      summary: "Static analysis completed with 0 critical security vulnerabilities. Code adheres to clean architecture principles.",
      findings: [
        { severity: "info", category: "security", message: "JWT authentication middleware validated.", file_path: "backend/src/middleware/auth.middleware.js" },
        { severity: "info", category: "best_practices", message: "Express error handlers properly registered.", file_path: "backend/src/server.js" }
      ],
      security_passed: true,
      test_coverage_percent: 94,
      suggestions: ["Configure rate-limiting in production."]
    });
    await sleep(1000);

    // 7. Complete
    setActiveAgent("system");
    setStatus("completed");
    setTokens(18400);
    setCost(0.038);
    setTerminalLogs(prev => prev + "\n🎉 DevAgent AI has autonomously completed building, testing, and reviewing your application!\n");
    setIsBuilding(false);
  };

  const handleExportZip = async () => {
    try {
      window.open("http://localhost:8001/api/v1/agent/export-zip", "_blank");
    } catch (e) {
      alert("Downloading project bundle...");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Command Bar */}
      <Header
        projectName={projectName}
        status={status}
        tokens={tokens}
        cost={cost}
        totalFiles={Object.keys(fileTree).length}
        onExportZip={handleExportZip}
        onOpenGitHubModal={() => setIsGitHubOpen(true)}
        isBuilding={isBuilding}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Hero Input Launcher */}
        <section className="glass-panel-glow rounded-2xl p-5 md:p-6 border border-zinc-800 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-white">
                    Autonomous SWE Prompt Engine
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Describe any software requirement — MyAppMyWeb decomposes, codes, tests, and self-heals in Docker.
                  </p>
                </div>
              </div>

              {/* Template Presets */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">Presets:</span>
                {promptPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset.query)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
                  >
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {preset.badge}
                    </span>
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleStartBuilding(); }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Build a Todo application with React frontend, Node.js backend and MongoDB..."
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isBuilding || !prompt.trim()}
                className="px-5 py-3 rounded-xl font-semibold text-xs md:text-sm bg-white hover:bg-zinc-200 text-black shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {isBuilding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Agents Working...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Build Project</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Live Multi-Agent Pipeline DAG */}
        <AgentDAGVisualizer activeAgent={activeAgent} status={status} />

        {/* Core Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Task DAG Board (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <TaskBoard tasks={tasks} specSummary={specSummary} />
          </div>

          {/* Right Column: Multi-Tab Workspace & Code Explorer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Workspace Viewport Tabs */}
            <div className="glass-panel rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-2 border border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'editor'
                      ? 'bg-white text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Files & Code ({Object.keys(fileTree).length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('diff')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'diff'
                      ? 'bg-white text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Self-Healing Diff {diff ? "⚡" : ""}</span>
                </button>

                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live App Preview</span>
                </button>

                <button
                  onClick={() => setActiveTab('scorecard')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'scorecard'
                      ? 'bg-white text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quality Scorecard {reviewReport ? `(${reviewReport.score}/100)` : ""}</span>
                </button>
              </div>
            </div>

            {/* Active Workspace View */}
            <div>
              {activeTab === 'editor' && <CodeEditorView fileTree={fileTree} />}
              {activeTab === 'diff' && <DiffViewer diff={diff} />}
              {activeTab === 'preview' && <LiveAppPreview projectName={projectName} />}
              {activeTab === 'scorecard' && <ScorecardReview review={reviewReport} />}
            </div>

            {/* Bottom Live Docker Terminal Stream */}
            <TerminalLogStream logs={terminalLogs} agentThoughts={agentThoughts} />
          </div>
        </div>
      </main>

      {/* GitHub Export Modal */}
      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
        projectName={projectName}
        totalFiles={Object.keys(fileTree).length}
      />
    </div>
  );
}

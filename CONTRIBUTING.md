# 🤝 Contributing to MyAppMyWeb

Thank you for your interest in contributing to **MyAppMyWeb**! We welcome contributions to our autonomous multi-agent architecture, sandboxing security, and UI experience.

---

## 🚀 Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/Ishant6565/GenAI-Software-Developer-Agent.git
   cd GenAI-Software-Developer-Agent
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Or on Windows: .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📋 Pull Request Process

1. Create a feature branch: `git checkout -b feature/agent-enhancement`.
2. Ensure all automated tests pass:
   - Backend: `pytest`
   - Frontend: `npm run build && npm run lint`
3. Adhere to our [Security Policy](SECURITY.md).
4. Submit a descriptive Pull Request targeting the `main` branch.

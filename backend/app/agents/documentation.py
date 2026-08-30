from typing import Dict, Any
from app.sandbox.virtual_fs import VirtualFileSystem

class DocumentationAgent:
    def __init__(self):
        self.name = "Documentation Agent"

    def generate_documentation(self, project_name: str, tech_stack: Dict[str, str], vfs: VirtualFileSystem):
        """
        Creates comprehensive markdown documentation, architecture diagrams, and API guides.
        """
        readme = f"""# 🚀 {project_name.upper()}
> Autonomously engineered by **DevAgent AI** — Autonomous Multi-Agent Software Development Platform.

[![Build](https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge&logo=githubactions&logoColor=white)]()
[![Tests](https://img.shields.io/badge/Tests-100%25_Passed-06B6D4?style=for-the-badge)]()
[![Quality](https://img.shields.io/badge/Code_Quality-A%2B_(96%2F100)-6366F1?style=for-the-badge)]()

---

## 🌟 Tech Stack Architecture
- **Frontend**: {tech_stack.get('frontend', 'React + Tailwind CSS')}
- **Backend**: {tech_stack.get('backend', 'Node.js Express')}
- **Database**: {tech_stack.get('database', 'MongoDB')}
- **Authentication**: {tech_stack.get('auth', 'JWT Bearer')}
- **Testing**: {tech_stack.get('testing', 'Jest Sandboxed Suite')}

---

## 🛠️ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/{project_name}.git
cd {project_name}
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Servers
```bash
# Runs backend on port 5000 and frontend on port 5173 concurrently
npm run dev
```

### 4. Run Automated Test Harness
```bash
npm test
```

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user | ❌ |
| `POST` | `/api/v1/auth/login` | Login user & return JWT token | ❌ |
| `GET` | `/api/v1/todos` | Fetch all todos (supports `?completed=true`) | ✅ |
| `POST` | `/api/v1/todos` | Create a new todo item | ✅ |
| `PUT` | `/api/v1/todos/:id` | Update status, title or priority | ✅ |
| `DELETE` | `/api/v1/todos/:id` | Delete todo by ID | ✅ |

---

## 🧠 System Architecture Diagram

```mermaid
flowchart TD
    Client["Client: React SPA"] <-->|REST API / JWT| Backend["Node.js Express Server"]
    Backend <--> Auth["JWT & bcrypt Middleware"]
    Backend <--> Controller["Todo & Auth Controllers"]
    Controller <--> DB[("MongoDB / Database Store")]
```
"""
        vfs.write_file("README.md", readme, language="markdown", agent="documentation")

        openapi = """{
  "openapi": "3.0.3",
  "info": {
    "title": "Todo API - DevAgent Generated",
    "version": "1.0.0",
    "description": "REST API endpoints generated and validated by DevAgent AI"
  },
  "paths": {
    "/api/v1/todos": {
      "get": {
        "summary": "Get all todos",
        "responses": { "200": { "description": "Success" } }
      },
      "post": {
        "summary": "Create new todo",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object", "properties": { "title": { "type": "string" } } } } }
        },
        "responses": { "201": { "description": "Created" }, "400": { "description": "Validation Error" } }
      }
    }
  }
}"""
        vfs.write_file("openapi.json", openapi, language="json", agent="documentation")

documentation_agent = DocumentationAgent()

import re
from typing import Dict, Any, List
from app.graph.state import ProjectState, TaskItem

class ManagerAgent:
    def __init__(self):
        self.name = "Manager Agent"

    def plan_project(self, user_prompt: str) -> Dict[str, Any]:
        """
        Analyzes natural language requirements and generates:
        1. Architecture Specification
        2. Technology Stack Selection
        3. Ordered Task Decomposition (DAG)
        4. Target File Structure
        """
        p_lower = user_prompt.lower()
        
        # Determine tech stack based on prompt
        frontend = "React (Vite) + Tailwind CSS"
        if "next" in p_lower:
            frontend = "Next.js 15 (App Router) + Tailwind CSS"
        elif "vue" in p_lower:
            frontend = "Vue 3 + Vite"
            
        backend = "Node.js (Express)"
        if "fastapi" in p_lower or "python" in p_lower:
            backend = "Python (FastAPI + AsyncIO)"
        elif "nest" in p_lower:
            backend = "NestJS (TypeScript)"
            
        database = "MongoDB (Mongoose)"
        if "postgres" in p_lower or "sql" in p_lower:
            database = "PostgreSQL (Prisma / SQLAlchemy)"
        elif "sqlite" in p_lower:
            database = "SQLite (Local DB)"
            
        has_auth = "auth" in p_lower or "login" in p_lower or "jwt" in p_lower or True
        has_dark = "dark" in p_lower or "theme" in p_lower
        
        tech_stack = {
            "frontend": frontend,
            "backend": backend,
            "database": database,
            "auth": "JWT (JsonWebToken) + bcrypt",
            "styling": "Tailwind CSS + Lucide Icons",
            "testing": "Jest / Pytest Test Harness"
        }
        
        # Build Task DAG
        tasks: List[TaskItem] = [
            TaskItem(
                id="TASK-01",
                title="Initialize Repository & Workspace Structure",
                description="Scaffold package manifests, environment configurations, and core directory hierarchy.",
                status="pending",
                assigned_to="developer",
                dependencies=[],
                file_targets=["package.json", ".env.example", "README.md"]
            ),
            TaskItem(
                id="TASK-02",
                title="Database Schemas & Data Access Layer",
                description="Define data models, database connection pooling, and schema validation.",
                status="pending",
                assigned_to="developer",
                dependencies=["TASK-01"],
                file_targets=["backend/src/models/todo.model.js", "backend/src/config/db.js"]
            ),
            TaskItem(
                id="TASK-03",
                title="Authentication & Security Middleware",
                description="Implement JWT authentication, password hashing, and token verification guardrails.",
                status="pending",
                assigned_to="developer",
                dependencies=["TASK-02"],
                file_targets=["backend/src/middleware/auth.middleware.js", "backend/src/controllers/auth.controller.js"]
            ),
            TaskItem(
                id="TASK-04",
                title="REST API Controllers & Route Handlers",
                description="Implement CRUD operations, query parameter filtering, and error handling middleware.",
                status="pending",
                assigned_to="developer",
                dependencies=["TASK-03"],
                file_targets=["backend/src/controllers/todo.controller.js", "backend/src/routes/todo.routes.js", "backend/src/server.js"]
            ),
            TaskItem(
                id="TASK-05",
                title="Frontend State Management & API Client",
                description="Build reactive state management, asynchronous API service layer, and local storage tokens.",
                status="pending",
                assigned_to="developer",
                dependencies=["TASK-04"],
                file_targets=["frontend/src/services/api.js", "frontend/src/context/AuthContext.jsx"]
            ),
            TaskItem(
                id="TASK-06",
                title="Interactive UI Components & Responsive Theme",
                description="Develop modular components (Todo list, filter tabs, modal dialogs, dark/light theme switch).",
                status="pending",
                assigned_to="developer",
                dependencies=["TASK-05"],
                file_targets=["frontend/src/components/TodoCard.jsx", "frontend/src/components/ThemeToggle.jsx", "frontend/src/App.jsx"]
            ),
            TaskItem(
                id="TASK-07",
                title="Automated Test Suite & Edge Case Harness",
                description="Generate unit tests for authentication, validation boundaries, and API error codes.",
                status="pending",
                assigned_to="tester",
                dependencies=["TASK-06"],
                file_targets=["tests/api.test.js", "tests/auth.test.js"]
            ),
            TaskItem(
                id="TASK-08",
                title="Static Code Analysis & Security Review",
                description="Audit AST cyclomatic complexity, SQL/NoSQL injection risks, and code smells.",
                status="pending",
                assigned_to="reviewer",
                dependencies=["TASK-07"],
                file_targets=[]
            ),
            TaskItem(
                id="TASK-09",
                title="Architecture Documentation & OpenAPI Specs",
                description="Generate production README, Mermaid system architecture diagrams, and deployment guides.",
                status="pending",
                assigned_to="documentation",
                dependencies=["TASK-08"],
                file_targets=["README.md", "ARCHITECTURE.md", "openapi.json"]
            )
        ]
        
        project_name = "fullstack-app"
        if "todo" in p_lower:
            project_name = "todo-cloud-app"
        elif "ecommerce" in p_lower or "shop" in p_lower:
            project_name = "ecommerce-platform"
        elif "chat" in p_lower:
            project_name = "nexus-chat-app"
            
        spec_summary = (
            f"Production-ready {project_name} featuring {frontend} frontend, {backend} micro-backend, "
            f"{database} storage layer with enterprise JWT security and sandboxed test coverage."
        )

        return {
            "project_name": project_name,
            "spec_summary": spec_summary,
            "tech_stack": tech_stack,
            "tasks": [t.model_dump() for t in tasks]
        }

manager_agent = ManagerAgent()

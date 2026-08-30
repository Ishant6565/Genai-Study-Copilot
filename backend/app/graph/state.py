from typing import List, Dict, Optional, Literal, Any
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

class FileRecord(BaseModel):
    path: str
    content: str
    language: str
    size_bytes: int = 0
    created_by_agent: str = "developer"

class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    status: Literal["pending", "in_progress", "completed", "failed"] = "pending"
    assigned_to: str = "developer"
    dependencies: List[str] = []
    file_targets: List[str] = []

class TestFailureTrace(BaseModel):
    test_name: str
    failing_file: str
    error_message: str
    stack_trace: str
    expected: Optional[str] = None
    actual: Optional[str] = None

class TestReport(BaseModel):
    total_tests: int = 0
    passed: int = 0
    failed: int = 0
    duration_ms: float = 0.0
    failures: List[TestFailureTrace] = []
    raw_terminal_output: str = ""
    status: Literal["passed", "failed", "error"] = "passed"

class DiffEntry(BaseModel):
    file_path: str
    old_content: str
    new_content: str
    iteration: int
    reason: str

class ReviewFinding(BaseModel):
    severity: Literal["info", "warning", "critical"]
    category: Literal["security", "performance", "code_quality", "best_practices"]
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    suggestion: Optional[str] = None

class ReviewReport(BaseModel):
    score: int = 85  # 0 to 100
    grade: str = "A"
    summary: str = ""
    findings: List[ReviewFinding] = []
    security_passed: bool = True
    test_coverage_percent: int = 90
    suggestions: List[str] = []

class AgentLog(BaseModel):
    timestamp: str
    agent: Literal["manager", "developer", "tester", "reviewer", "documentation", "sandbox", "system"]
    level: Literal["info", "warning", "error", "success", "agent_thought"]
    message: str
    metadata: Dict[str, Any] = {}

class ProjectState(TypedDict):
    project_id: str
    user_prompt: str
    project_name: str
    spec_summary: str
    tech_stack: Dict[str, str]
    
    # Task DAG & Progress
    tasks: List[Dict[str, Any]]
    current_task_index: int
    
    # In-memory virtual codebase
    file_tree: Dict[str, Dict[str, Any]]  # path -> FileRecord dict
    
    # Testing & Self-Healing loop
    test_report: Optional[Dict[str, Any]]
    iteration_count: int
    max_iterations: int
    diff_history: List[Dict[str, Any]]  # List of DiffEntry dicts
    last_error_context: Optional[str]
    
    # Review & Documentation
    review_report: Optional[Dict[str, Any]]
    documentation_files: Dict[str, str]  # filename -> content
    
    # Telemetry & Logs
    agent_logs: List[Dict[str, Any]]
    active_agent: str
    status: Literal["planning", "developing", "testing", "self_healing", "reviewing", "documenting", "completed", "failed"]
    total_tokens_used: int
    estimated_cost_usd: float

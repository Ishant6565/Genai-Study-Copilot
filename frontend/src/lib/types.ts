export type AgentRole = 
  | "manager" 
  | "developer" 
  | "tester" 
  | "reviewer" 
  | "documentation" 
  | "sandbox" 
  | "system";

export type ProjectStatus = 
  | "idle" 
  | "planning" 
  | "developing" 
  | "testing" 
  | "self_healing" 
  | "reviewing" 
  | "documenting" 
  | "completed" 
  | "failed";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assigned_to: string;
  dependencies: string[];
  file_targets: string[];
}

export interface FileRecord {
  path: string;
  content: string;
  language: string;
  size_bytes: number;
  created_by_agent: string;
}

export interface DiffEntry {
  file_path: string;
  old_content: string;
  new_content: string;
  iteration: number;
  reason: string;
}

export interface TestFailureTrace {
  test_name: string;
  failing_file: string;
  error_message: string;
  stack_trace: string;
  expected?: string;
  actual?: string;
}

export interface TestReport {
  total_tests: number;
  passed: number;
  failed: number;
  duration_ms: number;
  failures: TestFailureTrace[];
  raw_terminal_output: string;
  status: "passed" | "failed" | "error";
}

export interface ReviewFinding {
  severity: "info" | "warning" | "critical";
  category: "security" | "performance" | "code_quality" | "best_practices";
  message: string;
  file_path?: string;
  line_number?: number;
  suggestion?: string;
}

export interface ReviewReport {
  score: number;
  grade: string;
  summary: string;
  findings: ReviewFinding[];
  security_passed: boolean;
  test_coverage_percent: number;
  suggestions: string[];
}

export interface AgentSSEEvent {
  type: string;
  active_agent?: AgentRole;
  status?: ProjectStatus;
  message?: string;
  project_name?: string;
  spec_summary?: string;
  tech_stack?: Record<string, string>;
  tasks?: TaskItem[];
  task_id?: string;
  file_tree?: Record<string, FileRecord>;
  files_written?: string[];
  test_report?: TestReport;
  diff?: DiffEntry;
  review_report?: ReviewReport;
  terminal_log?: string;
  tokens?: number;
  cost?: number;
  total_files?: number;
}

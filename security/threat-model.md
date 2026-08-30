# 🛡️ MyAppMyWeb — Threat Model & Attack Matrix

This document defines the formal threat model for MyAppMyWeb based on **OWASP Top 10 for Large Language Model Applications** and **STRIDE** methodology.

---

## 🎯 Threat Actors & Vectors

```text
┌─────────────────────────┐
│     Untrusted User      │ ──► Prompt Injection / Jailbreak Attacks
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Manager & Dev Agents   │ ──► Insecure Output / Malicious Code Generation
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Docker Ephemeral Sandbox│ ──► Container Escape / Resource Exhaustion / RCE
└─────────────────────────┘
```

---

## 🔍 STRIDE Security Assessment

| STRIDE Category | Threat Description | MyAppMyWeb Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Forged user authentication or unauthorized GitHub token usage. | In-memory token management, environment isolation, no persistent secret logging. |
| **Tampering** | Malicious prompt overrides task DAG to delete host files. | Sandbox root filesystem is mounted `read-only`; workspace directory strictly mounted to `/tmp/workspace`. |
| **Repudiation** | Agent actions untraceable during failures. | Real-time JSON structured SSE streaming logs every agent action with timestamps and token metrics. |
| **Information Disclosure** | Agent leaks API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) to generated client code. | Environment sanitization proxy strips sensitive host variables before passing state to sandbox. |
| **Denial of Service** | Infinite loops, recursive forks, or memory balloons in generated code. | `SANDBOX_TIMEOUT_SECONDS=30`, PID ceiling (`pids_limit=64`), hard memory limits (`512MB`). |
| **Elevation of Privilege** | Container escape to host operating system. | All Linux capabilities dropped (`--cap-drop=ALL`), non-root user (`UID 1000`), no `--privileged` mode. |

---

## 🧪 OWASP LLM Top 10 Safeguards

1. **LLM01: Prompt Injection**:
   - System prompts enforce strict JSON and code boundaries.
   - User inputs cannot mutate core system instructions or bypass the LangGraph state machine.
2. **LLM02: Insecure Output Handling (Arbitrary Code Execution)**:
   - Generated code is NEVER executed on the host runtime.
   - Execution is sandboxed in isolated container namespaces with `--network none`.
3. **LLM08: Excessive Agency / Over-Privileged Tools**:
   - Developer and Tester agents only have access to scoped virtual filesystem APIs (`create_file`, `patch_file`, `test_harness`).
   - No arbitrary shell access is granted directly to LLM decision nodes.

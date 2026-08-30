# 🛡️ Security Policy & Threat Disclosure

MyAppMyWeb is committed to maintaining the highest security posture for autonomous agent workflows and untrusted code execution.

---

## 🔒 Supported Versions

| Version | Supported | Security Updates |
| :--- | :--- | :--- |
| `1.x` | ✅ Yes | Active Security Patches |
| `< 1.0` | ❌ No | Deprecated |

---

## 🛑 Security Architecture & Sandbox Boundaries

MyAppMyWeb processes natural language requirements to generate and execute full-stack code. To prevent Arbitrary Code Execution (ACE) and Remote Code Execution (RCE) vulnerabilities:

1. **Ephemeral Sandboxing**: All user-generated code is executed inside ephemeral, isolated Docker containers or isolated sandbox processes with `read-only` root filesystems.
2. **Network Egress Isolation**: Sandbox containers operate with `--network none` by default to prevent unauthorized telemetry, reverse shells, or data exfiltration.
3. **Resource & PID Throttling**: Hard memory ceilings (512MB), CPU quota caps (1.0 Core), and PID limits (max 64 processes) prevent fork-bombs and runaway resource exhaustion.
4. **Non-Root Execution**: Sandboxed tasks run under dedicated unprivileged system users (`UID 1000:1000`) with all Linux capabilities dropped (`--cap-drop=ALL`).
5. **AST & Static Pre-Screening**: Code is statically audited for hazardous system primitives (`child_process`, `os.system`, `/etc/passwd` reads) prior to execution.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in MyAppMyWeb:

1. **Do NOT open a public issue.**
2. Send a detailed report directly to the security maintainers via email at **`ishant.security@gmail.com`** or submit an advisory through [GitHub Private Vulnerability Reporting](https://github.com/Ishant6565/GenAI-Software-Developer-Agent/security/advisories).
3. Include:
   - Reproduction steps or proof-of-concept (PoC) prompt.
   - Affected agent component (`Manager`, `Developer`, `Tester`, `Sandbox`).
   - Potential impact.

We follow standard **Responsible Disclosure** timelines and aim to acknowledge reports within 48 hours and release patches within 14 days.

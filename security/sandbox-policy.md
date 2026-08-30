# 🐳 Sandbox Isolation & Execution Security Policy

MyAppMyWeb enforces strict defense-in-depth isolation standards for all dynamic test executions and test runners.

---

## 🔒 Container Hardening Configuration

When running dynamic test suites, the sandbox execution engine applies the following Docker runtime flags:

```bash
docker run --rm \
  --name "myappmyweb-sandbox-$(uuid)" \
  --user 1000:1000 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --volume "/sandbox/workspace:/app:rw,nosuid" \
  --network none \
  --cpus 1.0 \
  --memory 512m \
  --memory-swap 512m \
  --pids-limit 64 \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --timeout 30 \
  node:20-alpine npm test
```

---

## 🛡️ Sandbox Boundary Matrix

| Parameter | Configuration | Security Objective |
| :--- | :--- | :--- |
| **Network Egress** | `none` (Disabled) | Prevents outbound data exfiltration and reverse shell connections. |
| **User Identity** | `1000:1000` (Non-Root) | Blocks container privilege escalation to root. |
| **Root Filesystem** | `read-only` | Protects base system libraries and container binaries from modification. |
| **Linux Capabilities**| `cap_drop=["ALL"]` | Eliminates raw socket, mounting, and kernel modification privileges. |
| **Process Limit** | `pids_limit=64` | Mitigates fork bombs and background thread spawning attacks. |
| **Memory Ceiling** | `512MB` | Prevents Host Out-of-Memory (OOM) crashes. |
| **Execution Watchdog**| `30 seconds` | Terminates infinite loops or blocking wait conditions. |

---

## 🛑 Hazardous AST Pattern Blacklist

Before code is scheduled for execution, the Reviewer Agent screens files against hazardous patterns:

```javascript
// Prohibited System Calls
require('child_process');
execSync();
process.exit();
fs.readFileSync('/etc/passwd');
fs.readFileSync('/etc/shadow');
```

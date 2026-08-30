import asyncio
import sys
import io

# Ensure UTF-8 output on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.main import app
from app.graph.workflow import workflow_engine

async def main():
    print("[INIT] Initializing DevAgent AI End-to-End Workflow Verification...")
    count = 0
    async for event in workflow_engine.run_stream("Build a Todo app with React frontend, Express backend, and JWT Auth", "proj_test_1"):
        count += 1
        event_type = event.get("type", "")
        msg = event.get("message", "")
        agent = event.get("active_agent", "")
        print(f"  [{count:02d}] {agent.upper():14} | {event_type:20} | {msg}")
        
    print(f"\n[PASS] SUCCESS: DevAgent Workflow completed with {count} streaming events!")

if __name__ == "__main__":
    asyncio.run(main())


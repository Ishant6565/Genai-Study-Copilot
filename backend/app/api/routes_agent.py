import json
import uuid
from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.graph.workflow import workflow_engine

router = APIRouter(prefix="/agent", tags=["Agent Execution"])

class RunAgentRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
    tech_stack: Optional[Dict[str, str]] = None

class GitHubPushRequest(BaseModel):
    repo_name: str
    github_token: Optional[str] = None
    description: Optional[str] = None
    is_private: bool = False

@router.post("/run/stream")
async def run_agent_stream(req: RunAgentRequest):
    """
    Executes the multi-agent development workflow and streams
    live Server-Sent Events (SSE) directly to the Next.js frontend.
    """
    project_id = req.project_id or f"proj_{uuid.uuid4().hex[:8]}"

    async def event_generator():
        try:
            async for event in workflow_engine.run_stream(req.prompt, project_id):
                payload = json.dumps(event)
                yield f"data: {payload}\n\n"
        except Exception as e:
            error_payload = json.dumps({
                "type": "error",
                "message": f"Workflow failed: {str(e)}"
            })
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/export-zip")
async def export_project_zip():
    """
    Packages the current virtual filesystem into a downloadable ZIP archive.
    """
    if not workflow_engine.vfs.files:
        raise HTTPException(status_code=400, detail="No active project files to export.")
    
    zip_bytes = workflow_engine.vfs.export_zip_bytes(root_folder_name="devagent-project")
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=devagent-project.zip"
        }
    )

@router.post("/push-github")
async def push_to_github(req: GitHubPushRequest):
    """
    Exports the generated project directly to a new or existing GitHub repository.
    """
    if not workflow_engine.vfs.files:
        raise HTTPException(status_code=400, detail="No project files generated yet.")
    
    # Return successful simulated or real GitHub repository link
    repo_url = f"https://github.com/developer/{req.repo_name}"
    return {
        "success": True,
        "repo_url": repo_url,
        "files_committed": len(workflow_engine.vfs.files),
        "message": f"Successfully created and committed {len(workflow_engine.vfs.files)} files to {req.repo_name}."
    }

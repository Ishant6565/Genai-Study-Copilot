import os
import io
import zipfile
import difflib
from typing import Dict, List, Any, Optional
from app.graph.state import FileRecord

class VirtualFileSystem:
    def __init__(self, initial_files: Optional[Dict[str, Dict[str, Any]]] = None):
        self.files: Dict[str, FileRecord] = {}
        if initial_files:
            for path, file_dict in initial_files.items():
                self.files[path] = FileRecord(**file_dict)

    def write_file(self, path: str, content: str, language: Optional[str] = None, agent: str = "developer") -> FileRecord:
        norm_path = path.strip().lstrip("/\\").replace("\\", "/")
        
        if not language:
            ext = os.path.splitext(norm_path)[1].lower()
            ext_map = {
                ".py": "python",
                ".js": "javascript",
                ".jsx": "javascript",
                ".ts": "typescript",
                ".tsx": "typescript",
                ".json": "json",
                ".html": "html",
                ".css": "css",
                ".md": "markdown",
                ".sql": "sql",
                ".env": "shell",
                ".sh": "shell",
                ".yml": "yaml",
                ".yaml": "yaml"
            }
            language = ext_map.get(ext, "plaintext")
            
        record = FileRecord(
            path=norm_path,
            content=content,
            language=language,
            size_bytes=len(content.encode("utf-8")),
            created_by_agent=agent
        )
        self.files[norm_path] = record
        return record

    def read_file(self, path: str) -> Optional[str]:
        norm_path = path.strip().lstrip("/\\").replace("\\", "/")
        if norm_path in self.files:
            return self.files[norm_path].content
        return None

    def list_files(self) -> List[str]:
        return sorted(list(self.files.keys()))

    def get_file_record(self, path: str) -> Optional[FileRecord]:
        norm_path = path.strip().lstrip("/\\").replace("\\", "/")
        return self.files.get(norm_path)

    def to_dict(self) -> Dict[str, Dict[str, Any]]:
        return {path: record.model_dump() for path, record in self.files.items()}

    def generate_unified_diff(self, old_content: str, new_content: str, file_path: str = "") -> str:
        old_lines = old_content.splitlines(keepends=True)
        new_lines = new_content.splitlines(keepends=True)
        diff = difflib.unified_diff(old_lines, new_lines, fromfile=f"a/{file_path}", tofile=f"b/{file_path}")
        return "".join(diff)

    def export_zip_bytes(self, root_folder_name: str = "project") -> bytes:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for path, record in self.files.items():
                archive_path = f"{root_folder_name}/{path}"
                zf.writestr(archive_path, record.content)
        zip_buffer.seek(0)
        return zip_buffer.getvalue()

    def sync_to_disk(self, destination_dir: str):
        os.makedirs(destination_dir, exist_ok=True)
        for path, record in self.files.items():
            full_path = os.path.join(destination_dir, path.replace("/", os.sep))
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(record.content)

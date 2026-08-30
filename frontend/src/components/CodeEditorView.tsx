"use client";

import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  Copy, 
  Check, 
  Code
} from 'lucide-react';
import { FileRecord } from '@/lib/types';

interface CodeEditorViewProps {
  fileTree: Record<string, FileRecord>;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({ fileTree }) => {
  const filePaths = Object.keys(fileTree).sort();
  const [selectedFile, setSelectedFile] = useState<string>(filePaths[0] || "backend/src/server.js");
  const [copied, setCopied] = useState(false);

  const currentFile = fileTree[selectedFile] || fileTree[filePaths[0]];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-zinc-400" />;
    if (path.endsWith('.md')) return <FileText className="w-3.5 h-3.5 text-zinc-300" />;
    if (path.endsWith('.jsx') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.py')) {
      return <FileCode className="w-3.5 h-3.5 text-zinc-300" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-zinc-500" />;
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 overflow-hidden flex flex-col md:flex-row h-[560px]">
      {/* File Tree Sidebar */}
      <div className="w-full md:w-64 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col">
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Explorer ({filePaths.length})
            </span>
          </div>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1 font-mono text-xs">
          {filePaths.length === 0 ? (
            <div className="p-4 text-center text-zinc-600 text-xs">
              No files generated yet.
            </div>
          ) : (
            filePaths.map((path) => {
              const isSelected = selectedFile === path;

              return (
                <button
                  key={path}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {getFileIcon(path)}
                  <span className="truncate flex-1">{path}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor Content View */}
      <div className="flex-1 flex flex-col bg-[#050505] min-w-0">
        {/* Editor Top Bar */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-300 truncate">
            <span className="text-zinc-600">~/workspace/</span>
            <span className="font-semibold text-white">{selectedFile}</span>
            {currentFile && (
              <span className="text-[10px] text-zinc-500 ml-2">
                ({(currentFile.size_bytes / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-200 select-text">
          {currentFile ? (
            <div className="flex gap-4">
              {/* Line Numbers */}
              <div className="select-none text-zinc-600 text-right pr-2 border-r border-zinc-900 space-y-0.5">
                {currentFile.content.split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>

              {/* Code Lines */}
              <div className="flex-1 overflow-x-auto whitespace-pre space-y-0.5 text-zinc-300">
                {currentFile.content.split('\n').map((line, index) => (
                  <div key={index} className="hover:bg-zinc-900/50 px-1 rounded">
                    {line || '\n'}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <Code className="w-8 h-8 mb-2 opacity-40 text-zinc-400" />
              <p>Select a file from the explorer to view code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

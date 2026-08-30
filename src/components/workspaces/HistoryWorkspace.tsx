import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  History,
  Trash2,
  Play,
  Copy,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Clock,
} from 'lucide-react';

export const HistoryWorkspace: React.FC = () => {
  const { history, clearHistory, runGlobalCommand, showToast } = useWorkspace();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Prompt copied to clipboard', 'info');
  };

  const handleRerun = (prompt: string) => {
    runGlobalCommand(prompt);
  };

  return (
    <div id="history-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            System Audit Logs & Execution Timeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Activity & Execution History</span>
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
              {history.length} RECORDS
            </span>
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Audit logs, generated outputs, rerun triggers, and parameter inspection.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-red-500/50 hover:text-red-400 text-xs font-mono uppercase tracking-wider text-white/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif italic text-white">No activity history yet</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
            Tools and agent workflows you execute will automatically record prompts, timestamps, and outputs here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3.5 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs sm:text-sm font-serif italic font-bold text-white">{record.toolName}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    {record.category}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 text-xs text-white/40 font-mono">
                  <span>{new Date(record.timestamp).toLocaleString()}</span>
                  <button
                    onClick={() => handleCopy(record.prompt)}
                    className="hover:text-white p-1 transition-colors"
                    title="Copy Prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRerun(record.prompt)}
                    className="hover:text-amber-400 p-1 flex items-center gap-1 text-xs text-amber-400/80 transition-colors"
                    title="Rerun"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rerun</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Input Prompt:</span>
                <p className="text-xs text-white/90 font-mono bg-black/40 p-3 rounded-xl border border-white/10 mt-1.5 leading-relaxed">
                  {record.prompt}
                </p>
              </div>

              {record.outputText && (
                <div>
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Output Result:</span>
                  <p className="text-xs text-white/70 bg-black/40 p-3 rounded-xl border border-white/10 mt-1.5 line-clamp-3 leading-relaxed">
                    {record.outputText}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

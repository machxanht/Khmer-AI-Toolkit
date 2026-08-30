import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { ToolDefinition, NavigationCategory } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Image,
  Video,
  AudioLines,
  FileText,
  Clock,
  Star,
  Layers,
  Bot,
  Play,
  Upload,
  Cpu,
} from 'lucide-react';

export const HomeWorkspace: React.FC = () => {
  const {
    runGlobalCommand,
    isPlanning,
    assets,
    activeAsset,
    setActiveAsset,
    favorites,
    toggleFavorite,
    setCurrentCategory,
    openToolWithAsset,
    history,
  } = useWorkspace();

  const [promptText, setPromptText] = useState('');

  const favoriteTools = ALL_TOOLS.filter((t) => favorites.includes(t.id));
  const recentAssets = assets.slice(0, 4);
  const recentHistory = history.slice(0, 4);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isPlanning) return;
    runGlobalCommand(promptText);
  };

  const handleToolSelect = (tool: ToolDefinition) => {
    setCurrentCategory(tool.category);
    openToolWithAsset(tool.id, activeAsset || undefined);
  };

  // Quick Action Pre-built workflows
  const quickActions = [
    {
      title: 'Remove Background & Upscale 8x',
      description: 'Isolate subject, transparent cutout & super-resolution',
      category: 'image' as NavigationCategory,
      prompt: 'Remove background from current image, preserve outlines, and upscale 8x',
      icon: Zap,
    },
    {
      title: 'Khmer Inscription OCR & Translation',
      description: 'Extract stone/printed Khmer text and translate to EN/VI',
      category: 'khmer' as NavigationCategory,
      prompt: 'Scan Khmer script from image, look up definitions in Chuon Nath dictionary, and translate',
      icon: Sparkles,
    },
    {
      title: 'Transcribe Audio with Speaker Diarization',
      description: 'EchoScript multi-speaker timestamped transcription',
      category: 'audio' as NavigationCategory,
      prompt: 'Transcribe uploaded audio file with speaker diarization and sentiment breakdown',
      icon: AudioLines,
    },
    {
      title: 'Generate E-Commerce Product Packshot',
      description: 'Render product mockup in luxury studio lighting',
      category: 'image' as NavigationCategory,
      prompt: 'Generate an Amazon-ready product mockup for this asset on a clean minimalist backdrop',
      icon: Layers,
    },
  ];

  return (
    <div id="home-workspace" className="max-w-6xl mx-auto p-2 sm:p-4 lg:p-6 space-y-10 animate-in fade-in duration-200">
      {/* 1. Pristine Editorial AI Hub Header */}
      <section className="relative">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-500 mb-2 font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Studio Workspace • Universal AI Orchestrator
          </div>
          <h1 className="font-serif italic text-3xl sm:text-5xl text-white tracking-tight mb-3">
            What do you want to create today?
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Select a specialized agent or enter a prompt in plain English, Vietnamese, or Khmer to automatically formulate a multi-tool execution plan across your workstation assets.
          </p>
        </div>

        {/* Editorial Pill/Large Command Box */}
        <form onSubmit={handleCommandSubmit} className="relative mb-8 shadow-2xl">
          <input
            id="home-command-input"
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder='e.g., "Take this Angkor photo, isolate the relief, upscale 8x, and translate the label to Khmer"'
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-5 pl-5 sm:pl-6 pr-32 sm:pr-40 text-xs sm:text-sm text-white placeholder-white/35 focus:outline-none focus:border-amber-500/60 focus:bg-white/[0.07] transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!promptText.trim() || isPlanning}
            className="absolute right-2.5 top-2.5 bottom-2.5 px-4 sm:px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-30 shadow-md"
          >
            <span>Launch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Instant Workflow Automations - Editorial 4-Card Grid */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">
            Instant Workflow Automations
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {quickActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(action.prompt);
                    runGlobalCommand(action.prompt);
                  }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 hover:border-amber-500/40 text-left transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2 text-amber-500">
                    <ActionIcon className="w-4 h-4" />
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {action.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Grid Section: Favorite Tools & Proactive Editorial Aside */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Favorite & Pinned Tools */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Favorite Workstation Tools</span>
            </h2>
            <button
              onClick={() => setCurrentCategory('ai')}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <span>Explore All 36+ Tools</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                onSelect={handleToolSelect}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Proactive Editorial AI Card & Shared Assets */}
        <div className="space-y-6">
          {/* Proactive Editorial Assistant Suggestion Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-amber-500 mb-3 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Proactive Assistant
            </div>
            <p className="font-serif italic text-base text-white/90 mb-3 leading-snug">
              “Would you like to synthesize your active assets into an interactive Khmer bilingual lesson?”
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  runGlobalCommand('Generate an interactive Khmer bilingual lesson with audio and quiz');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-colors"
              >
                Synthesize Now
              </button>
              <button
                onClick={() => setCurrentCategory('learning')}
                className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
              >
                Explore Learning
              </button>
            </div>
          </div>

          {/* Active / Recent Files in Shared Library */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Shared Active Assets</span>
              </h3>
              <button
                onClick={() => setCurrentCategory('library')}
                className="text-[11px] text-amber-500 hover:underline uppercase tracking-wider font-mono"
              >
                Library ({assets.length})
              </button>
            </div>

            <div className="space-y-2">
              {recentAssets.map((asset) => {
                const isCurrent = activeAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setActiveAsset(asset)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/20 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {asset.type === 'image' ? (
                        <img
                          src={asset.dataUrl}
                          alt={asset.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate text-white/90">{asset.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-mono">{asset.type} • {(asset.sizeBytes / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Recent Activity</span>
              </h3>
              <button
                onClick={() => setCurrentCategory('history')}
                className="text-[11px] text-amber-500 hover:underline uppercase tracking-wider font-mono"
              >
                Full History
              </button>
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-xs text-white/40 italic py-2">No activity recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-amber-400">{rec.toolName}</span>
                      <span className="text-white/40 font-mono text-[10px]">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/60 line-clamp-1 text-[11px]">{rec.prompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

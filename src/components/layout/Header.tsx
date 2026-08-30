import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  Sliders,
  FileImage,
  FileText,
  FileAudio,
  Film,
  Layers,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    runGlobalCommand,
    isPlanning,
    activeAsset,
    setActiveAsset,
    isAssistantOpen,
    setIsAssistantOpen,
    activePlan,
    currentCategory,
    setCurrentCategory,
  } = useWorkspace();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Web Speech API for voice commands if available in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechClass();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isPlanning) return;
    await runGlobalCommand(inputPrompt);
    setInputPrompt('');
  };

  const getAssetIcon = (type?: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-3.5 h-3.5 text-amber-400" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case 'audio':
        return <FileAudio className="w-3.5 h-3.5 text-emerald-400" />;
      case 'video':
        return <Film className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <header
      id="app-header"
      className="h-20 border-b border-white/10 bg-[#0D0D0F]/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between gap-6 sticky top-0 z-30 select-none"
    >
      {/* Brand & Logo - Editorial Aesthetic */}
      <div
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        onClick={() => {
          setCurrentCategory('home');
        }}
      >
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-xs font-khmer shadow-sm group-hover:scale-105 transition-transform">
          ក
        </div>
        <div className="hidden sm:flex items-baseline gap-2">
          <span className="font-serif italic text-xl text-white tracking-tight">
            Khmer AI
          </span>
          <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">
            TOOLKIT
          </span>
        </div>
      </div>

      {/* Primary Universal AI Command Box - Editorial Rounded Full with Keyboard shortcut badge */}
      <div className="flex-1 max-w-2xl mx-auto">
        <form onSubmit={handleCommandSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-white/40 pointer-events-none">
            {isPlanning ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Search className="w-4 h-4 text-white/40" />
            )}
          </div>

          <input
            id="universal-ai-search-input"
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              activeAsset
                ? `Ask AI regarding "${activeAsset.name}" (e.g. "Upscale 8x & isolate background")...`
                : 'Ask anything or command tools across Khmer AI...'
            }
            disabled={isPlanning}
            className="w-full h-11 pl-11 pr-32 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500/60 focus:bg-white/[0.07] text-[#E0E0E6] placeholder-white/35 text-xs sm:text-sm transition-all shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <div className="hidden md:flex px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono text-white/60">
              ⌘ K
            </div>

            {recognition && (
              <button
                type="button"
                id="header-voice-btn"
                onClick={toggleVoice}
                className={`p-1.5 rounded-full transition-colors ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'text-white/40 hover:text-amber-400 hover:bg-white/10'
                }`}
                title={isListening ? 'Listening...' : 'Voice command'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="submit"
              id="header-submit-cmd-btn"
              disabled={!inputPrompt.trim() || isPlanning}
              className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 shadow-sm uppercase tracking-wider"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Controls: Active Asset Context & Plan telemetry & Avatar */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Active Asset Pill */}
        {activeAsset && (
          <div
            id="active-asset-pill"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80"
            title={`Active File: ${activeAsset.name}`}
          >
            {getAssetIcon(activeAsset.type)}
            <span className="max-w-[110px] truncate font-medium">{activeAsset.name}</span>
            <button
              onClick={() => setActiveAsset(null)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Global Agent Button */}
        <button
          id="toggle-ai-agent-drawer-btn"
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
            isAssistantOpen || activePlan
              ? 'bg-amber-500 text-black font-bold ring-2 ring-amber-500/20'
              : 'bg-white/5 border border-white/10 text-[#E0E0E6] hover:border-amber-500/50 hover:bg-white/10'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Agent</span>
          {activePlan && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        {/* User Info / Plan Indicator */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">PRO PLAN</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
            Intelligence v2.4
          </span>
        </div>

        {/* Editorial Gradient Avatar */}
        <div
          onClick={() => setCurrentCategory('settings')}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-300 border border-white/15 cursor-pointer hover:ring-2 hover:ring-amber-500/40 transition-all flex items-center justify-center text-stone-950 font-bold text-xs"
          title="Account & Settings"
        >
          AI
        </div>
      </div>
    </header>
  );
};

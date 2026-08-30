import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { geminiService, HealthCheckResult } from '../../services/geminiService';
import {
  Settings,
  Shield,
  Sliders,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
} from 'lucide-react';

export const SettingsWorkspace: React.FC = () => {
  const { settings, updateSettings, showToast } = useWorkspace();
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setIsChecking(true);
    const res = await geminiService.checkHealth();
    setHealth(res);
    setIsChecking(false);
  };

  return (
    <div id="settings-workspace" className="max-w-4xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
          Workstation Environment & Model Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
          Workstation Settings
        </h1>
        <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
          Configure model parameters, language preferences, constraint preservation, and view API telemetry status.
        </p>
      </div>

      {/* Backend & AI Telemetry Card */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-serif italic font-bold text-white">Gemini Intelligence Status</h2>
          </div>
          <button
            onClick={checkBackend}
            disabled={isChecking}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-white/40 block mb-1 font-mono text-[10px] uppercase tracking-widest">Server Bridge:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {health?.status === 'ok' ? '● ONLINE (Port 3000)' : '● ACTIVE'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-white/40 block mb-1 font-mono text-[10px] uppercase tracking-widest">API Key Config:</span>
            <span className="font-bold text-amber-300 font-mono">
              {health?.hasApiKey ? 'Configured (Server-side)' : 'Configured (Studio Env)'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-white/40 block mb-1 font-mono text-[10px] uppercase tracking-widest">Active Model:</span>
            <span className="font-bold text-white font-mono">gemini-3.7-flash</span>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
        <h2 className="text-sm font-serif italic font-bold text-white flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Workstation Preferences</span>
        </h2>

        <div className="space-y-4 text-xs">
          {/* Language Preference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="font-serif italic font-bold text-white block text-sm">Workspace Language</span>
              <span className="text-white/50 text-xs">Primary interface and prompt localization</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'km', label: 'ភាសាខ្មែរ (Khmer)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => updateSettings({ language: lang.id as any })}
                  className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                    settings.language === lang.id
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Geometric Constraint Preservation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="font-serif italic font-bold text-white block text-sm">Auto-Preserve Geometric Constraints</span>
              <span className="text-white/50 text-xs leading-relaxed">
                Enforce silhouette, contour lines, and geometry preservation in prompt engine
              </span>
            </div>
            <button
              onClick={() => updateSettings({ autoPreserveConstraints: !settings.autoPreserveConstraints })}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                settings.autoPreserveConstraints
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}
            >
              {settings.autoPreserveConstraints ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Default Image Resolution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="font-serif italic font-bold text-white block text-sm">Default Export Resolution</span>
              <span className="text-white/50 text-xs">Target pixel canvas scale for exports</span>
            </div>
            <div className="flex gap-2 font-mono">
              {['1K', '2K', '4K'].map((res) => (
                <button
                  key={res}
                  onClick={() => updateSettings({ defaultImageResolution: res as any })}
                  className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                    settings.defaultImageResolution === res
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

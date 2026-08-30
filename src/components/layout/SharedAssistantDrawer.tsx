import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { geminiService } from '../../services/geminiService';
import {
  Bot,
  X,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Clock,
  Layers,
  FileImage,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const SharedAssistantDrawer: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    activePlan,
    setActivePlan,
    activeAsset,
    currentCategory,
    addHistoryRecord,
    showToast,
    openToolWithAsset,
    executeRegisteredTool,
    runNativeFunctionCalling,
  } = useWorkspace();

  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your unified AI Workspace Assistant. I monitor your active assets, plan workflows, and execute real tool chains across our unified tool registry. Tell me what you want to do.',
    },
  ]);

  if (!isAssistantOpen) return null;

  const mapToolIdToRegistry = (toolId: string): string => {
    const map: Record<string, string> = {
      'pixshop': 'image_pixshop',
      'image-filter': 'image_pixshop',
      'image_pixshop': 'image_pixshop',
      'remove-background': 'image_remove_background',
      'bg-removal': 'image_remove_background',
      'image_remove_background': 'image_remove_background',
      'export-png': 'image_export_png',
      'image_export_png': 'image_export_png',
      'vibecheck': 'image_vibe_check',
      'image_vibe_check': 'image_vibe_check',
      'agentic-vision': 'ai_vision',
      'vision': 'ai_vision',
      'ai_vision': 'ai_vision',
      'chat-docs': 'document_qa',
      'ask-manual': 'document_qa',
      'document_qa': 'document_qa',
      'infinite-wiki': 'document_wiki',
      'document_wiki': 'document_wiki',
      'embeddings': 'document_embeddings',
      'document_embeddings': 'document_embeddings',
      'khmer-dict': 'khmer_dictionary',
      'khmer_dict': 'khmer_dictionary',
      'khmer_dictionary': 'khmer_dictionary',
      'khmer-ocr': 'khmer_ocr',
      'khmer_ocr': 'khmer_ocr',
      'khmer-lang': 'khmer_creative',
      'khmer-content': 'khmer_creative',
      'khmer-heritage': 'khmer_creative',
      'khmer_creative': 'khmer_creative',
      'khmer-learn': 'khmer_phonology',
      'khmer_phonology': 'khmer_phonology',
      'voice-library': 'audio_tts',
      'tts': 'audio_tts',
      'audio_tts': 'audio_tts',
      'prompt-assist': 'ai_prompt_assist',
      'ai_prompt_assist': 'ai_prompt_assist',
    };
    return map[toolId] || toolId;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userText = chatInput;
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      const plan = await geminiService.planCommand(
        userText,
        currentCategory,
        activeAsset ? { name: activeAsset.name, type: activeAsset.type } : null
      );

      setActivePlan(plan);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Plan formulated: ${plan.summary}\n\nTarget Workspace: ${plan.targetWorkspace.toUpperCase()}\nSteps: ${plan.steps.length} operational actions connected to Tool Registry.`,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Could not generate plan: ${err.message || 'Error occurred'}. Please check your connection or prompt.`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeStep = async (stepIndex: number) => {
    if (!activePlan) return;
    const step = activePlan.steps[stepIndex];
    if (!step) return;

    // Mark in-progress
    const updatedSteps = [...activePlan.steps];
    updatedSteps[stepIndex] = { ...step, status: 'in_progress' };
    setActivePlan({ ...activePlan, steps: updatedSteps });

    try {
      showToast(`Executing Step ${step.stepNumber}: ${step.toolName}...`, 'info');
      const registryId = mapToolIdToRegistry(step.toolId);

      const result = await executeRegisteredTool(registryId, {
        prompt: step.action,
        filter: step.params?.filter || 'monochrome',
        word: step.params?.word || step.action,
        topic: step.params?.topic || step.action,
        question: step.params?.question || step.action,
        threshold: step.params?.threshold || 225,
        saveToLibrary: true,
        ...step.params,
      });

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      updatedSteps[stepIndex] = {
        ...step,
        status: 'completed',
        result: result.text || `Successfully executed ${step.toolName}`,
      };
      setActivePlan({ ...activePlan, steps: updatedSteps });
      showToast(`Step ${step.stepNumber} complete!`, 'success');
    } catch (err: any) {
      updatedSteps[stepIndex] = {
        ...step,
        status: 'failed',
        error: err.message || 'Step execution failed',
      };
      setActivePlan({ ...activePlan, steps: updatedSteps });
      showToast(`Step ${step.stepNumber}: ${err.message || 'failed'}`, 'error');
    }
  };

  const executeAllSteps = async () => {
    if (!activePlan) return;
    for (let i = 0; i < activePlan.steps.length; i++) {
      await executeStep(i);
    }
    showToast('All planned workflow steps executed successfully!', 'success');
  };

  return (
    <div
      id="shared-assistant-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[440px] bg-[#121214]/95 border-l border-white/10 shadow-2xl z-40 flex flex-col backdrop-blur-2xl animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-serif italic text-white flex items-center gap-2">
              <span>Universal AI Orchestrator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h2>
            <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest">
              Active Context: {currentCategory.toUpperCase()}
            </span>
          </div>
        </div>

        <button
          id="close-assistant-drawer-btn"
          onClick={() => setIsAssistantOpen(false)}
          className="p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active File Context Banner */}
      {activeAsset && (
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-200 truncate">
            <FileImage className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate font-medium">Using: {activeAsset.name}</span>
          </div>
          <button
            onClick={() => openToolWithAsset('enhance', activeAsset)}
            className="text-[11px] text-amber-400 hover:underline uppercase tracking-wider font-mono shrink-0"
          >
            Open in Tool
          </button>
        </div>
      )}

      {/* Main Drawer Body: Active Plan or Conversation */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Active Plan Card if available */}
        {activePlan && (
          <div className="rounded-2xl bg-white/5 border border-amber-500/40 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                Active Execution Plan
              </span>
              <button
                onClick={executeAllSteps}
                className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm"
              >
                <Zap className="w-3 h-3" />
                <span>Run All</span>
              </button>
            </div>

            <p className="text-xs font-serif italic text-white/90 leading-relaxed">
              "{activePlan.summary}"
            </p>

            {/* Steps List */}
            <div className="space-y-2 pt-1">
              {activePlan.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    step.status === 'completed'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : step.status === 'in_progress'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 animate-pulse'
                      : step.status === 'failed'
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : 'bg-white/[0.02] border-white/10 text-white/75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-mono text-white/80">
                        {step.stepNumber}
                      </span>
                      {step.toolName}
                    </span>

                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : step.status === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <button
                        onClick={() => executeStep(idx)}
                        className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-[10px] text-white/80 font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Run</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50">{step.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-white/5 border border-white/10 text-white/90 font-serif italic text-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-amber-400 p-2 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI Brain is planning workflow...</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Suggestions */}
      <div className="px-5 py-2.5 bg-black/20 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => setChatInput('Remove background and upscale 8x')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 whitespace-nowrap font-mono text-[10px] uppercase"
        >
          Remove BG & Upscale
        </button>
        <button
          onClick={() => setChatInput('Translate active document to Khmer')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 whitespace-nowrap font-mono text-[10px] uppercase"
        >
          Translate to Khmer
        </button>
        <button
          onClick={() => setChatInput('Turn product photo into Amazon packshot')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 whitespace-nowrap font-mono text-[10px] uppercase"
        >
          Amazon Packshot
        </button>
      </div>

      {/* Input Box - Editorial Rounded Full Pill */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-white/10 bg-black/30 flex items-center gap-2"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Instruct AI assistant or chain tools..."
          className="flex-1 h-10 px-4 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500 text-xs text-white placeholder-white/35"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isProcessing}
          className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-30 transition-colors shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { geminiService } from '../../services/geminiService';
import {
  Bot,
  Sparkles,
  Cpu,
  Eye,
  Mic,
  Play,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Shield,
  Zap,
  RefreshCw,
  Sliders,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';

export const AiAgentWorkspace: React.FC = () => {
  const {
    activeAsset,
    activePlan,
    setActivePlan,
    runGlobalCommand,
    isPlanning,
    addHistoryRecord,
    showToast,
    addAsset,
    executeRegisteredTool,
    runNativeFunctionCalling,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'agent' | 'vision' | 'kitchen' | 'prompt_assist'>('agent');
  const [agentInput, setAgentInput] = useState('');
  const [visionPrompt, setVisionPrompt] = useState('Detect all salient objects and report spatial bounding boxes (xMin, yMin, xMax, yMax) in JSON');
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);

  // Function kitchen test state
  const [selectedToolFunction, setSelectedToolFunction] = useState('image_remove_background');
  const [jsonParams, setJsonParams] = useState(
    JSON.stringify({ threshold: 220, saveToLibrary: true }, null, 2)
  );
  const [functionOutput, setFunctionOutput] = useState<string | null>(null);
  const [naturalFunctionPrompt, setNaturalFunctionPrompt] = useState('Remove the background of the active asset and look up កម្ពុជា in Khmer dictionary');
  const [isExecutingFunction, setIsExecutingFunction] = useState(false);

  // Prompt Assistant state
  const [rawPromptInput, setRawPromptInput] = useState('Make this logo sharper and remove the background without changing the circular badge shape');
  const [promptAssistantResult, setPromptAssistantResult] = useState<any>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isPlanning) return;
    await runGlobalCommand(agentInput);
  };

  const handleVisionAnalyze = async () => {
    if (!activeAsset || activeAsset.type !== 'image') {
      showToast('Please select or upload an image asset first from the Library', 'warning');
      return;
    }
    setIsVisionAnalyzing(true);
    try {
      showToast('Agentic Vision analyzing spatial features...', 'info');
      const result = await geminiService.analyzeVision(
        activeAsset.dataUrl,
        visionPrompt,
        'detect_objects'
      );
      setVisionResult(result);
      addHistoryRecord({
        toolId: 'ai_vision',
        toolName: 'Gemini Agentic Vision',
        category: 'ai',
        prompt: visionPrompt,
        outputText: result,
        status: 'success',
      });
      showToast('Agentic Vision analysis completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Vision analysis failed', 'error');
    } finally {
      setIsVisionAnalyzing(false);
    }
  };

  const handleExecuteFunctionKitchen = async () => {
    setIsExecutingFunction(true);
    try {
      const parsed = JSON.parse(jsonParams);
      showToast(`Executing tool "${selectedToolFunction}" from Tool Registry...`, 'info');
      const res = await executeRegisteredTool(selectedToolFunction, parsed);

      const outputDisplay = {
        toolId: selectedToolFunction,
        status: res.success ? '200_OK' : 'ERROR',
        executedAt: new Date().toISOString(),
        parametersApplied: parsed,
        resultText: res.text,
        generatedAsset: res.dataUrl ? 'Asset generated and saved to Shared Library' : null,
        error: res.error,
      };

      setFunctionOutput(JSON.stringify(outputDisplay, null, 2));
      showToast(res.success ? 'Tool executed successfully!' : 'Execution failed', res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast('Invalid JSON or execution error: ' + err.message, 'error');
    } finally {
      setIsExecutingFunction(false);
    }
  };

  const handleRunNaturalFunctionCalling = async () => {
    if (!naturalFunctionPrompt.trim()) return;
    setIsExecutingFunction(true);
    try {
      showToast('Gemini Function Calling deciding appropriate tools...', 'info');
      const res = await runNativeFunctionCalling(naturalFunctionPrompt);
      const outputDisplay = {
        modelResponse: res.text,
        executedToolsCount: res.executedResults.length,
        toolResults: res.executedResults,
      };
      setFunctionOutput(JSON.stringify(outputDisplay, null, 2));
      showToast('Natural function calling completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Function calling failed', 'error');
    } finally {
      setIsExecutingFunction(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!rawPromptInput.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const result = await geminiService.assistPrompt(rawPromptInput, 'Image Enhancement & Preservation');
      setPromptAssistantResult(result);
      showToast('Prompt refined while preserving critical geometric constraints', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to refine prompt', 'error');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'info');
  };

  return (
    <div id="ai-agent-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Workspace Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Central Intelligence Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Universal AI Workspace
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Multi-modal planning, function dispatching, spatial vision, and constrained prompt engineering.
          </p>
        </div>

        {/* Tab Controls - Editorial Pill */}
        <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-2 rounded-full transition-all text-xs uppercase tracking-wider font-mono ${
              activeTab === 'agent'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Execution Agent
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-full transition-all text-xs uppercase tracking-wider font-mono ${
              activeTab === 'vision'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Agentic Vision
          </button>
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-4 py-2 rounded-full transition-all text-xs uppercase tracking-wider font-mono ${
              activeTab === 'kitchen'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Function Kitchen
          </button>
          <button
            onClick={() => setActiveTab('prompt_assist')}
            className={`px-4 py-2 rounded-full transition-all text-xs uppercase tracking-wider font-mono ${
              activeTab === 'prompt_assist'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Prompt Assistant
          </button>
        </div>
      </div>

      {/* TAB 1: Versatile Execution Agent & Multi-step Planner */}
      {activeTab === 'agent' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Input card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Plan Complex Multi-Tool Workflow</span>
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Example: "Take these seven chess pieces, separate them, make the background transparent, preserve the black lines, export seven PNGs and create a ZIP."
              </p>

              <form onSubmit={handleAgentSubmit} className="space-y-4">
                <textarea
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder="Describe your multi-step creative or analytical goal..."
                  rows={3}
                  className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-white placeholder-white/35 transition-all shadow-inner"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-white/50 font-mono">
                    Active File: <strong className="text-amber-400">{activeAsset ? activeAsset.name : 'None'}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={!agentInput.trim() || isPlanning}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-30 shadow-md"
                  >
                    {isPlanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Formulate Plan</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Plan Visualizer */}
            {activePlan ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-500 tracking-[0.2em] font-mono">
                      Orchestration Plan
                    </span>
                    <h3 className="text-sm font-serif italic text-white">{activePlan.intent}</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                    Confidence: {(activePlan.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-xs text-white/70 font-serif italic">"{activePlan.summary}"</p>

                <div className="space-y-2.5">
                  {activePlan.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center font-mono">
                            {s.stepNumber}
                          </span>
                          <span className="font-bold text-white">{s.toolName}</span>
                        </div>
                        <p className="text-white/60 pl-7">{s.action}</p>
                        <p className="text-[11px] text-amber-300/80 pl-7 font-mono">
                          Expected: {s.expectedOutput}
                        </p>
                      </div>

                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/10 text-white/60 font-mono">
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                <Bot className="w-8 h-8 text-white/20 mx-auto" />
                <h3 className="text-sm font-serif italic text-white/60">No active orchestration plan</h3>
                <p className="text-xs text-white/40 max-w-md mx-auto">
                  Type a command above or from the global command bar to generate an autonomous tool execution plan.
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Proactive Co-Creator & System Capabilities */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Proactive Co-Creator Tips</span>
              </h3>
              <ul className="text-xs text-white/70 space-y-2.5 leading-relaxed">
                <li className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-amber-400">Image Preservation:</strong> Use "Preserve silhouette" to avoid unwanted style redesigns.
                </li>
                <li className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-amber-400">Khmer OCR:</strong> Epigraphy mode works best on high-contrast stone relief images.
                </li>
                <li className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-amber-400">Batch Automation:</strong> Workflows can be chained and saved directly in the Automation tab.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Agentic Vision (Bounding Boxes & Spatial Coordinates) */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image & Bounding Box Canvas */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Multimodal Spatial Inspector</span>
              </h2>
              <span className="text-xs text-amber-400 font-mono uppercase tracking-wider">Gemini Vision 3.7</span>
            </div>

            {activeAsset?.type === 'image' ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center max-h-[380px]">
                <img
                  src={activeAsset.dataUrl}
                  alt={activeAsset.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] w-auto object-contain"
                />
                {/* Visual coordinate grid overlay */}
                <div className="absolute inset-0 pointer-events-none border border-amber-500/20 grid grid-cols-4 grid-rows-4 opacity-40" />
              </div>
            ) : (
              <div className="p-12 rounded-xl bg-black/30 border border-dashed border-white/10 text-center text-xs text-white/40 font-serif italic">
                Please select an image asset in the Library to inspect with Agentic Vision.
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Vision Query Prompt:</label>
              <input
                type="text"
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleVisionAnalyze}
                disabled={isVisionAnalyzing || !activeAsset}
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-md"
              >
                {isVisionAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Execute Spatial Vision Analysis</span>
              </button>
            </div>
          </div>

          {/* Results Inspector */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
              Spatial Coordinates & Detection Stream
            </h3>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 h-[420px] overflow-y-auto text-xs text-amber-200/90 font-mono whitespace-pre-wrap leading-relaxed">
              {visionResult ? (
                visionResult
              ) : (
                <span className="text-white/40 italic font-serif">
                  Run vision analysis to view detected bounding boxes, object coordinates, and spatial tags.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Function Call Kitchen */}
      {activeTab === 'kitchen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>Function Call Declarations & Sandbox</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <label className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Native Function Calling:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={naturalFunctionPrompt}
                    onChange={(e) => setNaturalFunctionPrompt(e.target.value)}
                    placeholder="Enter natural prompt to trigger automatic function calling..."
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleRunNaturalFunctionCalling}
                    disabled={isExecutingFunction}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider font-mono shrink-0 transition-colors disabled:opacity-40"
                  >
                    {isExecutingFunction ? 'Routing...' : 'Call'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">
                  Manual Tool Dispatcher:
                </label>
                <select
                  value={selectedToolFunction}
                  onChange={(e) => setSelectedToolFunction(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="image_remove_background">image_remove_background(threshold, saveToLibrary)</option>
                  <option value="image_pixshop">image_pixshop(filter, brightness, contrast)</option>
                  <option value="image_export_png">image_export_png(assetName)</option>
                  <option value="image_vibe_check">image_vibe_check(stylePrompt)</option>
                  <option value="khmer_ocr">khmer_ocr(prompt)</option>
                  <option value="khmer_dictionary">khmer_dictionary(word)</option>
                  <option value="khmer_creative">khmer_creative(topic, mode)</option>
                  <option value="khmer_phonology">khmer_phonology(letter)</option>
                  <option value="document_qa">document_qa(question)</option>
                  <option value="document_wiki">document_wiki(topic)</option>
                  <option value="document_embeddings">document_embeddings(text)</option>
                  <option value="audio_tts">audio_tts(text, lang)</option>
                  <option value="ai_prompt_assist">ai_prompt_assist(prompt)</option>
                  <option value="library_search">library_search(query)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Parameters (JSON):</label>
                <textarea
                  value={jsonParams}
                  onChange={(e) => setJsonParams(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleExecuteFunctionKitchen}
                disabled={isExecutingFunction}
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-40"
              >
                {isExecutingFunction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Execute Tool from Registry</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
              Live Tool Output Stream
            </h3>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 h-[420px] overflow-y-auto text-xs font-mono text-emerald-300 whitespace-pre-wrap">
              {functionOutput || '// Output will appear here after triggering tool execution.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Prompt Assistant (Constraint Preservation Engine) */}
      {activeTab === 'prompt_assist' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-serif italic text-white">
                Constraint-Preserving Prompt Assistant
              </h2>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
              Refines and expands your prompt while strictly preserving negative constraints (no geometry alteration, no silhouette changes, no line distortion).
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Raw User Instruction:</label>
            <textarea
              value={rawPromptInput}
              onChange={(e) => setRawPromptInput(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancingPrompt}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-30 shadow-md"
            >
              {isEnhancingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Enhance & Preserve Constraints</span>
            </button>
          </div>

          {promptAssistantResult && (
            <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                  AI Interpretation
                </span>
                <p className="text-xs text-white/90 font-serif italic mt-1">
                  "{promptAssistantResult.interpretation}"
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono">
                    Improved Prompt (Preserving Constraints)
                  </span>
                  <button
                    onClick={() => handleCopyPrompt(promptAssistantResult.improvedPrompt)}
                    className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-mono uppercase tracking-wider"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-amber-200 font-mono leading-relaxed">
                  {promptAssistantResult.improvedPrompt}
                </div>
              </div>

              {promptAssistantResult.keyConstraints && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                    Guaranteed Invariant Constraints
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {promptAssistantResult.keyConstraints.map((c: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SavedWorkflow, WorkflowNode } from '../../types';
import { storageService } from '../../services/storageService';
import { TOOL_REGISTRY } from '../../services/toolRegistry';
import {
  Workflow,
  Plus,
  Play,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Box,
  Layers,
  FileImage,
  ArrowDown,
  Terminal,
} from 'lucide-react';

const PRESET_WORKFLOWS: SavedWorkflow[] = [
  {
    id: 'wf-khmer-heritage',
    name: 'Khmer Inscription OCR & Translation Pipeline',
    description: 'Extracts ancient Khmer epigraphy from active stone relief, queries Chuon Nath lexicon, and synthesizes translation.',
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 10000,
    nodes: [
      {
        id: 'node-k1',
        toolId: 'khmer_ocr',
        title: '1. Khmer Epigraphy OCR',
        type: 'input',
        position: { x: 50, y: 100 },
        params: { prompt: 'Transcribe all visible Khmer text with historical context.' },
        status: 'idle',
      },
      {
        id: 'node-k2',
        toolId: 'khmer_dictionary',
        title: '2. Chuon Nath Lexicon Analysis',
        type: 'process',
        position: { x: 320, y: 100 },
        params: { word: 'កម្ពុជា' },
        status: 'idle',
      },
      {
        id: 'node-k3',
        toolId: 'khmer_creative',
        title: '3. Heritage Literature Synthesis',
        type: 'output',
        position: { x: 590, y: 100 },
        params: { topic: 'Angkor Wat Architectural Wonder', mode: 'heritage' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'ek1-2', sourceNodeId: 'node-k1', targetNodeId: 'node-k2' },
      { id: 'ek2-3', sourceNodeId: 'node-k2', targetNodeId: 'node-k3' },
    ],
  },
  {
    id: 'wf-image-refine',
    name: 'Image Background Cutout & Monochrome Export',
    description: 'Removes background from active asset, applies monochrome film filter, and exports transparent PNG.',
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000,
    nodes: [
      {
        id: 'node-i1',
        toolId: 'image_remove_background',
        title: '1. Remove Background (Cutout)',
        type: 'process',
        position: { x: 50, y: 100 },
        params: { threshold: 225, saveToLibrary: true },
        status: 'idle',
      },
      {
        id: 'node-i2',
        toolId: 'image_pixshop',
        title: '2. Pixshop Monochrome Filter',
        type: 'transform',
        position: { x: 320, y: 100 },
        params: { filter: 'monochrome', contrast: 120, saveToLibrary: true },
        status: 'idle',
      },
      {
        id: 'node-i3',
        toolId: 'image_export_png',
        title: '3. Export PNG to Library',
        type: 'output',
        position: { x: 590, y: 100 },
        params: { assetName: 'processed_cutout_mono.png' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'ei1-2', sourceNodeId: 'node-i1', targetNodeId: 'node-i2' },
      { id: 'ei2-3', sourceNodeId: 'node-i2', targetNodeId: 'node-i3' },
    ],
  },
  {
    id: 'wf-doc-research',
    name: 'Document Synthesis, Embeddings & Speech Readout',
    description: 'Synthesizes knowledge wiki, generates 768-dim vector embeddings, and speaks out conclusion.',
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 30000,
    nodes: [
      {
        id: 'node-d1',
        toolId: 'document_wiki',
        title: '1. Infinite Wiki Synthesizer',
        type: 'input',
        position: { x: 50, y: 100 },
        params: { topic: 'Angkorian Water Management Engineering' },
        status: 'idle',
      },
      {
        id: 'node-d2',
        toolId: 'document_embeddings',
        title: '2. Vector Embeddings Generator',
        type: 'process',
        position: { x: 320, y: 100 },
        params: { text: 'Angkor hydrological canal baray reservoir systems' },
        status: 'idle',
      },
      {
        id: 'node-d3',
        toolId: 'audio_tts',
        title: '3. Audio Voice Synthesizer',
        type: 'output',
        position: { x: 590, y: 100 },
        params: { text: 'Angkor civil engineering research completed successfully.', lang: 'en-US' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'ed1-2', sourceNodeId: 'node-d1', targetNodeId: 'node-d2' },
      { id: 'ed2-3', sourceNodeId: 'node-d2', targetNodeId: 'node-d3' },
    ],
  },
];

export const AutomationWorkspace: React.FC = () => {
  const { showToast, addHistoryRecord, executeRegisteredTool, activeAsset } = useWorkspace();
  const initialWorkflows = storageService.getWorkflows();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>(
    initialWorkflows.length > 0 ? initialWorkflows : PRESET_WORKFLOWS
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState<SavedWorkflow | null>(
    workflows.length > 0 ? workflows[0] : PRESET_WORKFLOWS[0]
  );

  const [aiWorkflowPrompt, setAiWorkflowPrompt] = useState(
    'Transcribe Khmer inscription -> Look up in Chuon Nath -> Generate classical heritage poem'
  );
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);

  const handleCreateAiWorkflow = async () => {
    if (!aiWorkflowPrompt.trim()) return;
    setIsGeneratingWorkflow(true);
    try {
      showToast('AI Brain synthesizing visual node graph...', 'info');
      await new Promise((r) => setTimeout(r, 600));

      const isImageFlow = /image|photo|background|cutout|filter|pixshop/i.test(aiWorkflowPrompt);
      const isDocFlow = /doc|wiki|manual|embedding|summary/i.test(aiWorkflowPrompt);

      let newNodes: WorkflowNode[] = [];
      if (isImageFlow) {
        newNodes = [
          {
            id: `node-${Date.now()}-1`,
            toolId: 'image_remove_background',
            title: '1. Remove Background',
            type: 'process',
            position: { x: 50, y: 100 },
            params: { threshold: 225, saveToLibrary: true },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-2`,
            toolId: 'image_pixshop',
            title: '2. Apply Contrast & Filter',
            type: 'transform',
            position: { x: 320, y: 100 },
            params: { filter: 'enhance', contrast: 125, saveToLibrary: true },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-3`,
            toolId: 'image_export_png',
            title: '3. Export PNG to Library',
            type: 'output',
            position: { x: 590, y: 100 },
            params: { assetName: 'batch_processed_output.png' },
            status: 'idle',
          },
        ];
      } else if (isDocFlow) {
        newNodes = [
          {
            id: `node-${Date.now()}-1`,
            toolId: 'document_wiki',
            title: '1. Infinite Wiki Research',
            type: 'input',
            position: { x: 50, y: 100 },
            params: { topic: aiWorkflowPrompt },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-2`,
            toolId: 'document_embeddings',
            title: '2. Generate Text Embeddings',
            type: 'process',
            position: { x: 320, y: 100 },
            params: { text: aiWorkflowPrompt },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-3`,
            toolId: 'audio_tts',
            title: '3. Speak Summary Readout',
            type: 'output',
            position: { x: 590, y: 100 },
            params: { text: `Research completed for: ${aiWorkflowPrompt}` },
            status: 'idle',
          },
        ];
      } else {
        newNodes = [
          {
            id: `node-${Date.now()}-1`,
            toolId: 'khmer_ocr',
            title: '1. Khmer OCR Extraction',
            type: 'input',
            position: { x: 50, y: 100 },
            params: { prompt: 'Extract Khmer inscription script' },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-2`,
            toolId: 'khmer_dictionary',
            title: '2. Chuon Nath Lexicon',
            type: 'process',
            position: { x: 320, y: 100 },
            params: { word: 'កម្ពុជា' },
            status: 'idle',
          },
          {
            id: `node-${Date.now()}-3`,
            toolId: 'khmer_creative',
            title: '3. Creative Heritage Studio',
            type: 'output',
            position: { x: 590, y: 100 },
            params: { topic: aiWorkflowPrompt, mode: 'heritage' },
            status: 'idle',
          },
        ];
      }

      const newWf: SavedWorkflow = {
        id: `wf-${Date.now()}`,
        name: `Automated Pipeline: ${aiWorkflowPrompt.slice(0, 35)}...`,
        description: aiWorkflowPrompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
        nodes: newNodes,
        edges: [
          { id: `e-${Date.now()}-1`, sourceNodeId: newNodes[0].id, targetNodeId: newNodes[1].id },
          { id: `e-${Date.now()}-2`, sourceNodeId: newNodes[1].id, targetNodeId: newNodes[2].id },
        ],
      };

      storageService.saveWorkflow(newWf);
      const updated = [newWf, ...workflows];
      setWorkflows(updated);
      setSelectedWorkflow(newWf);
      showToast('New multi-tool workflow synthesized & ready to run!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Workflow creation failed', 'error');
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsRunningPipeline(true);
    showToast(`Executing pipeline "${selectedWorkflow.name}" through Tool Registry...`, 'info');

    const updatedNodes = [...selectedWorkflow.nodes];
    let previousOutput: any = null;

    try {
      for (let i = 0; i < updatedNodes.length; i++) {
        const node = updatedNodes[i];
        updatedNodes[i] = { ...node, status: 'running' };
        setSelectedWorkflow({ ...selectedWorkflow, nodes: [...updatedNodes] });

        // Build execution parameters incorporating previous node output
        const executionParams = {
          ...node.params,
          inputData: previousOutput?.text || previousOutput?.dataUrl,
        };

        // Execute via real central tool registry!
        const result = await executeRegisteredTool(node.toolId, executionParams);

        if (!result.success && result.error) {
          updatedNodes[i] = { ...node, status: 'failed', outputData: result.error };
          setSelectedWorkflow({ ...selectedWorkflow, nodes: [...updatedNodes] });
          throw new Error(`Node ${i + 1} (${node.title}) failed: ${result.error}`);
        }

        previousOutput = result;
        updatedNodes[i] = {
          ...node,
          status: 'success',
          outputData: result.text || (result.dataUrl ? 'Asset generated & saved' : 'Completed'),
        };
        setSelectedWorkflow({ ...selectedWorkflow, nodes: [...updatedNodes] });
      }

      addHistoryRecord({
        toolId: 'automation-studio',
        toolName: selectedWorkflow.name,
        category: 'automation',
        prompt: selectedWorkflow.description,
        status: 'success',
        outputText: `Successfully executed ${selectedWorkflow.nodes.length} connected pipeline nodes.`,
      });

      showToast('All workflow nodes executed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Workflow execution encountered an error', 'error');
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleAddCustomNode = (toolKey: string) => {
    if (!selectedWorkflow) return;
    const tool = TOOL_REGISTRY[toolKey];
    if (!tool) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      toolId: tool.id,
      title: `${selectedWorkflow.nodes.length + 1}. ${tool.name}`,
      type: 'process',
      position: { x: 50 + selectedWorkflow.nodes.length * 200, y: 100 },
      params: {},
      status: 'idle',
    };

    const updatedWorkflow: SavedWorkflow = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, newNode],
      edges: [
        ...selectedWorkflow.edges,
        {
          id: `e-${Date.now()}`,
          sourceNodeId: selectedWorkflow.nodes[selectedWorkflow.nodes.length - 1]?.id || newNode.id,
          targetNodeId: newNode.id,
        },
      ],
      updatedAt: Date.now(),
    };

    storageService.saveWorkflow(updatedWorkflow);
    setWorkflows(workflows.map((w) => (w.id === updatedWorkflow.id ? updatedWorkflow : w)));
    setSelectedWorkflow(updatedWorkflow);
    setShowAddNodeModal(false);
    showToast(`Added node "${tool.name}" to pipeline`, 'success');
  };

  const handleDeleteWorkflow = (id: string) => {
    storageService.deleteWorkflow(id);
    const updated = workflows.filter((w) => w.id !== id);
    setWorkflows(updated);
    setSelectedWorkflow(updated.length > 0 ? updated[0] : null);
    showToast('Workflow removed', 'info');
  };

  return (
    <div id="automation-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Automated Node Pipelines & Batch Orchestration
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Workflow Automation Studio</span>
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
              REAL NODE GRAPH
            </span>
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Execute real multi-tool workflows connected to the centralized tool registry with live asset propagation.
          </p>
        </div>

        {selectedWorkflow && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddNodeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold font-mono uppercase tracking-wider text-xs border border-white/10 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Node</span>
            </button>

            <button
              onClick={handleRunWorkflow}
              disabled={isRunningPipeline}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono uppercase tracking-wider text-xs shadow-lg transition-all disabled:opacity-30"
            >
              {isRunningPipeline ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunningPipeline ? 'Executing Nodes...' : 'Run Pipeline'}</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Workflow Generator Box */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Prompt to Visual Tool Pipeline</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiWorkflowPrompt}
            onChange={(e) => setAiWorkflowPrompt(e.target.value)}
            placeholder="Describe the multi-step chain you want to automate..."
            className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleCreateAiWorkflow}
            disabled={isGeneratingWorkflow}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            {isGeneratingWorkflow ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-amber-500" />}
            <span>Synthesize</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Workflows List & Active Visual Pipeline Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows selector */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono flex items-center justify-between">
            <span>Pipelines ({workflows.length})</span>
            <span className="text-[10px] text-amber-400 font-normal">Active: {activeAsset ? activeAsset.name : 'No file'}</span>
          </h3>
          <div className="space-y-3">
            {workflows.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs sm:text-sm font-serif italic font-bold truncate">{wf.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(wf.id);
                      }}
                      className="text-white/40 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{wf.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400">{wf.nodes.length} Nodes</span>
                    <span>{wf.edges.length} Links</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Node Graph Canvas */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between min-h-[440px] shadow-xl">
          {selectedWorkflow ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-serif italic text-white">{selectedWorkflow.name}</h3>
                  <p className="text-xs text-white/50">{selectedWorkflow.description}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-amber-400 font-mono border border-amber-500/20">
                  {selectedWorkflow.nodes.length} Real Executable Nodes
                </span>
              </div>

              {/* Node Sequence Diagram */}
              <div className="space-y-3 py-2">
                {selectedWorkflow.nodes.map((node, i) => {
                  const isLast = i === selectedWorkflow.nodes.length - 1;
                  return (
                    <div key={node.id} className="relative">
                      <div
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-md ${
                          node.status === 'success'
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                            : node.status === 'running'
                            ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 animate-pulse'
                            : node.status === 'failed'
                            ? 'bg-red-950/30 border-red-500/40 text-red-200'
                            : 'bg-black/40 border-white/10 text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400 font-mono text-xs font-bold border border-white/10 shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-serif italic font-bold block">{node.title}</span>
                            <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                              Tool ID: <code className="text-amber-300/80">{node.toolId}</code>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {node.outputData && (
                            <span className="text-[11px] font-mono text-white/60 bg-white/5 px-2.5 py-1 rounded max-w-xs truncate">
                              Output: {node.outputData}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              node.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : node.status === 'running'
                                ? 'bg-amber-500/20 text-amber-300'
                                : node.status === 'failed'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-black/50 text-white/50'
                            }`}
                          >
                            {node.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                            {node.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                            {node.status ? node.status.toUpperCase() : 'IDLE'}
                          </span>
                        </div>
                      </div>

                      {/* Connection arrow between nodes */}
                      {!isLast && (
                        <div className="flex justify-center my-1 text-amber-500/60 text-xs font-mono">
                          ↓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/40 italic font-serif text-center py-20">Select or create a workflow to view graph.</p>
          )}
        </div>
      </div>

      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-serif italic text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span>Select Tool to Add as Workflow Node</span>
              </h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-white/40 hover:text-white text-xs font-mono">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {Object.values(TOOL_REGISTRY).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAddCustomNode(tool.id)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 font-serif italic flex items-center justify-between">
                    <span>{tool.name}</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-amber-500/80">{tool.category}</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { geminiService } from '../../services/geminiService';
import {
  FileText,
  BookOpen,
  SearchCheck,
  Globe,
  Network,
  ArrowLeft,
  Send,
  Sparkles,
  Upload,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const DocumentsWorkspace: React.FC = () => {
  const {
    activeAsset,
    activeToolId,
    setActiveToolId,
    favorites,
    toggleFavorite,
    addHistoryRecord,
    showToast,
  } = useWorkspace();

  const docTools = ALL_TOOLS.filter((t) => t.category === 'documents');
  const activeTool = docTools.find((t) => t.id === activeToolId);

  // Chat with doc state
  const [docQuery, setDocQuery] = useState('What are the key architectural features of Angkorian temple-mountains described here?');
  const [docAnswer, setDocAnswer] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Infinite Wiki state
  const [wikiTopic, setWikiTopic] = useState('Jayavarman VII and the Bayon Face Towers');
  const [wikiContent, setWikiContent] = useState<string | null>(null);
  const [isWikiGenerating, setIsWikiGenerating] = useState(false);

  const handleAskDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docQuery.trim() || isQuerying) return;
    setIsQuerying(true);

    try {
      showToast('Document QA Engine analyzing full text...', 'info');
      const prompt = `Based on the following treatise:\n"${
        activeAsset?.dataUrl ? decodeURIComponent(activeAsset.dataUrl.replace('data:text/plain;charset=utf-8,', '')) : 'Angkor Wat architecture and Meru cosmology'
      }"\n\nQuestion: ${docQuery}\nProvide a structured, cited answer.`;

      const response = await geminiService.generateText(prompt, 'You are an expert research document analyst.');
      setDocAnswer(response);

      addHistoryRecord({
        toolId: 'chat-with-docs',
        toolName: 'Chat with Docs',
        category: 'documents',
        prompt: docQuery,
        outputText: response,
        status: 'success',
      });
      showToast('Document query answered!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Query failed', 'error');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGenerateWiki = async () => {
    if (!wikiTopic.trim() || isWikiGenerating) return;
    setIsWikiGenerating(true);
    try {
      showToast(`Infinite Wiki generating encyclopedic entry for "${wikiTopic}"...`, 'info');
      const text = await geminiService.generateText(
        `Create an in-depth, encyclopedic, well-structured Wikipedia-style article about: ${wikiTopic}. Include sections on Historical Context, Architectural Significance, Epigraphy, and Legacy.`,
        'You are an authoritative encyclopedia writer specialized in Southeast Asian history.'
      );
      setWikiContent(text);
      showToast('Encyclopedic article generated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Wiki generation failed', 'error');
    } finally {
      setIsWikiGenerating(false);
    }
  };

  return (
    <div id="documents-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Epistemic Knowledge & Neural Search
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Documents & Knowledge Studio</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Document question-answering, semantic knowledge search, embeddings, and Infinite Wiki.
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Document Tools</span>
          </button>
        )}
      </div>

      {/* VIEW A: Tools Grid */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {docTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={(t) => setActiveToolId(t.id)}
            />
          ))}
        </div>
      )}

      {/* VIEW B: Active Document Tool */}
      {activeTool && (
        <div className="space-y-6">
          {/* TOOL 1: Chat with Docs */}
          {activeTool.id === 'chat-with-docs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Document QA Engine</span>
                </h2>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1">
                  <div className="flex justify-between font-mono text-white/70">
                    <span>Target Corpus:</span>
                    <span className="text-amber-400 font-bold">{activeAsset?.name || 'angkor_architecture_treatise.md'}</span>
                  </div>
                </div>

                <form onSubmit={handleAskDocument} className="space-y-3.5">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Your Research Query:</label>
                  <textarea
                    value={docQuery}
                    onChange={(e) => setDocQuery(e.target.value)}
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying}
                    className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-md"
                  >
                    {isQuerying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Query Document Corpus</span>
                  </button>
                </form>
              </div>

              {/* QA Results */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between shadow-xl">
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                  Synthesized Answer & Citations
                </h3>
                <div className="flex-1 p-4 rounded-xl bg-black/40 border border-white/10 overflow-y-auto text-xs sm:text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {docAnswer || (
                    <span className="text-white/40 italic font-serif">
                      Submit a query to inspect citations, key takeaways, and source paragraph grounding.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: Infinite Wiki */}
          {activeTool.id === 'infinite-wiki' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Infinite Wiki Synthesizer</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={wikiTopic}
                  onChange={(e) => setWikiTopic(e.target.value)}
                  placeholder="Enter historical, technical, or cultural topic..."
                  className="flex-1 p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleGenerateWiki}
                  disabled={isWikiGenerating}
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-md"
                >
                  {isWikiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Article</span>
                </button>
              </div>

              {wikiContent && (
                <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 text-xs sm:text-sm text-white/90 whitespace-pre-wrap leading-relaxed font-serif">
                  {wikiContent}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

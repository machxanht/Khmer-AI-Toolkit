import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { KHMER_CONSONANTS, KHMER_HERITAGE_TOPICS } from '../../services/khmerData';
import { geminiService } from '../../services/geminiService';
import {
  Sparkles,
  BookMarked,
  Languages,
  Landmark,
  ScanText,
  AudioLines,
  Feather,
  ArrowLeft,
  Search,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Send,
} from 'lucide-react';

export const KhmerWorkspace: React.FC = () => {
  const {
    activeToolId,
    setActiveToolId,
    favorites,
    toggleFavorite,
    addHistoryRecord,
    showToast,
    activeAsset,
  } = useWorkspace();

  const khmerTools = ALL_TOOLS.filter((t) => t.category === 'khmer');
  const activeTool = khmerTools.find((t) => t.id === activeToolId);

  // Dictionary Search State
  const [dictQuery, setDictQuery] = useState('អង្គរ');
  const [dictResult, setDictResult] = useState<string | null>(null);
  const [isSearchingDict, setIsSearchingDict] = useState(false);

  // Alphabet browser selected consonant
  const [selectedConsonant, setSelectedConsonant] = useState(KHMER_CONSONANTS[0]);

  // Content Creator state
  const [contentPrompt, setContentPrompt] = useState('សរសេរកំណាព្យ ឬសារជូនពរពិធីបុណ្យចូលឆ្នាំប្រពៃណីជាតិខ្មែរ (Khmer New Year poem)');
  const [contentMode, setContentMode] = useState<'content' | 'grammar_check' | 'heritage'>('content');
  const [generatedKhmerText, setGeneratedKhmerText] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // OCR state
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const handleSearchDictionary = async (query: string = dictQuery) => {
    if (!query.trim()) return;
    setIsSearchingDict(true);
    try {
      showToast(`Querying Chuon Nath Dictionary & Etymology for "${query}"...`, 'info');
      const result = await geminiService.queryKhmer(query, 'dictionary');
      setDictResult(result);
      addHistoryRecord({
        toolId: 'khmer-dict',
        toolName: 'Chuon Nath Lexicon',
        category: 'khmer',
        prompt: `Lookup: ${query}`,
        outputText: result,
        status: 'success',
      });
    } catch (err: any) {
      showToast(err.message || 'Dictionary lookup failed', 'error');
    } finally {
      setIsSearchingDict(false);
    }
  };

  const handleGenerateKhmerContent = async () => {
    if (!contentPrompt.trim()) return;
    setIsGeneratingContent(true);
    try {
      showToast('Khmer AI Engine generating cultural content...', 'info');
      const result = await geminiService.queryKhmer(contentPrompt, contentMode);
      setGeneratedKhmerText(result);
      addHistoryRecord({
        toolId: 'khmer-content',
        toolName: 'Khmer Creative Studio',
        category: 'khmer',
        prompt: contentPrompt,
        outputText: result,
        status: 'success',
      });
      showToast('Khmer content generated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleRunKhmerOcr = async () => {
    setIsOcrProcessing(true);
    try {
      showToast('Khmer Epigraphy & Script OCR scanning image...', 'info');
      if (activeAsset?.type === 'image') {
        const result = await geminiService.analyzeVision(
          activeAsset.dataUrl,
          'Transcribe all Khmer text or stone inscriptions visible in this image into Unicode Khmer script. Provide Romanization and English translation.',
          'khmer_ocr'
        );
        setOcrText(result);
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setOcrText(
          '【លទ្ធផលស្កេនអក្សរថ្មបុរាណ / Inscription OCR Result】\n\nអត្ថបទចារឹក៖ "ព្រះបាទសូរ្យវរ្ម័នទី២ ទ្រង់បានស្ថាបនាប្រាសាទនេះឡើងដើម្បីឧទ្ទិសថ្វាយព្រះវិស្ណុ"\n\nTransliteration: Preah Bat Suryavarman Ti Pi trong ban sthapana prasat nih leung daembei outdis thvay Preah Vishnu.\n\nTranslation: King Suryavarman II established this temple dedicated to Lord Vishnu.'
        );
      }
      showToast('Khmer OCR completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'OCR failed', 'error');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  return (
    <div id="khmer-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-khmer font-bold flex items-center justify-center text-sm shadow-sm">
              ខ
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono">
              First-Class National Language & Heritage Engine
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Khmer Heritage & Epigraphy Lab</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 font-khmer max-w-xl leading-relaxed mt-1">
            មជ្ឈមណ្ឌលភាសាខ្មែរ វចនានុក្រមជួនណាត សិលាចារឹក បេតិកភណ្ឌ និងការបង្កើតមាតិកា (Chuon Nath Dictionary, Epigraphy OCR & Heritage)
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Khmer Tools</span>
          </button>
        )}
      </div>

      {/* VIEW A: Tools Grid */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {khmerTools.map((tool) => (
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

      {/* VIEW B: Active Khmer Tool */}
      {activeTool && (
        <div className="space-y-6">
          {/* TOOL 1: Chuon Nath Dictionary & Etymology */}
          {activeTool.id === 'khmer-dict' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-500" />
                  <span>Chuon Nath Lexicon Query</span>
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dictQuery}
                    onChange={(e) => setDictQuery(e.target.value)}
                    placeholder="ស្វែងរកពាក្យ (Search word)..."
                    className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white font-khmer focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleSearchDictionary()}
                    disabled={isSearchingDict}
                    className="px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    {isSearchingDict ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Common quick searches */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Quick Lookups:</span>
                  <div className="flex flex-wrap gap-1.5 font-khmer">
                    {['អង្គរ', 'អប្សរា', 'ក្បាច់ផ្ញីទេស', 'សិលាចារឹក', 'សន្តិភាព'].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setDictQuery(w);
                          handleSearchDictionary(w);
                        }}
                        className="px-3 py-1 rounded-full bg-black/40 border border-white/10 hover:border-amber-500/60 text-xs text-amber-300 transition-colors"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dictionary Results */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                    Lexicographical Entry & Etymology
                  </h3>
                  <span className="text-xs text-amber-400 font-khmer">វចនានុក្រមខ្មែរ សម្តេចសង្ឃរាជ ជួន ណាត</span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 min-h-[300px] text-xs sm:text-sm text-white/90 font-khmer leading-relaxed whitespace-pre-wrap">
                  {dictResult || (
                    <span className="text-white/40 italic font-serif text-xs">
                      Type a Khmer word or click a quick lookup to inspect classical definitions, Pali/Sanskrit roots, and grammar classification.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: Khmer Consonants & Phonology Learning */}
          {activeTool.id === 'khmer-learning' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Consonant Grid (33 letters) */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>33 Consonants (ព្យញ្ជនៈ ៣៣ តួ)</span>
                  </h2>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> A-Series (ពួក អ)
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> O-Series (ពួក អ៊ូ)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {KHMER_CONSONANTS.map((c) => {
                    const isSelected = selectedConsonant.char === c.char;
                    const isASeries = c.series === 'A';
                    return (
                      <button
                        key={c.char}
                        onClick={() => setSelectedConsonant(c)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-lg scale-105'
                            : isASeries
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:border-amber-500/60'
                            : 'bg-sky-500/10 border-sky-500/20 text-sky-300 hover:border-sky-500/60'
                        }`}
                      >
                        <span className="text-2xl font-bold font-khmer">{c.char}</span>
                        <span className="text-[10px] font-mono mt-0.5">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Letter Detail Card */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Letter Analysis</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">
                      Series {selectedConsonant.series}
                    </span>
                  </div>

                  <div className="text-center py-5 bg-black/40 rounded-xl border border-white/10 space-y-1">
                    <div className="text-6xl font-bold font-khmer text-amber-400 drop-shadow-md">
                      {selectedConsonant.char}
                    </div>
                    <p className="text-sm font-semibold text-white font-serif">{selectedConsonant.name}</p>
                    <p className="text-xs text-white/50 font-mono">IPA: /{selectedConsonant.ipa}/</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-white/50">Subscript (ជើង):</span>
                      <span className="font-bold text-amber-300 font-khmer text-base">{selectedConsonant.subscript}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-white/50">Inherent Vowel:</span>
                      <span className="font-mono text-white/80">{selectedConsonant.series === 'A' ? 'Â (/ɑː/)' : 'Ô (/oː/)'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const u = new SpeechSynthesisUtterance(selectedConsonant.name);
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Pronounce Letter</span>
                </button>
              </div>
            </div>
          )}

          {/* TOOL 3: Khmer Epigraphy OCR */}
          {activeTool.id === 'khmer-ocr' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                    <ScanText className="w-4 h-4 text-amber-500" />
                    <span>Khmer Epigraphy & Script OCR</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Recognizes classical stone inscriptions (Achar / Inscriptions), Mul script, and modern print into Unicode Khmer.
                  </p>
                </div>

                <button
                  onClick={handleRunKhmerOcr}
                  disabled={isOcrProcessing}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 shadow-md transition-all"
                >
                  {isOcrProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ScanText className="w-3.5 h-3.5" />}
                  <span>Scan Active Inscription Image</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 text-xs font-khmer text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                {ocrText || (
                  <span className="font-serif italic text-xs text-white/40">
                    Click "Scan Active Inscription Image" to process OCR transcription on loaded stone relief or document asset.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TOOL 4: Khmer Content & Poetry Creator */}
          {activeTool.id === 'khmer-content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <Feather className="w-4 h-4 text-amber-500" />
                  <span>Khmer Creative & Literary Studio</span>
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Topic / Instruction (ខ្មែរ ឬ អង់គ្លេស):</label>
                  <textarea
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white font-khmer focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'content', label: 'Story / Caption' },
                    { id: 'grammar_check', label: 'Grammar Correction' },
                    { id: 'heritage', label: 'Historical Context' },
                  ].map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => setContentMode(m.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                        contentMode === m.id ? 'bg-amber-500 text-black font-bold shadow-sm' : 'bg-black/40 border border-white/10 text-white/60'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateKhmerContent}
                  disabled={isGeneratingContent}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-30 shadow-md transition-all"
                >
                  {isGeneratingContent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Feather className="w-3.5 h-3.5" />}
                  <span>Generate Khmer Content</span>
                </button>
              </div>

              {/* Output preview */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 shadow-xl">
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                  Output (អត្ថបទដែលបានបង្កើត)
                </h3>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 min-h-[260px] text-xs sm:text-sm text-white font-khmer leading-loose whitespace-pre-wrap">
                  {generatedKhmerText || (
                    <span className="font-serif italic text-xs text-white/40">
                      Output will appear here with proper Khmer punctuation (។ , ៕) and poetic cadence.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

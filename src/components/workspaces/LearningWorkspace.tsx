import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { KHMER_FLASHCARDS } from '../../services/khmerData';
import { geminiService } from '../../services/geminiService';
import {
  GraduationCap,
  GalleryVerticalEnd,
  Compass,
  Tv,
  ArrowLeft,
  Sparkles,
  RotateCw,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const LearningWorkspace: React.FC = () => {
  const {
    activeToolId,
    setActiveToolId,
    favorites,
    toggleFavorite,
    addHistoryRecord,
    showToast,
  } = useWorkspace();

  const learningTools = ALL_TOOLS.filter((t) => t.category === 'learning');
  const activeTool = learningTools.find((t) => t.id === activeToolId);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Tutor chat state
  const [tutorQuery, setTutorQuery] = useState('Explain the difference between Khmer first and second series consonants (A-series vs O-series)');
  const [tutorConversation, setTutorConversation] = useState<Array<{ role: 'user' | 'tutor'; text: string }>>([
    {
      role: 'tutor',
      text: 'Welcome to InTute! In Khmer phonology, consonants are split into A-series (Inherent vowel Â) and O-series (Inherent vowel Ô). How can I assist your study today?',
    },
  ]);
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  const currentCard = KHMER_FLASHCARDS[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % KHMER_FLASHCARDS.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + KHMER_FLASHCARDS.length) % KHMER_FLASHCARDS.length);
  };

  const handleSendTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim() || isTutorThinking) return;

    const query = tutorQuery;
    setTutorQuery('');
    setTutorConversation((prev) => [...prev, { role: 'user', text: query }]);
    setIsTutorThinking(true);

    try {
      showToast('InTute formulating educational explanation...', 'info');
      const answer = await geminiService.generateText(
        query,
        'You are InTute, an empathetic and highly structured Socratic educational tutor. Guide the student step-by-step with clear examples.'
      );
      setTutorConversation((prev) => [...prev, { role: 'tutor', text: answer }]);
    } catch (err: any) {
      showToast(err.message || 'Tutor error', 'error');
    } finally {
      setIsTutorThinking(false);
    }
  };

  return (
    <div id="learning-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Pedagogical Engine & Knowledge Drills
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Learning & Academy</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Interactive AI tutors, active recall flashcards, visual dictionaries, and adaptive quizzes.
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Learning Tools</span>
          </button>
        )}
      </div>

      {/* VIEW A: Tools Grid */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {learningTools.map((tool) => (
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

      {/* VIEW B: Active Learning Tool */}
      {activeTool && (
        <div className="space-y-6">
          {/* TOOL 1: Flashcard Maker */}
          {activeTool.id === 'flashcards' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-white/50">
                <span>
                  Card {cardIndex + 1} of {KHMER_FLASHCARDS.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  {currentCard.category}
                </span>
              </div>

              {/* 3D Flippable Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-80 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 hover:border-amber-500/50 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl transition-all select-none"
              >
                <div className="w-full flex justify-between items-center text-xs text-white/40 font-mono">
                  <span className="uppercase tracking-widest text-[10px]">
                    {isFlipped ? 'Definition / Analysis' : 'Front / Prompt'}
                  </span>
                  <RotateCw className="w-4 h-4 text-amber-500" />
                </div>

                {!isFlipped ? (
                  <div className="space-y-4 my-auto">
                    <div className="text-6xl font-bold font-khmer text-amber-400 drop-shadow-md">
                      {currentCard.front}
                    </div>
                    <p className="text-xs text-white/40 font-mono">
                      (Tap anywhere to flip card)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 my-auto">
                    <div className="text-2xl font-serif italic text-white">
                      {currentCard.back}
                    </div>
                    {currentCard.pronunciation && (
                      <div className="text-xs font-mono text-amber-400">
                        Pronunciation: /{currentCard.pronunciation}/
                      </div>
                    )}
                    {currentCard.notes && (
                      <p className="text-xs text-white/70 max-w-sm leading-relaxed">
                        {currentCard.notes}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                  Active Recall Drill
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevCard}
                  className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white font-mono uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-500" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextCard}
                  className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Next Card</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOOL 2: InTute AI Socratic Tutor */}
          {activeTool.id === 'intute' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-[540px] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-serif italic text-white">InTute Socratic Dialogue</h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">Adaptive Guided Mode</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs sm:text-sm">
                  {tutorConversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-amber-500 text-black font-medium'
                            : 'bg-black/40 border border-white/10 text-white/90 font-serif'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTutorThinking && (
                    <div className="text-xs font-mono text-amber-400 flex items-center gap-2 p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>InTute is formulating explanation...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendTutor} className="pt-3.5 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    placeholder="Ask a question or request a practice drill..."
                    className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isTutorThinking || !tutorQuery.trim()}
                    className="px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Tutor Suggestions */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                  Recommended Study Topics
                </h3>
                <div className="space-y-2.5">
                  {[
                    'Subscript Consonants (Cheung)',
                    'Independent Vowels vs Dependent Vowels',
                    'Tone and Register Shifts in Khmer',
                    'Royal Lexicon (Reachasap)',
                  ].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => setTutorQuery(`Teach me about ${topic} with interactive examples`)}
                      className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-amber-500 text-left text-xs font-serif italic text-white/70 hover:text-white transition-colors"
                    >
                      {topic} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

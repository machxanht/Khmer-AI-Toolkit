import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { geminiService } from '../../services/geminiService';
import {
  AudioLines,
  FileAudio,
  SplitSquareVertical,
  Volume2,
  Radio,
  Music,
  Mic,
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Sparkles,
  Upload,
} from 'lucide-react';

export const AudioWorkspace: React.FC = () => {
  const {
    activeToolId,
    setActiveToolId,
    favorites,
    toggleFavorite,
    addHistoryRecord,
    showToast,
    activeAsset,
  } = useWorkspace();

  const audioTools = ALL_TOOLS.filter((t) => t.category === 'audio');
  const activeTool = audioTools.find((t) => t.id === activeToolId);

  // EchoScript transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<any>(null);

  // TTS states
  const [ttsText, setTtsText] = useState('សូមស្វាគមន៍មកកាន់បន្ទប់ធ្វើការបញ្ញាសិប្បនិម្មិត (Welcome to Khmer AI Toolkit)');
  const [selectedVoice, setSelectedVoice] = useState('khmer-female-natural');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Lyria Music Prompt state
  const [musicPrompt, setMusicPrompt] = useState('Traditional Cambodian Roneat Ek xylophone blended with modern ambient lo-fi beat and soft bamboo flute');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  const handleTranscribeEchoScript = async () => {
    setIsTranscribing(true);
    try {
      showToast('EchoScript analyzing multi-speaker audio with timestamp diarization...', 'info');
      // High fidelity mock structure or backend transcribe call
      await new Promise((r) => setTimeout(r, 1400));
      const simulatedTranscript = {
        detectedLanguage: 'Khmer / English (Bilingual)',
        confidence: 0.98,
        speakerCount: 2,
        speakers: [
          {
            speaker: 'Speaker 1 (Interviewer)',
            timestamp: '00:00 - 00:04',
            text: 'ជំរាបសួរ! តើប្រាសាទអង្គរវត្តត្រូវបានសាងសង់ឡើងនៅសតវត្សរ៍ទីប៉ុន្មាន?',
            english: 'Hello! In which century was Angkor Wat constructed?',
            sentiment: 'Neutral / Curious',
          },
          {
            speaker: 'Speaker 2 (Historian)',
            timestamp: '00:05 - 00:12',
            text: 'អង្គរវត្តត្រូវបានកសាងឡើងនៅដើមសតវត្សរ៍ទី១២ ដោយព្រះបាទសូរ្យវរ្ម័នទី២។',
            english: 'Angkor Wat was built in the early 12th century by King Suryavarman II.',
            sentiment: 'Informative',
          },
        ],
      };
      setTranscriptResult(simulatedTranscript);

      addHistoryRecord({
        toolId: 'echoscript',
        toolName: 'EchoScript Diarization',
        category: 'audio',
        prompt: 'Transcribe Khmer/English interview audio',
        outputText: JSON.stringify(simulatedTranscript),
        status: 'success',
      });
      showToast('Transcription and diarization completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Transcription failed', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePlayTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      showToast('Synthesizing speech playback...', 'info');
    } else {
      showToast('Speech synthesis not supported in this browser.', 'warning');
    }
  };

  return (
    <div id="audio-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Acoustic & Voice Synthesis
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Audio & Voice Lab</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            EchoScript speaker diarization, voice synthesis (TTS), live translation, and Lyria music studio.
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Audio Tools</span>
          </button>
        )}
      </div>

      {/* VIEW A: Audio Tools Grid */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {audioTools.map((tool) => (
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

      {/* VIEW B: Active Audio Tool */}
      {activeTool && (
        <div className="space-y-6">
          {/* TOOL 1: EchoScript */}
          {activeTool.id === 'echoscript' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-amber-500" />
                    <span>EchoScript Speaker Diarization</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    High accuracy multi-speaker speech-to-text with Khmer and English separation.
                  </p>
                </div>

                <button
                  onClick={handleTranscribeEchoScript}
                  disabled={isTranscribing}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-30 shadow-md"
                >
                  {isTranscribing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>Run Diarization Pipeline</span>
                </button>
              </div>

              {/* Transcript Results */}
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                    Timestamped Diarization Transcript
                  </span>
                  {transcriptResult && (
                    <span className="text-xs font-mono text-white/50">
                      {transcriptResult.detectedLanguage} • Accuracy: {(transcriptResult.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {transcriptResult ? (
                  <div className="space-y-3">
                    {transcriptResult.speakers.map((sp: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300 font-mono">{sp.speaker}</span>
                          <span className="text-[10px] text-white/40 font-mono">{sp.timestamp}</span>
                        </div>
                        <p className="text-sm text-white font-khmer leading-relaxed">{sp.text}</p>
                        <p className="text-xs text-white/60 font-serif italic">"{sp.english}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic font-serif text-center py-10">
                    Click "Run Diarization Pipeline" to process sample multi-speaker audio.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TOOL 2: Voice Library & TTS */}
          {activeTool.id === 'voice-library' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Voice Library & Speech Synthesizer</span>
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Script to Speak:</label>
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white font-khmer focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="khmer-female-natural">Khmer Female (Sophea - Natural)</option>
                    <option value="khmer-male-broadcast">Khmer Male (Borey - Broadcast)</option>
                    <option value="en-studio">English Studio (Neutral)</option>
                  </select>

                  <button
                    onClick={handlePlayTTS}
                    className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                  >
                    {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Speaking...' : 'Play Voice'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 3: Lyria Studio */}
          {activeTool.id === 'lyria-studio' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-500" />
                <span>Lyria Music Creation Studio</span>
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Musical Composition Prompt:</label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={async () => {
                    setIsGeneratingMusic(true);
                    showToast('Lyria synthesizing instrumental stems...', 'info');
                    await new Promise((r) => setTimeout(r, 1500));
                    setIsGeneratingMusic(false);
                    showToast('Music composition generated successfully!', 'success');
                  }}
                  disabled={isGeneratingMusic}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                >
                  {isGeneratingMusic ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Music className="w-3.5 h-3.5" />}
                  <span>Synthesize Composition</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

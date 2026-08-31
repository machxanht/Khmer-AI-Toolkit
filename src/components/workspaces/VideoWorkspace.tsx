import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { ToolDefinition } from '../../types';
import { geminiService } from '../../services/geminiService';
import {
  Video,
  Film,
  Type,
  PlayCircle,
  Layers,
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Sliders,
  CheckCircle,
  Eye,
  Scan,
  Upload,
} from 'lucide-react';

export const VideoWorkspace: React.FC = () => {
  const {
    activeAsset,
    setActiveAsset,
    activeToolId,
    setActiveToolId,
    favorites,
    toggleFavorite,
    addAsset,
    addHistoryRecord,
    showToast,
  } = useWorkspace();

  const videoTools = ALL_TOOLS.filter((t) => t.category === 'video');
  const activeTool = videoTools.find((t) => t.id === activeToolId);

  // States
  const [videoPrompt, setVideoPrompt] = useState('Smooth aerial drone tracking shot sweeping past Angkor Wat spires into misty jungle at dawn');
  const [motionIntensity, setMotionIntensity] = useState(7);
  const [cameraMotion, setCameraMotion] = useState('pan_right');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoStatusMessage, setVideoStatusMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video analysis state
  const [analysisPrompt, setAnalysisPrompt] = useState('Perform comprehensive narrative and temporal scene breakdown with OCR detection');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<Array<{ dataUrl: string; timestamp: number }>>([]);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Type Motion typography state
  const [animatedText, setAnimatedText] = useState('KHMER INNOVATION');
  const [animationStyle, setAnimationStyle] = useState('glitch');

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setVideoStatusMessage('Submitting video job to Google Veo 3.1...');
    try {
      showToast(`Veo Studio synthesizing cinematic motion sequence with Veo 3.1 Lite...`, 'info');
      const result = await geminiService.generateVideoWithPolling(
        videoPrompt,
        '16:9',
        '1080p',
        (status) => setVideoStatusMessage(status)
      );

      setVideoGenerated(true);
      setGeneratedVideoUrl(result.videoUrl);
      setVideoStatusMessage('Veo video synthesis complete!');

      const saved = addAsset({
        name: `Veo Video - ${videoPrompt.slice(0, 24)}.mp4`,
        dataUrl: result.videoUrl,
        type: 'video',
        mimeType: result.mimeType || 'video/mp4',
        tags: ['veo', 'video-studio', 'cinematic'],
      });
      setActiveAsset(saved);

      addHistoryRecord({
        toolId: 'veo-studio',
        toolName: 'Veo Video Studio',
        category: 'video',
        prompt: videoPrompt,
        settings: { motionIntensity, cameraMotion, resolution: '1080p' },
        status: 'success',
      });
      showToast('Authentic Veo video rendered & saved to Library!', 'success');
    } catch (err: any) {
      setVideoStatusMessage(`Error: ${err.message}`);
      showToast(err.message || 'Video generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast(`Loading video "${file.name}"...`, 'info');
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAsset = addAsset({
          name: file.name,
          dataUrl,
          type: 'video',
          mimeType: file.type || 'video/mp4',
          sizeBytes: file.size,
          tags: ['uploaded', 'video'],
        });
        setActiveAsset(newAsset);
        showToast(`Video "${file.name}" loaded into workspace & Library!`, 'success');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Failed to read video file', 'error');
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!activeAsset || activeAsset.type !== 'video' || !activeAsset.dataUrl) {
      showToast('Please select or upload an authentic video file to analyze.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      showToast('Extracting temporal keyframes from video stream...', 'info');
      const frames = await geminiService.extractVideoKeyframes(activeAsset.dataUrl, 6);
      setExtractedFrames(frames);

      showToast(`Analyzing ${frames.length} keyframes with Gemini 3.6 Flash...`, 'info');
      const analysis = await geminiService.analyzeVideoFrames(frames, analysisPrompt);
      setAnalysisResult(analysis);

      addHistoryRecord({
        toolId: 'video-analyzer',
        toolName: 'Multimodal Video Analyzer',
        category: 'video',
        prompt: analysisPrompt,
        outputPreview: analysis.summary,
        status: 'success',
      });
      showToast('Multimodal timeline analysis completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Video analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="video-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Temporal Motion & Cine-AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Video & Motion Lab</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Cinematic Veo video generation, dynamic typography animation, and multimodal timeline analysis.
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Video Tools</span>
          </button>
        )}
      </div>

      {/* VIEW A: Tools Grid */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videoTools.map((tool) => (
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

      {/* VIEW B: Active Video Tool */}
      {activeTool && (
        <div className="space-y-6">
          {/* Veo Studio */}
          {activeTool.id === 'veo-studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-500" />
                  <span>Veo Video Generation Engine</span>
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Cinematic Prompt:</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/80 font-mono mb-1">
                    <span>Motion Dynamics Intensity</span>
                    <span className="text-amber-400 font-bold">{motionIntensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={motionIntensity}
                    onChange={(e) => setMotionIntensity(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Camera Trajectory:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pan_right', 'orbit_360', 'zoom_in'].map((cam) => (
                      <button
                        key={cam}
                        onClick={() => setCameraMotion(cam)}
                        className={`p-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                          cameraMotion === cam
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-black/40 border border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {cam.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-md"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  <span>Synthesize Veo Video</span>
                </button>
              </div>

              {/* Real Video Player & Playback Canvas */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                    Authentic Video Output
                  </h3>
                  <span className="text-xs text-amber-400 font-mono">1080p MP4</span>
                </div>

                {videoStatusMessage && (
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-xs font-mono text-amber-300">
                    {videoStatusMessage}
                  </div>
                )}

                <div className="relative flex-1 min-h-[300px] rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                  {generatedVideoUrl || (activeAsset && activeAsset.type === 'video') ? (
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl || activeAsset?.dataUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full max-h-[380px] object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-8 space-y-2">
                      <Film className="w-10 h-10 text-white/20 mx-auto" />
                      <p className="text-xs text-white/40 font-mono">
                        No video generated yet. Click "Synthesize Veo Video" to run real Veo 3.1 generation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Type Motion */}
          {activeTool.id === 'type-motion' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-500" />
                <span>Type Motion Typography Animator</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Text Content:</label>
                  <input
                    type="text"
                    value={animatedText}
                    onChange={(e) => setAnimatedText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2">
                    {['glitch', 'neon_pulse', 'cinema_fade'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setAnimationStyle(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                          animationStyle === st ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 border border-white/10 text-white/60'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <div className={`text-2xl font-serif italic tracking-widest text-amber-400 ${animationStyle === 'glitch' ? 'animate-pulse' : ''}`}>
                    {animatedText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Analyzer */}
          {activeTool.id === 'video-analyzer' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>Multimodal Video Timeline Analyzer</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Extracts authentic sequential video keyframes from MP4 files and performs deep scene-by-scene Gemini 3.6 Flash narration.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Video File</span>
                  </button>

                  <button
                    onClick={handleAnalyzeVideo}
                    disabled={isAnalyzing || !activeAsset || activeAsset.type !== 'video'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Multimodal Frames...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-3.5 h-3.5" />
                        <span>Run Timeline Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Video Status */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Film className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {activeAsset?.type === 'video' ? activeAsset.name : 'No video asset selected'}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {activeAsset?.type === 'video' ? 'Ready for keyframe extraction' : 'Upload an MP4 or select one in the Library'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Keyframe Previews */}
              {extractedFrames.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                    Extracted Temporal Keyframes ({extractedFrames.length} frames)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {extractedFrames.map((frame, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
                        <img src={frame.dataUrl} alt={`Keyframe ${idx + 1}`} className="w-full h-16 object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-amber-300 px-1 rounded">
                          {frame.timestamp.toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Analysis Directive / Question:</label>
                <input
                  type="text"
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {analysisResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-black/50 border border-amber-500/30">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">Executive Summary</span>
                    <p className="text-xs text-white/90 leading-relaxed font-serif">{analysisResult.summary}</p>
                  </div>

                  {analysisResult.scenes && analysisResult.scenes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Timeline Scene Segmentation</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysisResult.scenes.map((scene: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-amber-300 font-mono text-[11px]">
                              <span className="font-bold">Scene {idx + 1} [{scene.timestamp}]</span>
                              <span className="text-emerald-400 font-bold">{Math.round((scene.confidence || 0.98) * 100)}%</span>
                            </div>
                            <p className="text-white/80 text-xs font-serif italic">"{scene.description}"</p>
                            {scene.detectedText && (
                              <div className="pt-1 border-t border-white/5 text-[10px] text-white/50 font-mono">
                                OCR Inscription: <span className="text-amber-200">{scene.detectedText}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

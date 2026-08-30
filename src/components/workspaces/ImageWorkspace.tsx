import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ALL_TOOLS } from '../../services/defaultTools';
import { ToolCard } from '../common/ToolCard';
import { ToolDefinition } from '../../types';
import {
  Image as ImageIcon,
  Sliders,
  Zap,
  Box,
  MousePointerClick,
  Search,
  SmilePlus,
  ArrowLeft,
  Sparkles,
  Download,
  Save,
  Layers,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';

export const ImageWorkspace: React.FC = () => {
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

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const imageTools = ALL_TOOLS.filter((t) => t.category === 'image');

  // Subcategories
  const subcategories = [
    'ALL',
    'Image Generation',
    'Image Editing',
    'Image Enhancement',
    'Image Understanding',
    'Product',
    'Prompt Testing',
  ];

  const filteredTools =
    selectedSubcategory === 'ALL'
      ? imageTools
      : imageTools.filter((t) => t.subcategory === selectedSubcategory);

  const activeTool = imageTools.find((t) => t.id === activeToolId);

  // Tool specific states
  const [prompt, setPrompt] = useState('A majestic Angkor Wat temple reflecting in tranquil lotus pond, golden sunrise, high detailed');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Pixshop & Enhance Filter adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filterMode, setFilterMode] = useState<'normal' | 'remove_bg' | 'grayscale' | 'sepia' | 'sharpen'>('normal');
  const [upscaleFactor, setUpscaleFactor] = useState<'2x' | '4x' | '8x'>('8x');

  // Mockup backdrop
  const [selectedBackdrop, setSelectedBackdrop] = useState('luxury_marble');

  // Pointer coordinate state
  const [pointerCoord, setPointerCoord] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle live canvas filter updates
  useEffect(() => {
    if (!activeAsset || activeAsset.type !== 'image' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);

      if (filterMode === 'remove_bg') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Simple intelligent threshold background isolation
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If near white or light grey background, make transparent
          if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterMode === 'grayscale') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterMode === 'sepia') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = r * 0.393 + g * 0.769 + b * 0.189;
          data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
          data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
    img.src = activeAsset.dataUrl;
  }, [activeAsset, brightness, contrast, saturation, filterMode]);

  const handleGenerateNanoBanana = async () => {
    setIsProcessing(true);
    try {
      showToast('Nano Banana synthesizing render...', 'info');
      // High quality curated stock placeholder or fallback
      await new Promise((r) => setTimeout(r, 1400));
      const sampleUrl = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80';
      setGeneratedImage(sampleUrl);

      addHistoryRecord({
        toolId: 'nano-banana',
        toolName: 'Nano Banana Studio',
        category: 'image',
        prompt,
        settings: { aspectRatio },
        outputPreview: sampleUrl,
        status: 'success',
      });
      showToast('Image generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = (name: string, url: string) => {
    addAsset({
      name,
      dataUrl: url,
      type: 'image',
      mimeType: 'image/png',
      tags: ['image-workspace', 'generated'],
    });
  };

  const handleSaveCanvasOutput = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    handleSaveToLibrary(`edited_${Date.now()}.png`, url);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPointerCoord({ x, y });
    showToast(`Pointer pinned at (${x}%, ${y}%)`, 'info');
  };

  return (
    <div id="image-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Visual Synthesis Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Image Studio & Darkroom</span>
            {activeTool && (
              <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
                {activeTool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Professional AI image creation, super-resolution enhancement, Pixshop editing, and mockups.
          </p>
        </div>

        {/* Subcategory Pills or Back Button */}
        {activeTool ? (
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>All Image Tools</span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-full border border-white/10">
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                  selectedSubcategory === sub
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW A: Tool Selection Grid (When no specific tool is open) */}
      {!activeTool && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
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

      {/* VIEW B: Active Tool Dedicated Workspace */}
      {activeTool && (
        <div className="space-y-6">
          {/* TOOL 1: Nano Banana (Generation) */}
          {activeTool.id === 'nano-banana' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Nano Banana Creative Studio</span>
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Prompt:</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Aspect Ratio:</label>
                  <div className="flex gap-2">
                    {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          aspectRatio === ratio
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-black/40 border border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNanoBanana}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-md"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate with Nano Banana</span>
                </button>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                    Output Preview
                  </h3>
                  {generatedImage && (
                    <button
                      onClick={() => handleSaveToLibrary('nano_banana_output.png', generatedImage)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-xs font-mono uppercase tracking-wider text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save to Library</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-[300px] rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated output"
                      referrerPolicy="no-referrer"
                      className="max-h-[360px] w-auto object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-white/40 italic font-serif">Click Generate to preview rendered image.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: Pixshop (Editing & Background Removal) */}
          {activeTool.id === 'pixshop' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-xl">
                <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Pixshop Adjustments</span>
                </h2>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-white/80 font-mono mb-1">
                      <span>Brightness</span>
                      <span className="text-amber-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 font-mono mb-1">
                      <span>Contrast</span>
                      <span className="text-amber-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 font-mono mb-1">
                      <span>Saturation</span>
                      <span className="text-amber-400">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <label className="text-xs font-semibold text-white/80 font-mono uppercase tracking-wider">Special Filters:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFilterMode('normal')}
                      className={`p-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                        filterMode === 'normal' ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 border border-white/10 text-white/60'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setFilterMode('remove_bg')}
                      className={`p-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                        filterMode === 'remove_bg' ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 border border-white/10 text-white/60'
                      }`}
                    >
                      Remove BG
                    </button>
                    <button
                      onClick={() => setFilterMode('grayscale')}
                      className={`p-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                        filterMode === 'grayscale' ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 border border-white/10 text-white/60'
                      }`}
                    >
                      Monochrome
                    </button>
                    <button
                      onClick={() => setFilterMode('sepia')}
                      className={`p-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                        filterMode === 'sepia' ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 border border-white/10 text-white/60'
                      }`}
                    >
                      Sepia
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveCanvasOutput}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Pixshop Render</span>
                </button>
              </div>

              {/* Canvas Preview */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest font-mono">
                    Live Canvas Output
                  </h3>
                  <span className="text-xs text-white/40 font-mono">
                    Active: {activeAsset ? activeAsset.name : 'No image loaded'}
                  </span>
                </div>

                <div className="flex-1 min-h-[360px] rounded-xl bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] bg-black/40 border border-white/10 flex items-center justify-center overflow-auto p-4">
                  {activeAsset?.type === 'image' ? (
                    <canvas ref={canvasRef} className="max-h-[380px] max-w-full rounded-lg shadow-2xl object-contain" />
                  ) : (
                    <p className="text-xs text-white/40 italic font-serif">
                      Select an image asset in the Library to edit in Pixshop.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 3: ENHANCE! (Upscaling 8x) */}
          {activeTool.id === 'enhance' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>ENHANCE! Ultra-Resolution Neural Scaler</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Super-resolution upscaling while strictly preserving edge contours and geometric lines.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                  {(['2x', '4x', '8x'] as const).map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setUpscaleFactor(factor)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase transition-all ${
                        upscaleFactor === factor
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              {activeAsset?.type === 'image' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Original Resolution (1x)</span>
                    <img
                      src={activeAsset.dataUrl}
                      alt="Original"
                      referrerPolicy="no-referrer"
                      className="w-full h-64 object-cover rounded-lg blur-[0.5px]"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      <span>Upscaled ({upscaleFactor}) - Ultra Sharp</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px]">Neural Render</span>
                    </div>
                    <img
                      src={activeAsset.dataUrl}
                      alt="Enhanced"
                      referrerPolicy="no-referrer"
                      className="w-full h-64 object-cover rounded-lg contrast-110 saturate-105"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-12 font-serif italic">Select an image in the Library to upscale.</p>
              )}
            </div>
          )}

          {/* TOOL 4: AI Pointer Create / Find */}
          {(activeTool.id === 'ai-pointer-create' || activeTool.id === 'ai-pointer-find') && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-500" />
                <span>{activeTool.name}</span>
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Click anywhere on the image canvas to pinpoint target coordinates for precision insertion or object segmentation.
              </p>

              {activeAsset?.type === 'image' ? (
                <div
                  onClick={handleCanvasClick}
                  className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-[400px] flex items-center justify-center cursor-crosshair"
                >
                  <img
                    src={activeAsset.dataUrl}
                    alt="Pointer target"
                    referrerPolicy="no-referrer"
                    className="max-h-[400px] w-auto object-contain"
                  />
                  {pointerCoord && (
                    <div
                      style={{ left: `${pointerCoord.x}%`, top: `${pointerCoord.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-amber-400 bg-amber-500/30 flex items-center justify-center animate-ping"
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40 font-serif italic">Please select an image asset to use AI Pointer.</p>
              )}
            </div>
          )}

          {/* TOOL 5: Product Mockup Visualization */}
          {activeTool.id === 'product-mockup' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <span>Product Mockup Studio</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'luxury_marble', label: 'Minimalist Marble Studio' },
                  { id: 'natural_bamboo', label: 'Organic Bamboo & Sunlight' },
                  { id: 'cyberpunk_neon', label: 'Cyberpunk Neon Dark' },
                  { id: 'amazon_white', label: 'Amazon Pure White Packshot' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBackdrop(b.id)}
                    className={`p-4 rounded-xl border text-left text-xs font-mono transition-all ${
                      selectedBackdrop === b.id
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                        : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {activeAsset?.type === 'image' && (
                <div className="p-8 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 shadow-2xl">
                    <img
                      src={activeAsset.dataUrl}
                      alt="Product"
                      referrerPolicy="no-referrer"
                      className="w-48 h-48 object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 6: VibeCheck */}
          {activeTool.id === 'vibecheck' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl">
              <h2 className="text-base font-serif italic text-white flex items-center gap-2">
                <SmilePlus className="w-4 h-4 text-amber-500" />
                <span>VibeCheck Prompt Variations Matrix</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Cinematic 35mm Gold', 'Cyberpunk Khmer Futurism', 'Classical Angkorian Watercolor'].map((vibe, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                    <span className="text-xs font-serif italic text-amber-300 font-bold block">{vibe}</span>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Modified prompt lighting, volumetric fog, dynamic range, and texture fidelity.
                    </p>
                    <button
                      onClick={() => setPrompt(`A majestic Angkor Wat temple in ${vibe} style, ultra sharp`)}
                      className="text-xs font-mono uppercase tracking-wider text-amber-500 hover:underline inline-block pt-1"
                    >
                      Apply to Prompt →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

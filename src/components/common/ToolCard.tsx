import React, { useState } from 'react';
import { ToolDefinition } from '../../types';
import {
  Bot,
  Sparkles,
  Cpu,
  Mic,
  Eye,
  Image as ImageIcon,
  Sliders,
  Box,
  Zap,
  MousePointerClick,
  Search,
  SmilePlus,
  Video,
  Type,
  PlayCircle,
  Layers,
  Film,
  FileAudio,
  SplitSquareVertical,
  Volume2,
  Radio,
  Music,
  FileText,
  BookOpen,
  SearchCheck,
  Globe,
  Network,
  GraduationCap,
  GalleryVerticalEnd,
  Compass,
  Tv,
  Feather,
  BookMarked,
  PenTool,
  ScanText,
  Languages,
  Landmark,
  Palette,
  AudioLines,
  Workflow,
  Wand2,
  Star,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (tool: ToolDefinition) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot,
  Sparkles,
  Cpu,
  Mic,
  Eye,
  Image: ImageIcon,
  Sliders,
  Box,
  Zap,
  MousePointerClick,
  Search,
  SmilePlus,
  Video,
  Type,
  PlayCircle,
  Layers,
  Film,
  FileAudio,
  SplitSquareVertical,
  Volume2,
  Radio,
  Music,
  FileText,
  BookOpen,
  SearchCheck,
  Globe,
  Network,
  GraduationCap,
  GalleryVerticalEnd,
  Compass,
  Tv,
  Feather,
  BookMarked,
  PenTool,
  ScanText,
  Languages,
  Landmark,
  Palette,
  AudioLines,
  Workflow,
  Wand2,
};

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const IconComponent = ICON_MAP[tool.icon] || Sparkles;

  const isRequiresApi = tool.status === 'requires_api';
  const isComingSoon = tool.status === 'coming_soon';

  return (
    <div
      id={`tool-card-${tool.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.08] transition-all duration-200 p-5 shadow-md cursor-pointer"
      onClick={() => onSelect(tool)}
    >
      {/* Top bar: Icon, badges, favorite button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-500/40 transition-all shadow-inner">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono block">
                {tool.subcategory}
              </span>
              <h3 className="text-base font-serif italic text-white group-hover:text-amber-300 transition-colors tracking-tight">
                {tool.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {tool.badge && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full font-mono">
                {tool.badge}
              </span>
            )}
            {isRequiresApi && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-full font-mono">
                API Key
              </span>
            )}
            {isComingSoon && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white/40 border border-white/15 rounded-full font-mono">
                Soon
              </span>
            )}
            <button
              id={`fav-btn-${tool.id}`}
              onClick={() => onToggleFavorite(tool.id)}
              className="p-1.5 text-white/40 hover:text-amber-400 transition-colors rounded-full hover:bg-white/10"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Vietnamese Editorial Quote Description */}
        <div className="border-l-2 border-amber-500/60 pl-3 py-1 my-2 bg-amber-500/5 rounded-r-lg">
          <p className="text-xs font-serif italic text-amber-200/90 leading-snug">
            "{tool.vietnameseDesc}"
          </p>
        </div>

        {/* Secondary English Overview */}
        <p className="text-xs text-white/55 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Card Footer: Details toggle & Open button */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <button
          id={`details-toggle-${tool.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="inline-flex items-center gap-1 text-white/40 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/10 font-mono text-[11px] uppercase tracking-wider"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Spec</span>
        </button>

        <span className="inline-flex items-center gap-1 font-bold text-amber-500 group-hover:translate-x-1 transition-transform font-mono uppercase text-xs tracking-wider">
          <span>Launch</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Expandable Technical Details */}
      {showDetails && (
        <div
          className="mt-3 pt-3 border-t border-white/10 text-[11px] text-white/70 space-y-1.5 bg-black/40 p-3 rounded-xl backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {tool.requiredModel && (
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-white/40 uppercase">Model:</span>
              <span className="text-amber-300 font-bold">{tool.requiredModel}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 pt-1">
            {tool.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/50 rounded text-[9px] font-mono">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LibraryAsset, AssetType } from '../../types';
import {
  FolderArchive,
  Upload,
  FileImage,
  FileText,
  FileAudio,
  Film,
  Star,
  Trash2,
  ExternalLink,
  Download,
  Search,
  Filter,
  Plus,
  Zap,
} from 'lucide-react';

export const LibraryWorkspace: React.FC = () => {
  const {
    assets,
    addAsset,
    deleteAsset,
    toggleAssetFavorite,
    activeAsset,
    setActiveAsset,
    openToolWithAsset,
    setCurrentCategory,
    showToast,
  } = useWorkspace();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'ALL' || asset.type === filterType;
    const matchesQuery =
      searchQuery === '' ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      let assetType: AssetType = 'document';
      if (file.type.startsWith('image/')) assetType = 'image';
      else if (file.type.startsWith('video/')) assetType = 'video';
      else if (file.type.startsWith('audio/')) assetType = 'audio';

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addAsset({
          name: file.name,
          dataUrl,
          type: assetType,
          mimeType: file.type,
          sizeBytes: file.size,
          tags: ['uploaded', assetType],
        });
      };

      if (assetType === 'document' && !file.type.includes('pdf')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      let assetType: AssetType = 'document';
      if (file.type.startsWith('image/')) assetType = 'image';
      else if (file.type.startsWith('video/')) assetType = 'video';
      else if (file.type.startsWith('audio/')) assetType = 'audio';

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addAsset({
          name: file.name,
          dataUrl,
          type: assetType,
          mimeType: file.type,
          sizeBytes: file.size,
          tags: ['drag-drop', assetType],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="library-workspace" className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-7 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono mb-1">
            Multi-Modal Asset Repository & Cross-Tool Media
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
            <span>Shared Asset Library</span>
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold not-italic">
              {assets.length} ASSETS
            </span>
          </h1>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed mt-1">
            Unified multi-modal repository accessible by all tools, agents, and automated pipelines.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono uppercase tracking-wider text-xs shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-2xl border border-dashed border-white/20 hover:border-amber-500/60 bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-md group"
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20 group-hover:scale-105 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-serif italic text-white">
          Drag & Drop Images, Audio, Video, or Text documents here
        </p>
        <p className="text-xs text-white/40 font-mono mt-1">
          Supports PNG, JPG, WebP, MP3, WAV, MP4, Markdown, and TXT (Max 50MB)
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'image', 'document', 'audio', 'video'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                filterType === type
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets or tags..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => {
          const isActive = activeAsset?.id === asset.id;
          return (
            <div
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer shadow-lg ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Media Preview Thumbnail */}
                <div className="h-44 rounded-xl bg-black/40 border border-white/10 overflow-hidden mb-3.5 flex items-center justify-center relative group">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : asset.type === 'document' ? (
                    <div className="p-4 text-[10px] font-mono text-white/60 line-clamp-6 whitespace-pre-wrap">
                      {asset.dataUrl.startsWith('data:text')
                        ? decodeURIComponent(asset.dataUrl.replace('data:text/plain;charset=utf-8,', ''))
                        : asset.name}
                    </div>
                  ) : (
                    <div className="text-amber-500">
                      {asset.type === 'audio' ? <FileAudio className="w-10 h-10" /> : <Film className="w-10 h-10" />}
                    </div>
                  )}

                  {/* Top status icons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAssetFavorite(asset.id);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-amber-400 border border-white/10 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${asset.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAsset(asset.id);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-400 border border-white/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-serif italic font-bold text-white truncate">{asset.name}</h3>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{asset.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {asset.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-black/40 border border-white/5 text-[10px] text-white/50 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (asset.type === 'image') {
                      setCurrentCategory('image');
                      openToolWithAsset('enhance', asset);
                    } else if (asset.type === 'document') {
                      setCurrentCategory('documents');
                      openToolWithAsset('chat-with-docs', asset);
                    } else if (asset.type === 'audio') {
                      setCurrentCategory('audio');
                      openToolWithAsset('echoscript', asset);
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-xs font-mono uppercase tracking-wider text-white font-medium flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3 h-3 text-amber-400 group-hover:text-black" />
                  <span>Open in Tool</span>
                </button>

                {isActive && (
                  <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider">
                    ● ACTIVE CONTEXT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

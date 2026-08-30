import React from 'react';
import { NavigationCategory } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Home,
  Bot,
  Image,
  Video,
  AudioLines,
  FileText,
  GraduationCap,
  Sparkles,
  Workflow,
  FolderArchive,
  History,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: NavigationCategory;
  label: string;
  khmerLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', khmerLabel: 'ទំព័រដើម', icon: Home },
  { id: 'ai', label: 'AI WORKSPACE', khmerLabel: 'បន្ទប់បញ្ញា AI', icon: Bot, badge: 'Agent' },
  { id: 'image', label: 'IMAGE', khmerLabel: 'រូបភាព', icon: Image },
  { id: 'video', label: 'VIDEO', khmerLabel: 'វីដេអូ', icon: Video },
  { id: 'audio', label: 'AUDIO', khmerLabel: 'សម្លេង', icon: AudioLines },
  { id: 'documents', label: 'DOCUMENTS', khmerLabel: 'ឯកសារ', icon: FileText },
  { id: 'learning', label: 'LEARNING', khmerLabel: 'ការសិក្សា', icon: GraduationCap },
  { id: 'khmer', label: 'KHMER', khmerLabel: 'ភាសាខ្មែរ', icon: Sparkles, badge: 'Core' },
  { id: 'automation', label: 'AUTOMATION', khmerLabel: 'ស្វ័យប្រវត្តិ', icon: Workflow },
  { id: 'library', label: 'LIBRARY', khmerLabel: 'បណ្ណាល័យ', icon: FolderArchive },
  { id: 'history', label: 'HISTORY', khmerLabel: 'ប្រវត្តិ', icon: History },
  { id: 'settings', label: 'SETTINGS', khmerLabel: 'ការកំណត់', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { currentCategory, setCurrentCategory, setActiveToolId } = useWorkspace();

  const handleNavClick = (category: NavigationCategory) => {
    setCurrentCategory(category);
    setActiveToolId(null); // Reset active tool to show category overview grid
  };

  return (
    <aside
      id="main-sidebar"
      className="w-full md:w-64 lg:w-72 bg-[#121214] border-r border-white/10 flex flex-col justify-between select-none shrink-0"
    >
      {/* Navigation List */}
      <div className="p-4 lg:p-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 font-mono">
          Workstation Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = currentCategory === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 group relative ${
                isActive
                  ? 'bg-white/5 text-amber-400 border border-white/10 font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                ) : (
                  <div className="w-4 h-4 border border-white/30 rounded-sm flex items-center justify-center group-hover:border-white/60 transition-colors">
                    <Icon className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  </div>
                )}

                <div>
                  <span className="text-xs uppercase tracking-wider block font-medium">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-white/40 font-khmer block leading-tight">
                    {item.khmerLabel}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isActive
                      ? 'bg-amber-500 text-black'
                      : item.id === 'khmer'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Panel - Editorial Aesthetic with Storage Meter */}
      <div className="mt-auto p-5 lg:p-6 space-y-3 border-t border-white/5 bg-[#121214]">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/50 font-mono">
          <span>Storage: 42%</span>
          <span className="text-amber-500 font-bold">2.1 GB / 5 GB</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-[42%] transition-all duration-500"></div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Gemini Flash 3.7
          </span>
          <span className="text-amber-500 font-medium">Khmer AI v2.4</span>
        </div>
      </div>
    </aside>
  );
};

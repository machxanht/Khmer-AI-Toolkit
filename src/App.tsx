import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SharedAssistantDrawer } from './components/layout/SharedAssistantDrawer';

// Workspaces
import { HomeWorkspace } from './components/workspaces/HomeWorkspace';
import { AiAgentWorkspace } from './components/workspaces/AiAgentWorkspace';
import { ImageWorkspace } from './components/workspaces/ImageWorkspace';
import { VideoWorkspace } from './components/workspaces/VideoWorkspace';
import { AudioWorkspace } from './components/workspaces/AudioWorkspace';
import { DocumentsWorkspace } from './components/workspaces/DocumentsWorkspace';
import { LearningWorkspace } from './components/workspaces/LearningWorkspace';
import { KhmerWorkspace } from './components/workspaces/KhmerWorkspace';
import { AutomationWorkspace } from './components/workspaces/AutomationWorkspace';
import { LibraryWorkspace } from './components/workspaces/LibraryWorkspace';
import { HistoryWorkspace } from './components/workspaces/HistoryWorkspace';
import { SettingsWorkspace } from './components/workspaces/SettingsWorkspace';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const WorkspaceRouter: React.FC = () => {
  const { currentCategory, toast } = useWorkspace();

  const renderActiveWorkspace = () => {
    switch (currentCategory) {
      case 'home':
        return <HomeWorkspace />;
      case 'ai':
        return <AiAgentWorkspace />;
      case 'image':
        return <ImageWorkspace />;
      case 'video':
        return <VideoWorkspace />;
      case 'audio':
        return <AudioWorkspace />;
      case 'documents':
        return <DocumentsWorkspace />;
      case 'learning':
        return <LearningWorkspace />;
      case 'khmer':
        return <KhmerWorkspace />;
      case 'automation':
        return <AutomationWorkspace />;
      case 'library':
        return <LibraryWorkspace />;
      case 'history':
        return <HistoryWorkspace />;
      case 'settings':
        return <SettingsWorkspace />;
      default:
        return <HomeWorkspace />;
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#E0E0E6] flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-300">
      {/* Top Application Header */}
      <Header />

      {/* Main Tablet-First Workstation Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Navigation Rail / Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace Content Stage */}
        <main
          id="main-workspace-stage"
          className="flex-1 overflow-y-auto bg-[#0D0D0F] p-3 sm:p-5 lg:p-7"
        >
          {renderActiveWorkspace()}
        </main>

        {/* Slide-over Universal AI Orchestration Drawer */}
        <SharedAssistantDrawer />
      </div>

      {/* Toast Notification Alert */}
      {toast && (
        <div
          id="workspace-toast"
          className={`fixed bottom-6 right-6 max-w-sm rounded-2xl p-4 shadow-2xl border flex items-center gap-3 z-50 backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#121214]/95 border-emerald-500/30 text-emerald-200 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-[#121214]/95 border-red-500/30 text-red-200 shadow-red-950/40'
              : toast.type === 'warning'
              ? 'bg-[#121214]/95 border-amber-500/30 text-amber-200 shadow-amber-950/40'
              : 'bg-[#121214]/95 border-white/10 text-[#E0E0E6]'
          }`}
        >
          {getToastIcon(toast.type)}
          <span className="text-xs font-medium tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceRouter />
    </WorkspaceProvider>
  );
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  NavigationCategory,
  LibraryAsset,
  HistoryRecord,
  UserSettings,
  AgentPlan,
  AssetType,
} from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import {
  TOOL_REGISTRY,
  executeTool,
  getGeminiFunctionDeclarations,
  ToolExecutionResult,
  ToolExecutionContext,
} from '../services/toolRegistry';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface WorkspaceContextValue {
  currentCategory: NavigationCategory;
  setCurrentCategory: (cat: NavigationCategory) => void;
  activeToolId: string | null;
  setActiveToolId: (id: string | null) => void;
  activeAsset: LibraryAsset | null;
  setActiveAsset: (asset: LibraryAsset | null) => void;
  assets: LibraryAsset[];
  addAsset: (assetData: {
    name: string;
    dataUrl: string;
    type: AssetType;
    mimeType: string;
    sizeBytes?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => LibraryAsset;
  deleteAsset: (id: string) => void;
  toggleAssetFavorite: (id: string) => void;
  history: HistoryRecord[];
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  activePlan: AgentPlan | null;
  setActivePlan: (plan: AgentPlan | null) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isPlanning: boolean;
  runGlobalCommand: (prompt: string) => Promise<AgentPlan | null>;
  toast: ToastState | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  openToolWithAsset: (toolId: string, asset?: LibraryAsset) => void;
  executeRegisteredTool: (toolId: string, params?: any) => Promise<ToolExecutionResult>;
  runNativeFunctionCalling: (prompt: string) => Promise<{ text: string; executedResults: ToolExecutionResult[] }>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCategory, setCurrentCategory] = useState<NavigationCategory>('home');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<LibraryAsset | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load initial state on mount
  useEffect(() => {
    const loadedAssets = storageService.getAssets();
    setAssets(loadedAssets);
    if (loadedAssets.length > 0) {
      setActiveAsset(loadedAssets[0]);
    }
    setHistory(storageService.getHistory());
    setFavorites(storageService.getFavorites());
    setSettings(storageService.getSettings());
  }, []);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newToast: ToastState = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((cur) => (cur?.id === newToast.id ? null : cur));
    }, 4000);
  };

  const addAsset = (assetData: {
    name: string;
    dataUrl: string;
    type: AssetType;
    mimeType: string;
    sizeBytes?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }): LibraryAsset => {
    const newAsset: LibraryAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: assetData.name,
      type: assetData.type,
      dataUrl: assetData.dataUrl,
      mimeType: assetData.mimeType,
      sizeBytes: assetData.sizeBytes || Math.round((assetData.dataUrl.length || 1024) * 0.75),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: assetData.tags || ['user-upload'],
      isFavorite: false,
      metadata: assetData.metadata,
    };
    const saved = storageService.addAsset(newAsset);
    setAssets(storageService.getAssets());
    setActiveAsset(saved);
    showToast(`Asset "${saved.name}" added to Shared Library`, 'success');
    return saved;
  };

  const deleteAsset = (id: string) => {
    storageService.deleteAsset(id);
    const updated = storageService.getAssets();
    setAssets(updated);
    if (activeAsset?.id === id) {
      setActiveAsset(updated.length > 0 ? updated[0] : null);
    }
    showToast('Asset deleted from library', 'info');
  };

  const toggleAssetFavorite = (id: string) => {
    storageService.toggleAssetFavorite(id);
    setAssets(storageService.getAssets());
  };

  const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    storageService.addHistory(newRecord);
    setHistory(storageService.getHistory());
  };

  const clearHistory = () => {
    storageService.clearHistory();
    setHistory([]);
    showToast('Activity history cleared', 'info');
  };

  const toggleFavorite = (toolId: string) => {
    const updated = storageService.toggleFavorite(toolId);
    setFavorites(updated);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storageService.saveSettings(updated);
    showToast('Settings updated', 'success');
  };

  const openToolWithAsset = (toolId: string, asset?: LibraryAsset) => {
    if (asset) {
      setActiveAsset(asset);
    }
    setActiveToolId(toolId);
  };

  const getExecutionContext = (): ToolExecutionContext => ({
    activeAsset,
    assets,
    saveAsset: (a) => addAsset(a),
    addHistoryRecord,
    setActiveAsset,
    settings,
  });

  const executeRegisteredTool = async (toolId: string, params: any = {}): Promise<ToolExecutionResult> => {
    const ctx = getExecutionContext();
    return await executeTool(toolId, params, ctx);
  };

  const runNativeFunctionCalling = async (
    prompt: string
  ): Promise<{ text: string; executedResults: ToolExecutionResult[] }> => {
    const declarations = getGeminiFunctionDeclarations();
    const ctx = getExecutionContext();
    const response = await geminiService.runFunctionCall(prompt, declarations, activeAsset);
    
    const executedResults: ToolExecutionResult[] = [];
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const fc of response.functionCalls) {
        showToast(`Executing tool: ${fc.name}...`, 'info');
        const res = await executeTool(fc.name, fc.args || {}, ctx);
        executedResults.push(res);
      }
    }

    return {
      text: response.text,
      executedResults,
    };
  };

  const runGlobalCommand = async (prompt: string): Promise<AgentPlan | null> => {
    if (!prompt.trim()) return null;
    setIsPlanning(true);
    try {
      showToast('AI Brain analyzing request and structuring tool pipeline...', 'info');
      const plan = await geminiService.planCommand(
        prompt,
        currentCategory,
        activeAsset ? { name: activeAsset.name, type: activeAsset.type } : null
      );
      setActivePlan(plan);
      setIsAssistantOpen(true);

      // Auto route to appropriate workspace if recommended
      if (plan.targetWorkspace && plan.targetWorkspace !== currentCategory) {
        setCurrentCategory(plan.targetWorkspace);
      }

      // Record in history
      addHistoryRecord({
        toolId: 'versatile-agent',
        toolName: 'Universal AI Orchestrator',
        category: plan.targetWorkspace || 'ai',
        prompt,
        improvedPrompt: plan.improvedPrompt,
        outputText: plan.summary,
        status: 'success',
      });

      return plan;
    } catch (err: any) {
      showToast(err.message || 'Failed to process AI command', 'error');
      return null;
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentCategory,
        setCurrentCategory,
        activeToolId,
        setActiveToolId,
        activeAsset,
        setActiveAsset,
        assets,
        addAsset,
        deleteAsset,
        toggleAssetFavorite,
        history,
        addHistoryRecord,
        clearHistory,
        favorites,
        toggleFavorite,
        settings,
        updateSettings,
        activePlan,
        setActivePlan,
        isAssistantOpen,
        setIsAssistantOpen,
        isPlanning,
        runGlobalCommand,
        toast,
        showToast,
        openToolWithAsset,
        executeRegisteredTool,
        runNativeFunctionCalling,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};


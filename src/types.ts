/**
 * Khmer AI Toolkit - Unified Type Definitions
 */

export type NavigationCategory =
  | 'home'
  | 'ai'
  | 'image'
  | 'video'
  | 'audio'
  | 'documents'
  | 'learning'
  | 'khmer'
  | 'automation'
  | 'library'
  | 'history'
  | 'settings';

export type ToolStatus = 'available' | 'requires_api' | 'coming_soon';

export interface ToolDefinition {
  id: string;
  name: string;
  category: NavigationCategory;
  subcategory: string;
  vietnameseDesc: string;
  description: string;
  icon: string;
  status: ToolStatus;
  badge?: string;
  isFavorite?: boolean;
  tags: string[];
  requiredModel?: string;
  inputTypes?: ('image' | 'video' | 'audio' | 'document' | 'text')[];
  outputTypes?: ('image' | 'video' | 'audio' | 'document' | 'text' | 'json')[];
}

export type AssetType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'project'
  | 'generated'
  | 'export';

export interface LibraryAsset {
  id: string;
  name: string;
  type: AssetType;
  dataUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isFavorite?: boolean;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    toolOrigin?: string;
    prompt?: string;
    characterCount?: number;
    factor?: string;
    aspectRatio?: string;
    lyrics?: string;
    dimensions?: string;
    originalDimensions?: string;
    [key: string]: any;
  };
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  toolId: string;
  toolName: string;
  category: NavigationCategory;
  prompt: string;
  improvedPrompt?: string;
  settings?: Record<string, any>;
  inputAssetId?: string;
  inputPreview?: string;
  outputAssetId?: string;
  outputPreview?: string;
  outputText?: string;
  status: 'success' | 'failed' | 'running';
  executionTimeMs?: number;
}

export interface AgentExecutionStep {
  stepNumber: number;
  toolId: string;
  toolName: string;
  action: string;
  params: Record<string, any>;
  expectedOutput: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface AgentPlan {
  intent: string;
  summary: string;
  confidence: number;
  targetWorkspace: NavigationCategory;
  steps: AgentExecutionStep[];
  improvedPrompt?: string;
  constraintsPreserved?: string[];
}

export interface WorkflowNode {
  id: string;
  toolId: string;
  title: string;
  type: 'input' | 'process' | 'transform' | 'output';
  position: { x: number; y: number };
  params: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'failed';
  outputData?: any;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}

export interface KhmerAlphabetItem {
  char: string;
  name: string;
  ipa: string;
  series: 'first' | 'second' | 'vowel' | 'independent' | 'subscript' | 'A' | 'O';
  meaning?: string;
  exampleWord?: string;
  exampleMeaning?: string;
}

export interface FlashcardItem {
  id: string;
  khmer: string;
  ipa: string;
  english: string;
  vietnamese: string;
  partOfSpeech: string;
  exampleKhmer: string;
  exampleEnglish: string;
  category: string;
  masteryLevel: number; // 0 to 5
}

export interface UserSettings {
  language: 'en' | 'vi' | 'km';
  theme: 'dark' | 'dim';
  autoPreserveConstraints: boolean;
  voiceFeedback: boolean;
  defaultImageResolution: '1K' | '2K' | '512px';
  preferredModel: string;
}

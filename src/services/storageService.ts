import { LibraryAsset, HistoryRecord, SavedWorkflow, UserSettings } from '../types';

const STORAGE_KEYS = {
  ASSETS: 'khmer_toolkit_assets',
  HISTORY: 'khmer_toolkit_history',
  WORKFLOWS: 'khmer_toolkit_workflows',
  FAVORITES: 'khmer_toolkit_favorites',
  SETTINGS: 'khmer_toolkit_settings',
};

// Initial default high quality sample assets so users can immediately test tools
const INITIAL_ASSETS: LibraryAsset[] = [
  {
    id: 'asset-angkor-stone',
    name: 'angkor_wat_bas_relief.png',
    type: 'image',
    dataUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    mimeType: 'image/png',
    sizeBytes: 1024 * 650,
    createdAt: Date.now() - 3600 * 1000 * 24,
    updatedAt: Date.now() - 3600 * 1000 * 24,
    tags: ['khmer', 'heritage', 'stone-carving', 'ocr-ready'],
    isFavorite: true,
    metadata: {
      width: 1200,
      height: 800,
      toolOrigin: 'Default Showcase Library',
      prompt: 'Angkor Wat stone bas-relief with historical epigraphy',
    },
  },
  {
    id: 'asset-product-bottle',
    name: 'organic_cambodian_lotus_tea.png',
    type: 'image',
    dataUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    mimeType: 'image/png',
    sizeBytes: 1024 * 420,
    createdAt: Date.now() - 3600 * 1000 * 12,
    updatedAt: Date.now() - 3600 * 1000 * 12,
    tags: ['product', 'mockup', 'ecommerce', 'tea-pack'],
    isFavorite: true,
    metadata: {
      width: 1000,
      height: 1000,
      toolOrigin: 'Product Mockup Studio',
      prompt: 'Minimalist artisanal tea container packshot on neutral studio table',
    },
  },
  {
    id: 'asset-doc-kbach',
    name: 'angkor_architecture_treatise.md',
    type: 'document',
    dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(
      `# Classical Khmer Architecture & Sacred Proportions\n\n## 1. The Meru Cosmology\nAngkorian temple-mountains represent the sacred Mount Meru, the cosmic center of Hindu-Buddhist cosmology. The five central towers of Angkor Wat mirror the five sacred peaks, while the expansive outer moat symbolizes the cosmic Ocean of Milk.\n\n## 2. Decorative Ornaments (Kbach)\n- Kbach Phni Tes: Continuous spiraling floral vines.\n- Kbach Vor: Delicate leaf tendrils adorning lintels and pilasters.\n- Kbach Chan: Four-petaled celestial star flowers carved on column pedestals.\n\n## 3. Epigraphy & Inscriptions\nStone stelae (K. Inscriptions) located at temple gopuras document royal edicts, foundation dates, and offerings in Sanskrit and Old Khmer script.`
    )}`,
    mimeType: 'text/markdown',
    sizeBytes: 1420,
    createdAt: Date.now() - 3600 * 1000 * 8,
    updatedAt: Date.now() - 3600 * 1000 * 8,
    tags: ['architecture', 'khmer-studies', 'kbach', 'research'],
    isFavorite: false,
    metadata: {
      characterCount: 840,
      toolOrigin: 'Infinite Wiki',
    },
  },
];

const INITIAL_WORKFLOWS: SavedWorkflow[] = [
  {
    id: 'wf-ecommerce-packager',
    name: 'E-Commerce Amazon Packager',
    description: 'Automatic workflow: Upload Product -> Segment Object -> Remove Background -> Upscale 8x -> Export PNG',
    createdAt: Date.now() - 3600 * 1000 * 48,
    updatedAt: Date.now() - 3600 * 1000 * 48,
    isFavorite: true,
    nodes: [
      {
        id: 'node-1',
        toolId: 'input-asset',
        title: 'Input Image Asset',
        type: 'input',
        position: { x: 50, y: 120 },
        params: { source: 'organic_cambodian_lotus_tea.png' },
        status: 'success',
      },
      {
        id: 'node-2',
        toolId: 'agentic-vision',
        title: 'Agentic Vision (Detect)',
        type: 'process',
        position: { x: 300, y: 120 },
        params: { task: 'detect_objects' },
        status: 'success',
      },
      {
        id: 'node-3',
        toolId: 'pixshop',
        title: 'Pixshop (Remove BG)',
        type: 'transform',
        position: { x: 560, y: 120 },
        params: { mode: 'transparent-cutout', preserveLines: true },
        status: 'success',
      },
      {
        id: 'node-4',
        toolId: 'enhance',
        title: 'ENHANCE! (8x Scaler)',
        type: 'transform',
        position: { x: 820, y: 120 },
        params: { factor: '8x', denoise: true },
        status: 'success',
      },
      {
        id: 'node-5',
        toolId: 'export-zip',
        title: 'Export Transparent PNG',
        type: 'output',
        position: { x: 1080, y: 120 },
        params: { format: 'png', quality: 1.0 },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'e1-2', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { id: 'e2-3', sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { id: 'e3-4', sourceNodeId: 'node-3', targetNodeId: 'node-4' },
      { id: 'e4-5', sourceNodeId: 'node-4', targetNodeId: 'node-5' },
    ],
  },
  {
    id: 'wf-khmer-script-study',
    name: 'Khmer Inscription Analyzer',
    description: 'Pipeline: Stone Inscription Image -> Khmer Epigraphy OCR -> Chuon Nath Lexicon Lookup -> English Translation',
    createdAt: Date.now() - 3600 * 1000 * 24,
    updatedAt: Date.now() - 3600 * 1000 * 24,
    isFavorite: false,
    nodes: [
      {
        id: 'node-k1',
        toolId: 'input-asset',
        title: 'Temple Inscription Photo',
        type: 'input',
        position: { x: 60, y: 100 },
        params: { source: 'angkor_wat_bas_relief.png' },
        status: 'idle',
      },
      {
        id: 'node-k2',
        toolId: 'khmer-ocr',
        title: 'Khmer Script OCR',
        type: 'process',
        position: { x: 340, y: 100 },
        params: { detectScript: 'khmer-classical' },
        status: 'idle',
      },
      {
        id: 'node-k3',
        toolId: 'khmer-dict',
        title: 'Chuon Nath Lexicon Lookup',
        type: 'transform',
        position: { x: 620, y: 100 },
        params: { crossReference: 'etymology' },
        status: 'idle',
      },
      {
        id: 'node-k4',
        toolId: 'khmer-translate',
        title: 'Multilingual Translation',
        type: 'output',
        position: { x: 900, y: 100 },
        params: { targetLangs: ['en', 'vi'] },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'ek1-2', sourceNodeId: 'node-k1', targetNodeId: 'node-k2' },
      { id: 'ek2-3', sourceNodeId: 'node-k2', targetNodeId: 'node-k3' },
      { id: 'ek3-4', sourceNodeId: 'node-k3', targetNodeId: 'node-k4' },
    ],
  },
];

const INITIAL_SETTINGS: UserSettings = {
  language: 'en',
  theme: 'dark',
  autoPreserveConstraints: true,
  voiceFeedback: true,
  defaultImageResolution: '1K',
  preferredModel: 'gemini-3.7-flash',
};

export const storageService = {
  getAssets(): LibraryAsset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (!data) {
        this.saveAssets(INITIAL_ASSETS);
        return INITIAL_ASSETS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: LibraryAsset[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  addAsset(asset: LibraryAsset): LibraryAsset {
    const assets = this.getAssets();
    const updated = [asset, ...assets.filter((a) => a.id !== asset.id)];
    this.saveAssets(updated);
    return asset;
  },

  deleteAsset(id: string) {
    const assets = this.getAssets().filter((a) => a.id !== id);
    this.saveAssets(assets);
  },

  toggleAssetFavorite(id: string) {
    const assets = this.getAssets().map((a) =>
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    );
    this.saveAssets(assets);
  },

  getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistory(record: HistoryRecord) {
    try {
      const history = this.getHistory();
      const updated = [record, ...history].slice(0, 50); // Keep latest 50
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('History save error:', e);
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getWorkflows(): SavedWorkflow[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (!data) {
        this.saveWorkflows(INITIAL_WORKFLOWS);
        return INITIAL_WORKFLOWS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WORKFLOWS;
    }
  },

  saveWorkflows(workflows: SavedWorkflow[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.warn('Workflows save error:', e);
    }
  },

  saveWorkflow(workflow: SavedWorkflow) {
    const list = this.getWorkflows();
    const existingIndex = list.findIndex((w) => w.id === workflow.id);
    let updated: SavedWorkflow[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...workflow, updatedAt: Date.now() };
    } else {
      updated = [workflow, ...list];
    }
    this.saveWorkflows(updated);
  },

  deleteWorkflow(id: string) {
    const list = this.getWorkflows().filter((w) => w.id !== id);
    this.saveWorkflows(list);
  },

  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['nano-banana', 'enhance', 'khmer-lang', 'versatile-agent', 'echoscript'];
    } catch {
      return ['nano-banana', 'enhance', 'khmer-lang', 'versatile-agent', 'echoscript'];
    }
  },

  toggleFavorite(toolId: string): string[] {
    const favs = this.getFavorites();
    const next = favs.includes(toolId) ? favs.filter((f) => f !== toolId) : [...favs, toolId];
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
    return next;
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Settings save error:', e);
    }
  },
};

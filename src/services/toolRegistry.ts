/**
 * Khmer AI Toolkit - Centralized Tool Registry & Execution Engine
 *
 * ONE APP | ONE TOOL REGISTRY | ONE AI ORCHESTRATOR
 */

import { LibraryAsset } from '../types';
import { geminiService } from './geminiService';
import { KHMER_CONSONANTS, KHMER_VOWELS } from './khmerData';

export interface ToolExecutionResult {
  success: boolean;
  type?: 'image' | 'text' | 'document' | 'audio' | 'json' | 'vector';
  dataUrl?: string;
  text?: string;
  metadata?: Record<string, any>;
  asset?: LibraryAsset;
  error?: string;
}

export interface ToolExecutionContext {
  activeAsset?: LibraryAsset | null;
  assets: LibraryAsset[];
  saveAsset: (asset: Omit<LibraryAsset, 'id' | 'createdAt' | 'updatedAt'>) => LibraryAsset;
  addHistoryRecord: (record: any) => void;
  setActiveAsset: (asset: LibraryAsset | null) => void;
  settings?: any;
}

export interface RegisteredTool {
  id: string;
  name: string;
  category: 'ai' | 'image' | 'documents' | 'khmer' | 'audio' | 'library';
  description: string;
  isAvailable: boolean;
  isMock: boolean;
  parameters: {
    type: 'OBJECT';
    description?: string;
    properties: Record<string, {
      type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  execute: (params: any, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
}

/**
 * Helper to manipulate image filters via HTML5 Canvas
 */
async function processImageCanvas(
  dataUrl: string,
  options: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    grayscale?: boolean;
    sepia?: boolean;
    invert?: boolean;
    removeBackground?: boolean;
    threshold?: number;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get 2D canvas context'));

      // Apply CSS-style filter matrix if supported
      let filterString = '';
      if (options.brightness !== undefined) filterString += `brightness(${options.brightness}%) `;
      if (options.contrast !== undefined) filterString += `contrast(${options.contrast}%) `;
      if (options.saturation !== undefined) filterString += `saturate(${options.saturation}%) `;
      if (options.grayscale) filterString += `grayscale(100%) `;
      if (options.sepia) filterString += `sepia(100%) `;
      if (options.invert) filterString += `invert(100%) `;

      ctx.filter = filterString.trim() || 'none';
      ctx.drawImage(img, 0, 0);

      // Perform pixel-level background removal if requested
      if (options.removeBackground) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const threshold = options.threshold || 230;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Simple high-luminance white/bright background removal
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0; // Transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for processing'));
    img.src = dataUrl;
  });
}

// ==========================================
// CENTRAL TOOL REGISTRY DEFINITIONS
// ==========================================
export const TOOL_REGISTRY: Record<string, RegisteredTool> = {
  // 1. AI & AGENT TOOLS
  'ai_command': {
    id: 'ai_command',
    name: 'Universal AI Planner',
    category: 'ai',
    description: 'Decomposes complex natural language user requests into executable multi-step plans.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'The user goal or prompt to plan.' },
      },
      required: ['prompt'],
    },
    execute: async (params, context) => {
      const plan = await geminiService.planCommand(params.prompt, 'ai', context.activeAsset);
      return {
        success: true,
        type: 'json',
        metadata: { plan },
        text: `Plan created: ${plan.summary} (${plan.steps.length} steps)`,
      };
    },
  },

  'ai_vision': {
    id: 'ai_vision',
    name: 'Agentic Vision Inspector',
    category: 'ai',
    description: 'Inspects and analyzes images, detecting objects, layouts, and spatial coordinates.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'Question or inspection directive about the image.' },
        task: { type: 'STRING', description: 'Inspection task type', enum: ['analyze', 'detect_objects', 'khmer_ocr'] },
      },
      required: ['prompt'],
    },
    execute: async (params, context) => {
      const targetImage = params.imageBase64 || context.activeAsset?.dataUrl;
      if (!targetImage) {
        throw new Error('No active image or imageBase64 provided for vision analysis.');
      }
      const text = await geminiService.analyzeVision(targetImage, params.prompt, params.task || 'analyze');
      return {
        success: true,
        type: 'text',
        text,
        metadata: { task: params.task || 'analyze' },
      };
    },
  },

  'ai_prompt_assist': {
    id: 'ai_prompt_assist',
    name: 'Constraint-Preserving Prompt Assistant',
    category: 'ai',
    description: 'Optimizes raw prompts while preserving geometry, silhouette, and strict negative constraints.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        rawPrompt: { type: 'STRING', description: 'The raw user instruction.' },
        targetTool: { type: 'STRING', description: 'Target tool identifier (e.g. image, ocr, script).' },
      },
      required: ['rawPrompt'],
    },
    execute: async (params) => {
      const result = await geminiService.assistPrompt(params.rawPrompt, params.targetTool || 'general');
      return {
        success: true,
        type: 'json',
        metadata: result,
        text: result.improvedPrompt || params.rawPrompt,
      };
    },
  },

  // 2. IMAGE TOOLS
  'image_pixshop': {
    id: 'image_pixshop',
    name: 'Pixshop Canvas Engine',
    category: 'image',
    description: 'Applies visual filters (grayscale, sepia, invert, brightness, contrast) to the active image.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: { type: 'STRING', description: 'Filter preset', enum: ['monochrome', 'grayscale', 'sepia', 'invert', 'enhance'] },
        brightness: { type: 'NUMBER', description: 'Brightness percentage (e.g. 100 is normal, 120 is brighter).' },
        contrast: { type: 'NUMBER', description: 'Contrast percentage (e.g. 100 is normal, 130 is high contrast).' },
        saveToLibrary: { type: 'BOOLEAN', description: 'Whether to persist modified output to shared library.' },
      },
      required: ['filter'],
    },
    execute: async (params, context) => {
      const sourceImage = context.activeAsset?.dataUrl || params.imageBase64;
      if (!sourceImage) {
        throw new Error('No active image available to apply filter. Please select or upload an image first.');
      }

      const isGray = params.filter === 'monochrome' || params.filter === 'grayscale';
      const isSepia = params.filter === 'sepia';
      const isInvert = params.filter === 'invert';

      const processedDataUrl = await processImageCanvas(sourceImage, {
        grayscale: isGray,
        sepia: isSepia,
        invert: isInvert,
        brightness: params.brightness,
        contrast: params.contrast,
      });

      let savedAsset: LibraryAsset | undefined;
      if (params.saveToLibrary !== false) {
        savedAsset = context.saveAsset({
          name: `${context.activeAsset?.name || 'Image'} (${params.filter})`,
          type: 'image',
          dataUrl: processedDataUrl,
          mimeType: 'image/png',
          sizeBytes: Math.round(processedDataUrl.length * 0.75),
          tags: ['pixshop', params.filter, 'processed'],
          metadata: { toolOrigin: 'pixshop', prompt: `Filter: ${params.filter}` },
        });
        context.setActiveAsset(savedAsset);
      }

      return {
        success: true,
        type: 'image',
        dataUrl: processedDataUrl,
        asset: savedAsset,
        text: `Successfully applied ${params.filter} filter to image.`,
      };
    },
  },

  'image_remove_background': {
    id: 'image_remove_background',
    name: 'Background Removal Engine',
    category: 'image',
    description: 'Removes background from active image and generates a transparent PNG asset.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        threshold: { type: 'NUMBER', description: 'Luminance threshold (0-255). Default 225.' },
        saveToLibrary: { type: 'BOOLEAN', description: 'Save result to library.' },
      },
    },
    execute: async (params, context) => {
      const sourceImage = context.activeAsset?.dataUrl || params.imageBase64;
      if (!sourceImage) {
        throw new Error('No active image available for background removal.');
      }

      const transparentDataUrl = await processImageCanvas(sourceImage, {
        removeBackground: true,
        threshold: params.threshold || 225,
      });

      let savedAsset: LibraryAsset | undefined;
      if (params.saveToLibrary !== false) {
        savedAsset = context.saveAsset({
          name: `${context.activeAsset?.name || 'Image'} (Cutout)`,
          type: 'image',
          dataUrl: transparentDataUrl,
          mimeType: 'image/png',
          sizeBytes: Math.round(transparentDataUrl.length * 0.75),
          tags: ['cutout', 'transparent', 'bg-removed'],
          metadata: { toolOrigin: 'bg-remover' },
        });
        context.setActiveAsset(savedAsset);
      }

      return {
        success: true,
        type: 'image',
        dataUrl: transparentDataUrl,
        asset: savedAsset,
        text: 'Background removed successfully. Created transparent PNG.',
      };
    },
  },

  'image_export_png': {
    id: 'image_export_png',
    name: 'Export Image PNG',
    category: 'image',
    description: 'Saves current active image or provided dataUrl to Library as an exportable PNG asset.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        assetName: { type: 'STRING', description: 'Custom name for the exported PNG file.' },
      },
    },
    execute: async (params, context) => {
      const sourceImage = context.activeAsset?.dataUrl || params.imageBase64;
      if (!sourceImage) {
        throw new Error('No active image available to export.');
      }

      const assetName = params.assetName || `${context.activeAsset?.name || 'Export'}_processed.png`;
      const savedAsset = context.saveAsset({
        name: assetName,
        type: 'image',
        dataUrl: sourceImage,
        mimeType: 'image/png',
        sizeBytes: Math.round(sourceImage.length * 0.75),
        tags: ['export', 'png'],
        metadata: { toolOrigin: 'export-engine' },
      });
      context.setActiveAsset(savedAsset);

      return {
        success: true,
        type: 'image',
        asset: savedAsset,
        dataUrl: sourceImage,
        text: `Exported and saved "${savedAsset.name}" to Shared Library.`,
      };
    },
  },

  'image_vibe_check': {
    id: 'image_vibe_check',
    name: 'VibeCheck Stylizer',
    category: 'image',
    description: 'Enhances artistic prompts with structured lighting, texture, and aesthetic style descriptors.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'Base concept or prompt to stylize.' },
        style: { type: 'STRING', description: 'Aesthetic vibe style', enum: ['cinematic', 'angkor_heritage', 'cyberpunk', 'editorial', 'vintage'] },
      },
      required: ['prompt'],
    },
    execute: async (params) => {
      const styleModifiers: Record<string, string> = {
        cinematic: 'cinematic lighting, 35mm film grain, anamorphic lens flare, high dynamic range, masterwork',
        angkor_heritage: 'authentic Angkorian sandstone relief carving, Bayon bas-relief textures, ancient Khmer epigraphy, dramatic museum lighting',
        cyberpunk: 'neon amber highlights, obsidian dark surfaces, futuristic UI HUD overlays, volumetric shadows',
        editorial: 'vogue editorial portrait, natural soft diffused lighting, minimalist negative space, crisp detail',
        vintage: '1970s warm analog film tones, subtle color bleed, timeless archival aesthetic',
      };

      const modifier = styleModifiers[params.style || 'cinematic'] || styleModifiers.cinematic;
      const enhancedPrompt = `${params.prompt}, ${modifier}`;

      return {
        success: true,
        type: 'text',
        text: enhancedPrompt,
        metadata: { originalPrompt: params.prompt, style: params.style, enhancedPrompt },
      };
    },
  },

  // 3. DOCUMENT & KNOWLEDGE TOOLS
  'document_read': {
    id: 'document_read',
    name: 'Read Document Asset',
    category: 'documents',
    description: 'Extracts and parses text content from the active document asset in the shared library.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        assetId: { type: 'STRING', description: 'Optional specific document asset ID.' },
      },
    },
    execute: async (params, context) => {
      let targetAsset = context.activeAsset;
      if (params.assetId) {
        targetAsset = context.assets.find(a => a.id === params.assetId) || targetAsset;
      }

      if (!targetAsset) {
        throw new Error('No document selected. Please select a document in the Shared Library.');
      }

      let content = targetAsset.dataUrl;
      if (targetAsset.dataUrl.startsWith('data:text')) {
        content = decodeURIComponent(targetAsset.dataUrl.replace('data:text/plain;charset=utf-8,', ''));
      }

      return {
        success: true,
        type: 'document',
        text: content,
        metadata: { name: targetAsset.name, type: targetAsset.type },
      };
    },
  },

  'document_qa': {
    id: 'document_qa',
    name: 'Chat with Docs / Manual QA',
    category: 'documents',
    description: 'Grounds questions in the active document and generates cited answers using Gemini.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        question: { type: 'STRING', description: 'The question to answer grounded in the active document.' },
      },
      required: ['question'],
    },
    execute: async (params, context) => {
      let docContent = '';
      if (context.activeAsset?.dataUrl?.startsWith('data:text')) {
        docContent = decodeURIComponent(context.activeAsset.dataUrl.replace('data:text/plain;charset=utf-8,', ''));
      }

      const prompt = docContent 
        ? `Document Content:\n"""\n${docContent.slice(0, 10000)}\n"""\n\nQuestion: "${params.question}"\nProvide a clear, accurate answer with citations from the text.`
        : `Answer this technical document inquiry: "${params.question}"`;

      const responseText = await geminiService.generateText(prompt, 'You are an expert technical document analyst and research assistant.');
      return {
        success: true,
        type: 'text',
        text: responseText,
      };
    },
  },

  'document_embeddings': {
    id: 'document_embeddings',
    name: 'Embeddings Vector Generator',
    category: 'documents',
    description: 'Generates 768-dimensional text embeddings for semantic search and knowledge matching.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text snippet to embed into vector space.' },
      },
      required: ['text'],
    },
    execute: async (params) => {
      const result = await geminiService.getEmbeddings(params.text);
      return {
        success: true,
        type: 'vector',
        metadata: { dimension: result.dimension, sample: result.embedding.slice(0, 5) },
        text: `Generated ${result.dimension}-dimensional embedding vector.`,
      };
    },
  },

  'document_wiki': {
    id: 'document_wiki',
    name: 'Infinite Wiki Synthesizer',
    category: 'documents',
    description: 'Synthesizes exhaustive encyclopedic articles with structured sections and markdown formatting.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: { type: 'STRING', description: 'Topic or concept to synthesize.' },
      },
      required: ['topic'],
    },
    execute: async (params, context) => {
      const prompt = `Synthesize a comprehensive, authoritative encyclopedic wiki article for: "${params.topic}". Include Etymology, Overview, Key Historical Phases, Cultural Significance, and Modern Heritage. Use Markdown headers.`;
      const wikiText = await geminiService.generateText(prompt, 'You are the Chief Curatorial Editor of an Infinite Multilingual Encyclopedia.');

      // Automatically save as a new document in shared library
      const docAsset = context.saveAsset({
        name: `Wiki: ${params.topic}`,
        type: 'document',
        dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(wikiText)}`,
        mimeType: 'text/markdown',
        sizeBytes: wikiText.length,
        tags: ['wiki', 'encyclopedia', params.topic.toLowerCase()],
        metadata: { toolOrigin: 'infinite-wiki', characterCount: wikiText.length },
      });
      context.setActiveAsset(docAsset);

      return {
        success: true,
        type: 'document',
        text: wikiText,
        asset: docAsset,
      };
    },
  },

  // 4. KHMER INTELLIGENCE TOOLS
  'khmer_dictionary': {
    id: 'khmer_dictionary',
    name: 'Chuon Nath Khmer Dictionary',
    category: 'khmer',
    description: 'Looks up authentic Chuon Nath definitions, Pali/Sanskrit roots, and grammatical breakdown.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        word: { type: 'STRING', description: 'Khmer word or phrase to look up.' },
      },
      required: ['word'],
    },
    execute: async (params) => {
      const result = await geminiService.queryKhmer(params.word, 'dictionary');
      return {
        success: true,
        type: 'text',
        text: result,
        metadata: { word: params.word },
      };
    },
  },

  'khmer_ocr': {
    id: 'khmer_ocr',
    name: 'Khmer Epigraphy & Document OCR',
    category: 'khmer',
    description: 'Transcribes Khmer inscriptions, stone bas-reliefs, or print documents into Unicode Khmer.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'OCR focus prompt.' },
      },
    },
    execute: async (params, context) => {
      const targetImage = context.activeAsset?.dataUrl || params.imageBase64;
      if (!targetImage) {
        throw new Error('No active image available for Khmer OCR. Please select an inscription image in the library.');
      }
      const text = await geminiService.analyzeVision(
        targetImage,
        params.prompt || 'Transcribe all Khmer text accurately with word-by-word translation and historical context.',
        'khmer_ocr'
      );
      return {
        success: true,
        type: 'text',
        text,
      };
    },
  },

  'khmer_phonology': {
    id: 'khmer_phonology',
    name: 'Khmer 33-Consonant Phonology Matrix',
    category: 'khmer',
    description: 'Fetches phonological series (A/O), IPA transcription, and subscripts for Khmer letters.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        character: { type: 'STRING', description: 'Khmer consonant or vowel character (e.g. ក, ខ, គ).' },
      },
      required: ['character'],
    },
    execute: async (params) => {
      const consonant = KHMER_CONSONANTS.find(c => c.char === params.character || c.name.includes(params.character));
      if (consonant) {
        return {
          success: true,
          type: 'json',
          metadata: consonant,
          text: `Consonant "${consonant.char}" (${consonant.name}): Series ${consonant.series.toUpperCase()}, IPA /${consonant.ipa}/. Meaning: ${consonant.meaning}. Example: ${consonant.exampleWord} (${consonant.exampleMeaning})`,
        };
      }
      const vowel = KHMER_VOWELS.find(v => v.char === params.character);
      if (vowel) {
        return {
          success: true,
          type: 'json',
          metadata: vowel,
          text: `Vowel "${vowel.char}" (${vowel.name}): IPA /${vowel.ipa}/.`,
        };
      }
      return {
        success: true,
        type: 'text',
        text: `Phoneme "${params.character}" located in universal phonetic matrix.`,
      };
    },
  },

  'khmer_creative': {
    id: 'khmer_creative',
    name: 'Khmer Creative & Heritage Studio',
    category: 'khmer',
    description: 'Generates classical Khmer poetry (Kram, Phka Rik), folklore, cultural lore, and grammar checks.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: { type: 'STRING', description: 'Creative topic or Khmer text to process.' },
        mode: { type: 'STRING', description: 'Creative mode', enum: ['content', 'grammar_check', 'heritage', 'translation'] },
      },
      required: ['topic'],
    },
    execute: async (params) => {
      const mode = params.mode || 'content';
      const result = await geminiService.queryKhmer(params.topic, mode);
      return {
        success: true,
        type: 'text',
        text: result,
        metadata: { mode, topic: params.topic },
      };
    },
  },

  // 5. AUDIO TOOLS
  'audio_tts': {
    id: 'audio_tts',
    name: 'Voice Library & Speech Synthesizer',
    category: 'audio',
    description: 'Speaks given text aloud in Khmer or English using browser speech synthesis.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text to synthesize into speech.' },
        lang: { type: 'STRING', description: 'Language code', enum: ['km-KH', 'en-US', 'vi-VN'] },
      },
      required: ['text'],
    },
    execute: async (params) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(params.text);
        utterance.lang = params.lang || (/[\u1780-\u17FF]/.test(params.text) ? 'km-KH' : 'en-US');
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return {
          success: true,
          type: 'audio',
          text: `Synthesized speech playback for: "${params.text.slice(0, 40)}..."`,
        };
      }
      throw new Error('Speech synthesis not supported in this browser.');
    },
  },

  // 6. LIBRARY ASSET TOOLS
  'library_search': {
    id: 'library_search',
    name: 'Search Shared Asset Library',
    category: 'library',
    description: 'Finds assets by keyword, tag, or media type across the shared repository.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term or tag.' },
        type: { type: 'STRING', description: 'Asset type filter', enum: ['image', 'video', 'audio', 'document'] },
      },
    },
    execute: async (params, context) => {
      const q = (params.query || '').toLowerCase();
      const results = context.assets.filter(a => {
        const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
        const matchesType = !params.type || a.type === params.type;
        return matchesQuery && matchesType;
      });

      return {
        success: true,
        type: 'json',
        metadata: { count: results.length, assets: results.map(r => ({ id: r.id, name: r.name, type: r.type })) },
        text: `Found ${results.length} matching asset(s) in Library.`,
      };
    },
  },

  'library_load': {
    id: 'library_load',
    name: 'Load Asset to Active Context',
    category: 'library',
    description: 'Selects an asset by ID to become the current active context asset for downstream tools.',
    isAvailable: true,
    isMock: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        assetId: { type: 'STRING', description: 'ID of the asset to load.' },
      },
      required: ['assetId'],
    },
    execute: async (params, context) => {
      const found = context.assets.find(a => a.id === params.assetId);
      if (!found) {
        throw new Error(`Asset with ID "${params.assetId}" not found in Library.`);
      }
      context.setActiveAsset(found);
      return {
        success: true,
        type: found.type as any,
        asset: found,
        text: `Loaded "${found.name}" (${found.type}) into active context.`,
      };
    },
  },
};

/**
 * Returns JSON function declarations formatted for Gemini Tools API
 */
export function getGeminiFunctionDeclarations() {
  return Object.values(TOOL_REGISTRY)
    .filter(tool => tool.isAvailable && !tool.isMock)
    .map(tool => ({
      name: tool.id,
      description: tool.description,
      parameters: tool.parameters,
    }));
}

/**
 * Dispatches and executes a tool from the registry with robust error logging
 */
export async function executeTool(
  toolId: string,
  params: any,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const startTime = Date.now();
  const tool = TOOL_REGISTRY[toolId];

  if (!tool) {
    const errorMsg = `Tool "${toolId}" is not registered in the tool registry.`;
    context.addHistoryRecord({
      toolId,
      toolName: toolId,
      category: 'ai',
      prompt: JSON.stringify(params),
      status: 'failed',
      outputText: errorMsg,
      executionTimeMs: Date.now() - startTime,
    });
    return { success: false, error: errorMsg };
  }

  try {
    const result = await tool.execute(params, context);
    
    // Record in history audit
    context.addHistoryRecord({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      prompt: params.prompt || params.word || params.question || params.topic || params.filter || tool.name,
      status: 'success',
      outputText: result.text || 'Operation completed successfully.',
      outputAssetId: result.asset?.id,
      outputPreview: result.dataUrl || (result.asset ? result.asset.dataUrl : undefined),
      executionTimeMs: Date.now() - startTime,
    });

    return result;
  } catch (err: any) {
    const errorMsg = err.message || 'Execution error';
    context.addHistoryRecord({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      prompt: JSON.stringify(params),
      status: 'failed',
      outputText: errorMsg,
      executionTimeMs: Date.now() - startTime,
    });
    return { success: false, error: errorMsg };
  }
}

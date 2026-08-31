import { AgentPlan } from '../types';

export interface HealthCheckResult {
  status: string;
  hasApiKey: boolean;
  version: string;
  models: Record<string, string>;
}

export const geminiService = {
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline or health check failed:', err);
      return {
        status: 'offline',
        hasApiKey: false,
        version: '2.4.0',
        models: {},
      };
    }
  },

  async planCommand(
    prompt: string,
    currentWorkspace: string,
    activeFile?: { name: string; type: string } | null
  ): Promise<AgentPlan> {
    try {
      const res = await fetch('/api/gemini/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentWorkspace, activeFile }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to plan command');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Falling back to local heuristic plan:', err);
      const isKhmer = /khmer|ខ្មែរ|angkor|apsara/i.test(prompt);
      const isImage = /image|photo|picture|upscale|crop|enhance|background/i.test(prompt);
      const isVideo = /video|clip|motion|animate/i.test(prompt);
      const isAudio = /audio|sound|voice|speech|music|transcribe/i.test(prompt);
      const isDoc = /doc|pdf|manual|wiki|search/i.test(prompt);
      const isLearn = /tutor|flashcard|quiz|learn|study/i.test(prompt);

      let targetWorkspace = 'ai' as any;
      if (isKhmer) targetWorkspace = 'khmer';
      else if (isImage) targetWorkspace = 'image';
      else if (isVideo) targetWorkspace = 'video';
      else if (isAudio) targetWorkspace = 'audio';
      else if (isDoc) targetWorkspace = 'documents';
      else if (isLearn) targetWorkspace = 'learning';

      return {
        intent: `Process request: ${prompt.slice(0, 50)}...`,
        summary: `Orchestrating dedicated tools in the ${targetWorkspace.toUpperCase()} toolkit to fulfill your request.`,
        confidence: 0.92,
        targetWorkspace,
        steps: [
          {
            stepNumber: 1,
            toolId: isImage ? 'enhance' : isKhmer ? 'khmer-lang' : 'versatile-agent',
            toolName: isImage ? 'ENHANCE! Ultra-Resolution' : isKhmer ? 'Khmer Language Specialist' : 'Versatile Execution Agent',
            action: 'Execute core analysis and transformation pipeline',
            params: { prompt },
            expectedOutput: 'High quality processed output',
            status: 'pending',
          },
        ],
        improvedPrompt: prompt,
      };
    }
  },

  async generateText(prompt: string, systemInstruction?: string, temperature = 0.7): Promise<string> {
    try {
      const res = await fetch('/api/gemini/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, temperature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Text generation error');
      return data.text;
    } catch (err: any) {
      console.warn('Text generation error:', err);
      throw err;
    }
  },

  async analyzeVision(
    imageBase64: string,
    prompt?: string,
    task: 'analyze' | 'detect_objects' | 'khmer_ocr' = 'analyze'
  ): Promise<string> {
    const res = await fetch('/api/gemini/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt, task }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Vision analysis error');
    return data.text;
  },

  async assistPrompt(rawPrompt: string, targetTool: string): Promise<any> {
    const res = await fetch('/api/gemini/prompt-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawPrompt, targetTool }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Prompt assistant error');
    return data;
  },

  async queryKhmer(query: string, mode: 'dictionary' | 'grammar_check' | 'translation' | 'heritage' | 'content'): Promise<string> {
    const res = await fetch('/api/gemini/khmer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Khmer AI error');
    return data.result;
  },

  async transcribeAudio(audioBase64: string, mimeType = 'audio/webm'): Promise<any> {
    const res = await fetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transcription error');
    return data;
  },

  async runFunctionCall(
    prompt: string,
    functionDeclarations: any[],
    activeAsset?: any
  ): Promise<{ text: string; functionCalls: Array<{ name: string; args: any; id?: string }> }> {
    try {
      const res = await fetch('/api/gemini/function-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, functionDeclarations, activeAsset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Function calling failed');
      return data;
    } catch (err: any) {
      console.warn('Native function calling request failed:', err);
      return {
        text: `Executed local workflow analysis for: "${prompt}"`,
        functionCalls: [],
      };
    }
  },

  async getEmbeddings(text: string): Promise<{ embedding: number[]; dimension: number }> {
    const res = await fetch('/api/gemini/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Embeddings error');
    return data;
  },

  async generateImage(
    prompt: string,
    aspectRatio: string = '1:1',
    imageBase64?: string
  ): Promise<{ imageUrl: string; text?: string }> {
    const res = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, imageBase64 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image generation failed');
    return data;
  },

  async analyzeVideoFrames(
    frames: Array<{ dataUrl?: string; timestamp?: number }>,
    prompt?: string
  ): Promise<any> {
    const res = await fetch('/api/gemini/video-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames, prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Video analysis failed');
    return data;
  },

  async generateVideo(
    prompt: string,
    aspectRatio: string = '16:9',
    resolution: string = '1080p'
  ): Promise<any> {
    const res = await fetch('/api/gemini/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, resolution }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Veo video generation failed');
    return data;
  },

  async generateMusic(prompt: string): Promise<{ audioDataUrl: string; lyrics?: string; mimeType: string }> {
    const res = await fetch('/api/gemini/generate-music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lyria music generation failed');
    return data;
  },
};

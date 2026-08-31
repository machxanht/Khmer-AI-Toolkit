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
    const res = await fetch('/api/gemini/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, currentWorkspace, activeFile }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to plan command with Gemini AI');
    }
    return await res.json();
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
    const res = await fetch('/api/gemini/function-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, functionDeclarations, activeAsset }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Function calling failed');
    return data;
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

  async enhanceImage(
    imageBase64: string,
    factor: string = '2x',
    mimeType: string = 'image/png'
  ): Promise<{ imageUrl: string; text?: string; factor?: string }> {
    const res = await fetch('/api/gemini/enhance-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, factor, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Neural super-resolution failed');
    return data;
  },

  async removeBackground(
    imageBase64: string,
    mimeType: string = 'image/png'
  ): Promise<{ imageUrl: string; text?: string }> {
    const res = await fetch('/api/gemini/remove-background', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Background removal failed');
    return data;
  },

  async extractVideoKeyframes(
    videoSource: string | File,
    frameCount: number = 6
  ): Promise<Array<{ dataUrl: string; timestamp: number }>> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      let objectUrl = '';
      if (typeof videoSource === 'string') {
        video.src = videoSource;
      } else {
        objectUrl = URL.createObjectURL(videoSource);
        video.src = objectUrl;
      }

      const cleanUp = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration || 5;
          const frames: Array<{ dataUrl: string; timestamp: number }> = [];
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const width = video.videoWidth || 640;
          const height = video.videoHeight || 360;
          canvas.width = width;
          canvas.height = height;

          const timestamps: number[] = [];
          for (let i = 0; i < frameCount; i++) {
            const t = Math.max(0.1, (duration / (frameCount + 1)) * (i + 1));
            timestamps.push(t);
          }

          for (const t of timestamps) {
            await new Promise<void>((resSeek) => {
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                if (ctx) {
                  ctx.drawImage(video, 0, 0, width, height);
                  frames.push({
                    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
                    timestamp: Number(t.toFixed(2)),
                  });
                }
                resSeek();
              };
              video.addEventListener('seeked', onSeeked);
              video.currentTime = t;
              setTimeout(() => {
                video.removeEventListener('seeked', onSeeked);
                resSeek();
              }, 3000);
            });
          }

          cleanUp();
          if (frames.length === 0) {
            throw new Error('Failed to extract keyframes from video.');
          }
          resolve(frames);
        } catch (err) {
          cleanUp();
          reject(err);
        }
      };

      video.onerror = () => {
        cleanUp();
        reject(new Error('Failed to load video file for keyframe extraction.'));
      };
    });
  },

  async generateVideoWithPolling(
    prompt: string,
    aspectRatio: string = '16:9',
    resolution: string = '1080p',
    onProgress?: (statusMsg: string) => void
  ): Promise<{ videoUrl: string; mimeType: string }> {
    onProgress?.('Initiating Veo video generation job...');
    const initRes = await fetch('/api/gemini/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, resolution }),
    });
    const initData = await initRes.json();
    if (!initRes.ok) {
      throw new Error(initData.error || 'Failed to start Veo video generation');
    }

    const { operationName } = initData;
    if (!operationName) {
      throw new Error('No operation name returned from Veo API');
    }

    const maxAttempts = 60;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      onProgress?.(`Synthesizing motion frames with Veo (attempt ${attempt}/${maxAttempts})...`);
      await new Promise((r) => setTimeout(r, 4000));

      const statusRes = await fetch('/api/gemini/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        throw new Error(statusData.error || 'Failed to poll video status');
      }

      if (statusData.error) {
        throw new Error(`Veo generation error: ${statusData.error.message || JSON.stringify(statusData.error)}`);
      }

      if (statusData.done) {
        onProgress?.('Rendering complete! Downloading authentic video stream...');
        const downloadRes = await fetch('/api/gemini/video-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const downloadData = await downloadRes.json();
        if (!downloadRes.ok) {
          throw new Error(downloadData.error || 'Failed to download completed video');
        }

        return {
          videoUrl: downloadData.videoDataUrl,
          mimeType: downloadData.mimeType || 'video/mp4',
        };
      }
    }

    throw new Error('Veo video generation timed out. The operation may still be processing in the background.');
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

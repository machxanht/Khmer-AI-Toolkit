import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Initialize Gemini SDK with User-Agent header as required
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check & Capabilities
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    version: "2.4.0",
    models: {
      text: "gemini-3.6-flash",
      fastText: "gemini-3.1-flash-lite",
      image: "gemini-3.1-flash-lite-image",
      transcribe: "gemini-3.5-transcribe",
      tts: "gemini-3.1-flash-tts-preview",
      embeddings: "gemini-embedding-2",
    },
  });
});

// 2. Universal AI Intent & Workflow Command Planner
app.post("/api/gemini/command", async (req: Request, res: Response) => {
  try {
    const { prompt, currentWorkspace, activeFile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please add your API key in Settings.",
      });
    }

    const systemPrompt = `You are the central Brain of the Khmer AI Toolkit personal workstation.
Analyze the user's natural language command and formulate a concrete, structured multi-step execution plan across our toolkits.
Available tool categories & tools:
- Image: nano-banana (generation/editing), pixshop (bg removal/filters), enhance (upscaling/sharpen), agentic-vision (object detection/analysis), ai-pointer-create, product-mockup, vibecheck.
- Video: veo-studio (text to video), type-motion (typography motion), bananimate (animation), video-analyzer.
- Audio: echoscript (speaker transcription), live-transcription, voice-library (TTS), world-radio (audio translate), lyria-studio (music synth).
- Documents: chat-docs (document Q&A), ask-manual (manuals/PDFs), multimodal-search, infinite-wiki (knowledge graphs).
- Learning: intute (AI tutor), flashcards (spaced repetition cards), visual-dict (interactive visual dictionary), video-learning.
- Khmer: khmer-lang (grammar & spell check), khmer-dict (Choun Nath definitions), khmer-learn (alphabet tutor), khmer-ocr (script extractor), khmer-translate, khmer-heritage (Angkor & arts), khmer-content.
- Automation: visual workflow builder.

Return ONLY a JSON object with this structure:
{
  "intent": "Short summary of user goal",
  "summary": "1-2 sentence breakdown of the execution strategy",
  "confidence": 0.95,
  "targetWorkspace": "home|ai|image|video|audio|documents|learning|khmer|automation|library",
  "steps": [
    {
      "stepNumber": 1,
      "toolId": "tool-id-here",
      "toolName": "Display Name",
      "action": "Description of action",
      "params": { "key": "value" },
      "expectedOutput": "Output format description"
    }
  ],
  "improvedPrompt": "Refined and structured prompt preserving critical constraints (e.g. silhouette, geometry, no redesign if specified)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Context: Active workspace is ${currentWorkspace}. User has active file: ${activeFile ? activeFile.name : "None"}.\nUser Command: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/gemini/command:", err);
    res.status(500).json({ error: err.message || "Failed to process command" });
  }
});

// 3. Text Generation (Chat, Tutor, Knowledge, Khmer, Summaries)
app.post("/api/gemini/generate-text", async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction, temperature = 0.7 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please add your API key in Settings.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an intelligent, helpful AI workstation assistant.",
        temperature,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in /api/gemini/generate-text:", err);
    res.status(500).json({ error: err.message || "Text generation failed" });
  }
});

// 4. Multimodal Vision & Agentic Vision
app.post("/api/gemini/vision", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/png", prompt, task = "analyze" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let systemInstruction = "You are an expert Computer Vision and Multimodal Agent.";
    if (task === "detect_objects") {
      systemInstruction = "Analyze this image and list detected objects with their labels, approximate coordinate percentages (xMin, yMin, xMax, yMax from 0 to 100), and visual descriptions in structured JSON.";
    } else if (task === "khmer_ocr") {
      systemInstruction = "You are an expert in Khmer script and epigraphy. Extract all Khmer and Latin text accurately, provide word-by-word transliteration and English/Vietnamese translation where relevant.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
        prompt || "Analyze this image in detail and describe its elements.",
      ],
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in /api/gemini/vision:", err);
    res.status(500).json({ error: err.message || "Vision analysis failed" });
  }
});

// 5. Prompt Assistant (Preserving strict constraints)
app.post("/api/gemini/prompt-assistant", async (req: Request, res: Response) => {
  try {
    const { rawPrompt, targetTool, preserveConstraints = true } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please add your API key in Settings.",
      });
    }

    const systemInstruction = `You are the Prompt Engineering Engine for the Khmer AI Toolkit.
Analyze the user's raw prompt for target tool: ${targetTool}.
CRITICAL CONSTRAINT RULE:
Do NOT rewrite the instruction in a way that changes the user's core intent.
If the task is an image preservation or modification task, explicitly preserve constraints:
- Do not redesign unless asked
- Do not alter underlying geometry
- Preserve exact silhouette and existing lines
- Keep typography crisp

Return JSON:
{
  "interpretation": "What the user specifically wants",
  "improvedPrompt": "The optimized, high-fidelity prompt for the tool",
  "negativePrompt": "Terms to avoid in generation",
  "keyConstraints": ["list", "of", "preserved", "rules"],
  "suggestedSettings": { "aspectRatio": "1:1", "quality": "high" }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Raw User Request: "${rawPrompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/gemini/prompt-assistant:", err);
    res.status(500).json({ error: err.message || "Prompt enhancement failed" });
  }
});

// 6. Khmer Linguistic & Cultural Intelligence
app.post("/api/gemini/khmer", async (req: Request, res: Response) => {
  try {
    const { query, mode, sourceLang = "auto", targetLang = "km" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for live Khmer intelligence.",
      });
    }

    let systemInstruction = "";
    if (mode === "dictionary") {
      systemInstruction = `You are the Master Khmer Lexicographer grounded in the Chuon Nath Khmer Dictionary and contemporary Cambodian linguistics.
For the query, provide:
1. Khmer word spelling (អក្ខរាវិរុទ្ធ) & Phonetics (IPA / Latin transliteration)
2. Part of speech (នាម, កិរិយា, គុណនាម, etc.)
3. Chuon Nath classic definition & modern usage
4. Etymology (Pali/Sanskrit origin if applicable)
5. English and Vietnamese translations
6. 2 authentic example sentences in Khmer with English/Vietnamese translations.
Output in clear structured Markdown.`;
    } else if (mode === "grammar_check") {
      systemInstruction = `You are a Khmer Language Grammar and Orthography Specialist.
Analyze the provided Khmer text for:
1. Orthographic correctness (subscripts / ជើង, independent vowels, diacritics / វណ្ណយុត្តិ)
2. Word spacing and segmentation rules
3. Grammar and stylistic suggestions
4. Corrected final version in pristine Khmer script with clear explanations of changes made.`;
    } else if (mode === "translation") {
      systemInstruction = `You are a certified multilingual translator specializing in Khmer (ភាសាខ្មែរ), English, and Vietnamese.
Translate the text faithfully while preserving cultural idioms, polite registers (formal vs casual vs royal), and tone.
Provide the direct translation, a phonetic guide, and context notes.`;
    } else if (mode === "heritage") {
      systemInstruction = `You are a Scholar of Khmer Civilization, Archaeology, Classical Arts (Apsara, Shadow Theatre/Sbek Thom, Pinpeat), and Angkorian Architecture.
Provide rich historical insight, dates, cultural significance, and architectural breakdown with authentic Khmer terminology.`;
    } else {
      systemInstruction = `You are an AI assistant specialized in Khmer culture, language, and content creation. Assist with authentic Khmer text, captions, and creative media.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: query,
      config: { systemInstruction },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error("Error in /api/gemini/khmer:", err);
    res.status(500).json({ error: err.message || "Khmer AI operation failed" });
  }
});

// 7. Audio Transcription & Diarization (EchoScript)
app.post("/api/gemini/transcribe", async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = "audio/mp3", contextHint } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    if (!audioBase64 || typeof audioBase64 !== "string" || audioBase64.trim() === "") {
      return res.status(400).json({
        error: "No audio file or stream provided. EchoScript requires an authentic audio recording.",
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");

    const audioPart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || "audio/mp3",
      },
    };

    const promptText = `Perform authoritative multi-speaker transcription and diarization on this audio recording.
Identify distinct speaker turns (Speaker 1, Speaker 2, etc.) with exact timestamps [MM:SS - MM:SS].
Capture spoken Khmer and English dialogue accurately.
Return in structured JSON format with this exact schema:
{
  "detectedLanguage": "e.g. Khmer / English (Bilingual)",
  "confidence": 0.98,
  "speakerCount": 2,
  "speakers": [
    {
      "speaker": "Speaker 1 (Title / Role)",
      "timestamp": "00:00 - 00:04",
      "text": "Exact transcribed speech",
      "english": "English translation if spoken in Khmer",
      "sentiment": "Tone/attitude"
    }
  ],
  "fullTranscript": "Complete chronological transcript",
  "summary": "Key highlights and summary of dialogue"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: [
        audioPart,
        promptText,
      ],
    });

    const rawText = response.text || "";
    let parsed: any = {};
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { fullTranscript: rawText };
    } catch {
      parsed = { fullTranscript: rawText };
    }

    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/gemini/transcribe:", err);
    res.status(500).json({ error: err.message || "Transcription failed" });
  }
});

// 8. Native Function Calling Bridge
app.post("/api/gemini/function-call", async (req: Request, res: Response) => {
  try {
    const { prompt, functionDeclarations, activeAsset, systemInstruction } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for function calling.",
      });
    }

    const contents: any[] = [];
    
    // Add context regarding active asset if available
    let contextText = `User Request: "${prompt}"\n`;
    if (activeAsset) {
      contextText += `Active Asset Context: ID="${activeAsset.id}", Name="${activeAsset.name}", Type="${activeAsset.type}", MIME="${activeAsset.mimeType}".\n`;
      if (activeAsset.type === 'document' && activeAsset.dataUrl?.startsWith('data:text')) {
        const textSample = decodeURIComponent(activeAsset.dataUrl.replace('data:text/plain;charset=utf-8,', '')).slice(0, 1000);
        contextText += `Active Document Content Preview: "${textSample}"\n`;
      }
    }

    contents.push({ text: contextText });

    const toolsConfig = functionDeclarations && functionDeclarations.length > 0 
      ? [{ functionDeclarations }] 
      : undefined;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || `You are the master orchestrator for the Khmer AI Toolkit.
When the user gives a command, call appropriate functions sequentially or in parallel from the available tool registry declarations.
If an image transformation or analysis is needed, call the corresponding image or vision functions.
If a document or Khmer language query is requested, call the appropriate tools.
If no tool call is needed, provide a clear, helpful response.`,
        tools: toolsConfig,
      },
    });

    const functionCalls = response.functionCalls || [];
    res.json({
      text: response.text || "",
      functionCalls: functionCalls.map((fc: any) => ({
        name: fc.name,
        args: fc.args,
        id: fc.id,
      })),
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/function-call:", err);
    res.status(500).json({ error: err.message || "Function call orchestration failed" });
  }
});

// 9. Embeddings Generator
app.post("/api/gemini/embeddings", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for embeddings.",
      });
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: text || "Sample document text",
    });

    const values =
      (response as any).embedding?.values ||
      (response as any).embeddings?.[0]?.values ||
      [];

    res.json({
      embedding: values,
      dimension: values.length,
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/embeddings:", err);
    res.status(500).json({ error: err.message || "Embeddings generation failed" });
  }
});

// 10. Real Image Generation & Editing (Nano Banana)
app.post("/api/gemini/generate-image", async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = "1:1", imageBase64, mimeType = "image/png" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Image Generation. Please configure your API key.",
      });
    }

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png",
        },
      });
    }
    parts.push({ text: prompt || "Generate a high fidelity creative image" });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let textOutput = "";

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput += part.text + " ";
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: "Model did not return image data. Output: " + (textOutput || "No output"),
        text: textOutput,
      });
    }

    res.json({ imageUrl, text: textOutput.trim() });
  } catch (err: any) {
    console.error("Error in /api/gemini/generate-image:", err);
    res.status(500).json({ error: err.message || "Image generation failed" });
  }
});

// 10b. Real Neural Super-Resolution (ENHANCE!)
app.post("/api/gemini/enhance-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, factor = "2x", mimeType = "image/png" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Neural Super-Resolution.",
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "No input image provided for neural super-resolution." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const parts: any[] = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png",
        },
      },
      {
        text: `Neural Super-Resolution & Ultra-HD Detail Upscaling: Perform genuine neural super-resolution enhancement at ${factor} scaling factor. Sharpen fine edges, recover sub-pixel textures, remove compression noise and blur, enhance depth and contrast, and preserve exact subject geometry and colors with razor-sharp photorealistic clarity.`,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts },
    });

    let imageUrl: string | null = null;
    let textOutput = "";

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput += part.text + " ";
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: "Super-resolution model did not return image data. Output: " + (textOutput || "No output"),
      });
    }

    res.json({ imageUrl, text: textOutput.trim(), factor });
  } catch (err: any) {
    console.error("Error in /api/gemini/enhance-image:", err);
    res.status(500).json({ error: err.message || "Neural super-resolution failed" });
  }
});

// 10c. Real AI Background Segmentation & Matting
app.post("/api/gemini/remove-background", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Background Segmentation.",
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "No input image provided for background segmentation." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const parts: any[] = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png",
        },
      },
      {
        text: "Precise AI Foreground Segmentation & Cutout Matting: Segment the primary foreground subject(s) with pristine edge boundaries. Completely eliminate and erase 100% of background scenery, sky, shadows, and environment, rendering a pure alpha transparent background (PNG). Preserve fine hair, fur, textiles, and semi-transparent edges accurately.",
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts },
    });

    let imageUrl: string | null = null;
    let textOutput = "";

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput += part.text + " ";
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: "Background segmentation model did not return image data. Output: " + (textOutput || "No output"),
      });
    }

    res.json({ imageUrl, text: textOutput.trim() });
  } catch (err: any) {
    console.error("Error in /api/gemini/remove-background:", err);
    res.status(500).json({ error: err.message || "Background removal failed" });
  }
});

// 11. Multimodal Video Keyframe Timeline Analyzer
app.post("/api/gemini/video-analyze", async (req: Request, res: Response) => {
  try {
    const { frames, prompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Video Analysis.",
      });
    }

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: "No video keyframes provided. Please upload an authentic video file to analyze." });
    }

    const contentsParts: any[] = [];
    const selectedFrames = frames.slice(0, 10);

    selectedFrames.forEach((frame: any, idx: number) => {
      const cleanBase64 = (typeof frame === 'string' ? frame : frame.dataUrl || frame.data).replace(/^data:image\/\w+;base64,/, "");
      contentsParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      });
      const timeLabel = frame.timestamp !== undefined ? `${Number(frame.timestamp).toFixed(1)}s` : `Frame ${idx + 1}`;
      contentsParts.push({
        text: `[Video Keyframe ${idx + 1} at timestamp ${timeLabel}]`,
      });
    });

    const userPrompt = prompt || "Analyze these sequential keyframes extracted from the video file and provide an authoritative scene timeline.";

    contentsParts.push({
      text: `${userPrompt}
Output in structured JSON:
{
  "summary": "Executive summary of the video content, motion arc, and key subject matter",
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "00:00 - 00:04",
      "title": "Scene title",
      "description": "Visual scene narration and subject action",
      "detectedObjects": ["object1", "object2"],
      "detectedText": "Any on-screen text or OCR inscriptions",
      "confidence": 0.98
    }
  ],
  "keyEvents": ["Major visual event 1", "Major visual event 2"],
  "visualAesthetics": "Color palette, lighting, cinematography style, and camera trajectory"
}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contentsParts,
      config: {
        systemInstruction: "You are an expert multimodal Video Timeline and Scene Analyzer. Inspect the chronological video keyframes and return a structured, detailed scene-by-scene analysis.",
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/gemini/video-analyze:", err);
    res.status(500).json({ error: err.message || "Video analysis failed" });
  }
});

// 12a. Veo Video Generation Initiation
app.post("/api/gemini/generate-video", async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = "16:9", resolution = "1080p" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Veo video generation.",
      });
    }

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: prompt || "Cinematic aerial sweep across temple at dawn",
      config: {
        numberOfVideos: 1,
        resolution: resolution === "720p" ? "720p" : "1080p",
        aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
      },
    });

    res.json({
      operationName: (operation as any).name,
      status: "processing",
      message: "Veo video generation operation initiated.",
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/generate-video:", err);
    res.status(500).json({ error: err.message || "Veo generation failed" });
  }
});

// 12b. Veo Video Status Polling
app.post("/api/gemini/video-status", async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is required." });
    }

    if (!operationName) {
      return res.status(400).json({ error: "operationName is required for status polling." });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
      metadata: updated.metadata || null,
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/video-status:", err);
    res.status(500).json({ error: err.message || "Failed to poll video operation status" });
  }
});

// 12c. Veo Video Stream/Download & Base64 Converter
app.post("/api/gemini/video-download", async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = getGeminiClient();

    if (!ai || !apiKey) {
      return res.status(400).json({ error: "GEMINI_API_KEY is required." });
    }

    if (!operationName) {
      return res.status(400).json({ error: "operationName is required for video download." });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return res.status(409).json({ error: "Video operation is still processing. Please continue polling." });
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: "Video download URI not available from completed operation." });
    }

    // Fetch video bytes using Google GenAI authorized headers
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video stream from Google API: ${videoRes.statusText}`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const videoDataUrl = `data:video/mp4;base64,${base64}`;

    res.json({
      videoDataUrl,
      mimeType: "video/mp4",
      sizeBytes: buffer.length,
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/video-download:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve completed video" });
  }
});

// 13. Lyria 3 Music Generation API
app.post("/api/gemini/generate-music", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is required for Lyria music generation.",
      });
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required for Lyria music synthesis." });
    }

    const response = await ai.models.generateContentStream({
      model: "lyria-3-clip-preview",
      contents: prompt,
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(422).json({ error: "Lyria model did not return audio data for this prompt." });
    }

    res.json({
      audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
      lyrics: lyrics.trim() || undefined,
      mimeType,
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/generate-music:", err);
    res.status(500).json({ error: err.message || "Lyria music generation failed" });
  }
});

// Vite middleware / Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khmer AI Toolkit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

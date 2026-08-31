# Next Implementation Tasks (Non-PASS Tools)

This file tracks only tools that are currently NOT in PASS status.

---

### 1. Nano Banana / Image Generation
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` for model `gemini-3.1-flash-lite-image` on the active API key/project quota.
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/components/workspaces/ImageWorkspace.tsx`
- **Exact Implementation Task:**
  - Verify and configure Gemini project quota / billing for image generation models (`gemini-3.1-flash-lite-image` / `imagen-3.0-generate-002`).
  - Add client-side graceful quota error messaging and automatic retry backoff in `geminiService.generateImage`.
- **How to Manually Test from UI:**
  1. Open the **Image & Vision** workspace.
  2. Click **Nano Banana Creative Studio** tab.
  3. Enter a prompt (e.g. `"Angkor Wat at sunrise in watercolor style"`), select aspect ratio `"1:1"`.
  4. Click **"Generate with Nano Banana"**.
- **Expected Real Output:**
  - High-quality synthesized PNG/JPEG image rendered on the canvas and saved to the Shared Asset Library with tag `nano-banana`.

---

### 2. ENHANCE! 8x (Super-Resolution Scaler)
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` when calling `gemini-3.1-flash-lite-image` for neural image enhancement.
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/services/toolRegistry.ts`, `src/components/workspaces/ImageWorkspace.tsx`
- **Exact Implementation Task:**
  - Verify image model quota / credentials on backend `/api/gemini/enhance-image`.
  - Maintain the existing registered tool `enhanceImageSuperResolution` in `toolRegistry.ts` which extracts the image base64, passes scaling factor (2x, 4x, 8x), and updates the active canvas.
- **How to Manually Test from UI:**
  1. Upload or select an image asset in the **Shared Library**.
  2. Switch to **Image & Vision** workspace and select **ENHANCE! AI Scaler**.
  3. Choose scale factor **4x** or **8x**.
  4. Click **"Enhance Image"**.
- **Expected Real Output:**
  - Neural super-resolution upscaled image with enhanced fidelity, higher pixel dimensions, and automatic saving to the Shared Asset Library.

---

### 3. AI Background Removal (Cutout Segmentation)
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` when calling `gemini-3.1-flash-lite-image` for foreground segmentation.
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/services/toolRegistry.ts`, `src/components/workspaces/ImageWorkspace.tsx`
- **Exact Implementation Task:**
  - Verify image model quota on backend `/api/gemini/remove-background`.
  - Ensure the PNG alpha channel is cleanly encoded and returned to `removeBackgroundSegmentation` in `toolRegistry.ts`.
- **How to Manually Test from UI:**
  1. Select an image with a clear foreground object in **Shared Library**.
  2. In **Image & Vision** workspace, navigate to **AI Background Removal**.
  3. Click **"Remove Background with AI"**.
- **Expected Real Output:**
  - Transparent PNG cutout asset with the subject isolated and background removed, displayed on the checkerboard preview and saved to Library.

---

### 4. Product Mockup Studio
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` when calling `gemini-3.1-flash-lite-image` for composite scene generation.
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/components/workspaces/ImageWorkspace.tsx`
- **Exact Implementation Task:**
  - Verify image model quota on backend `/api/gemini/generate-image`.
  - Connect composition prompt builder with backdrop styles (Luxury Marble, Minimalist Wood, Cyber Studio, Outdoor Nature).
- **How to Manually Test from UI:**
  1. Open **Image & Vision** workspace.
  2. Select **Product Mockup Studio**.
  3. Select a backdrop style and enter product description.
  4. Click **"Generate Product Mockup"**.
- **Expected Real Output:**
  - Photorealistic product studio mockup image rendered in workspace and saved to Shared Asset Library.

---

### 5. Veo Video Studio
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` for `veo-3.1-lite-generate-preview` (Video generation requires active Veo model access/quota).
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/components/workspaces/VideoWorkspace.tsx`
- **Exact Implementation Task:**
  - Ensure project has Veo 3.1 access enabled in Google AI Studio / GCP project.
  - Backend polling endpoints `/api/gemini/generate-video`, `/api/gemini/video-status`, and `/api/gemini/video-download` are fully implemented and ready.
- **How to Manually Test from UI:**
  1. Open **Video & Motion Lab** workspace.
  2. Select **Veo Video Studio**.
  3. Enter cinematic prompt (e.g. `"Aerial drone shot through misty Angkor Wat at sunrise"`), set motion intensity and camera motion.
  4. Click **"Generate Video with Veo 3.1"**.
- **Expected Real Output:**
  - Progress updates during polling lifecycle, followed by authentic MP4 video playback in the video player and asset saved to Library.

---

### 6. Lyria Music Studio
- **Current Status:** BLOCKED
- **Exact Reason:** Upstream Google Gemini API returns HTTP 429 `RESOURCE_EXHAUSTED` for `lyria-3-clip-preview` (Lyria music generation requires active model access/quota).
- **Exact File(s):** `server.ts`, `src/services/geminiService.ts`, `src/components/workspaces/AudioWorkspace.tsx`
- **Exact Implementation Task:**
  - Ensure project has Lyria music generation model access enabled.
  - Backend endpoint `/api/gemini/generate-music` is fully wired to invoke the Google GenAI SDK and return synthesized audio buffer.
- **How to Manually Test from UI:**
  1. Open **Audio & Voice Lab** workspace.
  2. Select **Lyria Music Creation Studio**.
  3. Enter a music prompt (e.g. `"Traditional Cambodian Roneat Ek blended with modern ambient lo-fi beat"`).
  4. Click **"Compose with Lyria"**.
- **Expected Real Output:**
  - Audio waveform and playable audio element with synthesized audio track saved to Shared Asset Library.

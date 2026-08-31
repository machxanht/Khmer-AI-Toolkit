# Tool Audit

| Tool | Type | Test | Result | Error |
| :--- | :--- | :--- | :--- | :--- |
| Universal AI Command | API | Real natural language DAG intent generation (`POST /api/gemini/command`) | PASS | None |
| AI Agent / Orchestrator | API | Multi-tool function calling DAG orchestration (`POST /api/gemini/function-call`) | PASS | None |
| Prompt Assistant | API | Prompt expansion with strict constraint preservation (`POST /api/gemini/prompt-assistant`) | PASS | None |
| Function Calling | API | Native SDK function declarations bridge (`POST /api/gemini/function-call`) | PASS | None |
| Agentic Vision | API | Multimodal spatial coordinate bounding (`POST /api/gemini/vision`) | PASS | None |
| Nano Banana / Image Generation | API | Text-to-Image synthesis with `gemini-3.1-flash-lite-image` (`POST /api/gemini/generate-image`) | BLOCKED | 429 Quota/Rate Limit on `gemini-3.1-flash-lite-image` |
| ENHANCE! 8x | API | Neural super-resolution (`POST /api/gemini/enhance-image`) | BLOCKED | 429 Quota/Rate Limit on `gemini-3.1-flash-lite-image` |
| Pixshop | CODE | Deterministic HTML5 Canvas 2D color filter pipeline | PASS | None |
| Background Removal | API | AI foreground segmentation matting (`POST /api/gemini/remove-background`) | BLOCKED | 429 Quota/Rate Limit on `gemini-3.1-flash-lite-image` |
| AI Pointer | CODE | Canvas normalized coordinate calculation (0-100%) | PASS | None |
| Product Mockup | API | AI studio backdrop generation (`POST /api/gemini/generate-image`) | BLOCKED | 429 Quota/Rate Limit on `gemini-3.1-flash-lite-image` |
| VibeCheck | API | Multimodal aesthetic balance & color critique (`POST /api/gemini/vision`) | PASS | None |
| Veo Studio | API | Video generation with `veo-3.1-lite-generate-preview` (`POST /api/gemini/generate-video`) | BLOCKED | 429 Quota/Rate Limit on `veo-3.1-lite-generate-preview` |
| Video Timeline Analyzer | API | Multi-keyframe scene timeline extraction (`POST /api/gemini/video-analyze`) | PASS | None |
| Type Motion | CODE | Deterministic CSS keyframe motion generator | PASS | None |
| EchoScript | API | Audio transcription with `gemini-3.5-transcribe` (`POST /api/gemini/transcribe`) | PASS | None |
| Voice Library / TTS | CODE | Web Speech API phonetic speech synthesis | PASS | None |
| Lyria Music Studio | API | Music synthesis stream with `lyria-3-clip-preview` (`POST /api/gemini/generate-music`) | BLOCKED | 429 Quota/Rate Limit on `lyria-3-clip-preview` |
| Chat with Docs | API | Context-grounded document QA with citations (`POST /api/gemini/generate-text`) | PASS | None |
| Ask the Manual | API | Technical manual extraction (`POST /api/gemini/generate-text`) | PASS | None |
| Document Embeddings | API | Vector embedding with `gemini-embedding-2` (`POST /api/gemini/embeddings`) | PASS | None |
| Infinite Wiki | API | Markdown encyclopedia generation (`POST /api/gemini/generate-text`) | PASS | None |
| InTute Tutor | API | Socratic language tutor prompt (`POST /api/gemini/generate-text`) | PASS | None |
| Flashcards | CODE | SM-2 spaced repetition calculation engine | PASS | None |
| Khmer Phonology | CODE | 33-consonant phonetic matrix lookup | PASS | None |
| Chuon Nath Dictionary | API | Lexicographical query with `gemini-3.6-flash` (`POST /api/gemini/khmer`) | PASS | None |
| Khmer OCR / Epigraphy | API | Multimodal inscription OCR (`POST /api/gemini/vision`) | PASS | None |
| Khmer Creative / Heritage | API | Archaeological & cultural knowledge (`POST /api/gemini/khmer`) | PASS | None |
| Shared Library | CODE | In-memory & LocalStorage asset manager | PASS | None |
| Library Search / Load | CODE | Tag, MIME type, and text metadata filtering | PASS | None |
| Workflow Builder | CODE | Directed Acyclic Graph (DAG) state propagation | PASS | None |
| Batch Processing | CODE | Multi-asset sequential queue executor | PASS | None |
| History / Audit | CODE | Timeline and audit trail logger | PASS | None |

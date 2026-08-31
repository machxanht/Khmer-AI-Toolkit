import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

function postJSON(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ status: 504, error: 'Request timeout' });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.write(data);
    req.end();
  });
}

const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testSingle(name, path, body, validator) {
  process.stdout.write(`Testing [${name}] ... `);
  const start = Date.now();
  const res = await postJSON(path, body);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const ok = res.status >= 200 && res.status < 300 && validator(res.body);
  if (ok) {
    console.log(`[PASS] (HTTP ${res.status}, ${elapsed}s)`);
    return { name, status: 'PASS', httpStatus: res.status, error: null };
  } else {
    const errMsg = res.body?.error || res.error || JSON.stringify(res.body);
    console.log(`[FAIL/BLOCKED] (HTTP ${res.status}, ${elapsed}s) Error: ${errMsg}`);
    return { name, status: res.status === 400 || res.status === 403 || res.status === 404 || res.status === 422 || res.status === 500 ? 'FAIL' : 'BLOCKED', httpStatus: res.status, error: errMsg };
  }
}

async function main() {
  console.log('=== REAL API ENDPOINT VERIFICATION ===\n');

  const results = [];

  results.push(await testSingle(
    'Universal AI Command',
    '/api/gemini/command',
    { prompt: 'Translate Khmer and upscale image', currentWorkspace: 'home' },
    (b) => Boolean(b.intent || b.summary)
  ));

  results.push(await testSingle(
    'Text Generation',
    '/api/gemini/generate-text',
    { prompt: 'Say hello in Khmer and English in 5 words.' },
    (b) => Boolean(b.text && b.text.length > 0)
  ));

  results.push(await testSingle(
    'Prompt Assistant',
    '/api/gemini/prompt-assistant',
    { rawPrompt: 'Angkor Wat temple sunset', targetTool: 'nano-banana' },
    (b) => Boolean(b.improvedPrompt)
  ));

  results.push(await testSingle(
    'Khmer Linguistics (Chuon Nath)',
    '/api/gemini/khmer',
    { query: 'សន្តិភាព', mode: 'dictionary' },
    (b) => Boolean(b.result)
  ));

  results.push(await testSingle(
    'Vision & Khmer OCR',
    '/api/gemini/vision',
    { imageBase64: samplePngBase64, mimeType: 'image/png', task: 'khmer_ocr' },
    (b) => Boolean(b.text)
  ));

  results.push(await testSingle(
    'Function Calling',
    '/api/gemini/function-call',
    {
      prompt: 'Enhance this image by 2x',
      functionDeclarations: [
        {
          name: 'image_enhance',
          description: 'Enhance image',
          parameters: { type: 'OBJECT', properties: { factor: { type: 'STRING' } } },
        },
      ],
    },
    (b) => Array.isArray(b.functionCalls)
  ));

  results.push(await testSingle(
    'Document Embeddings',
    '/api/gemini/embeddings',
    { text: 'Angkor Wat historical documentation' },
    (b) => Array.isArray(b.embedding) && b.dimension > 0
  ));

  results.push(await testSingle(
    'Nano Banana (Image Generation)',
    '/api/gemini/generate-image',
    { prompt: 'A simple minimalist geometric Khmer lotus icon on dark background, vector art' },
    (b) => Boolean(b.imageUrl && b.imageUrl.startsWith('data:image'))
  ));

  results.push(await testSingle(
    'ENHANCE! (Neural Super-Resolution)',
    '/api/gemini/enhance-image',
    { imageBase64: samplePngBase64, factor: '2x' },
    (b) => Boolean(b.imageUrl && b.imageUrl.startsWith('data:image'))
  ));

  results.push(await testSingle(
    'AI Background Segmentation',
    '/api/gemini/remove-background',
    { imageBase64: samplePngBase64 },
    (b) => Boolean(b.imageUrl && b.imageUrl.startsWith('data:image'))
  ));

  results.push(await testSingle(
    'Video Timeline Analyzer',
    '/api/gemini/video-analyze',
    {
      frames: [
        { timestamp: 0, dataUrl: `data:image/png;base64,${samplePngBase64}` },
      ],
      prompt: 'Summarize keyframes',
    },
    (b) => Boolean(b.summary || b.scenes)
  ));

  results.push(await testSingle(
    'Veo Video Generation',
    '/api/gemini/generate-video',
    { prompt: 'A calm river in Cambodia at sunrise' },
    (b) => Boolean(b.operationName)
  ));

  results.push(await testSingle(
    'Lyria Music Generation',
    '/api/gemini/generate-music',
    { prompt: 'Cambodian traditional flute meditation melody' },
    (b) => Boolean(b.audioDataUrl)
  ));

  results.push(await testSingle(
    'EchoScript Transcription',
    '/api/gemini/transcribe',
    {
      audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      mimeType: 'audio/wav',
    },
    (b) => Boolean(b.speakers || b.fullTranscript)
  ));

  console.log('\n=== SUMMARY ===');
  console.table(results);
}

main();

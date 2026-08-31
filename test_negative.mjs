import http from 'http';

async function postJSON(path, body) {
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
    req.write(data);
    req.end();
  });
}

async function runNegativeTests() {
  console.log('=== RUNNING NEGATIVE TEST CASES ===');

  // Case 1: Empty audio to transcribe
  const neg1 = await postJSON('/api/gemini/transcribe', { audioBase64: '' });
  console.log('Neg 1 (Empty audio): HTTP', neg1.status, neg1.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  // Case 2: Missing image in enhance
  const neg2 = await postJSON('/api/gemini/enhance-image', {});
  console.log('Neg 2 (Missing image in enhance): HTTP', neg2.status, neg2.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  // Case 3: Missing image in bg removal
  const neg3 = await postJSON('/api/gemini/remove-background', {});
  console.log('Neg 3 (Missing image in remove-background): HTTP', neg3.status, neg3.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  // Case 4: Missing frames in video analyze
  const neg4 = await postJSON('/api/gemini/video-analyze', { frames: [] });
  console.log('Neg 4 (Empty frames in video-analyze): HTTP', neg4.status, neg4.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  // Case 5: Missing operationName in video status
  const neg5 = await postJSON('/api/gemini/video-status', {});
  console.log('Neg 5 (Missing opName in video-status): HTTP', neg5.status, neg5.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  // Case 6: Empty prompt in Lyria music
  const neg6 = await postJSON('/api/gemini/generate-music', { prompt: '   ' });
  console.log('Neg 6 (Empty prompt in music): HTTP', neg6.status, neg6.status === 400 ? '[PASS - Real Error]' : '[FAIL]');

  console.log('=== NEGATIVE TESTS COMPLETE ===');
}

runNegativeTests();

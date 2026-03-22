import express from 'express';

const router = express.Router();

router.post('/ai/generate-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  const { prompt } = req.body;

  // ⚠️ Replace this with your real local AI (llama.cpp / ollama / etc.)
  const fakeResponse = `// streamed response for: ${prompt}\nfunction hello() {\n  return "Hello World";\n}`;

  let i = 0;

  const interval = setInterval(() => {
    if (i >= fakeResponse.length) {
      clearInterval(interval);
      res.end();
      return;
    }

    res.write(fakeResponse[i]);
    i++;
  }, 10);
});

export default router;

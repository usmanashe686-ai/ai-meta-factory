const fetch = require('node-fetch');

const API_URL = 'http://localhost:8000';

async function testModels() {
  console.log('🔍 Testing AI Model Inference\n');

  // 1. List models
  console.log('📋 Fetching available models...');
  try {
    const modelsRes = await fetch(`${API_URL}/models`);
    const models = await modelsRes.json();
    console.log('Available models:', models);
  } catch (err) {
    console.error('Failed to fetch models:', err.message);
  }

  // 2. Test TinyLlama
  console.log('\n🧪 Testing TinyLlama generation...');
  try {
    const genRes = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tinyllama-1.1b',
        prompt: 'Write a one-line joke about programming',
        max_tokens: 30,
        temperature: 0.7
      })
    });
    const genData = await genRes.json();
    console.log('Generated text:', genData.text);
  } catch (err) {
    console.error('Generation failed:', err.message);
  }

  // 3. Test Qwen2 code generation
  console.log('\n🧪 Testing Qwen2 code generation...');
  try {
    const codeRes = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2-0.5b',
        prompt: 'Write a JavaScript arrow function that adds two numbers',
        max_tokens: 50,
        temperature: 0.2
      })
    });
    const codeData = await codeRes.json();
    console.log('Generated code:', codeData.text);
  } catch (err) {
    console.error('Code generation failed:', err.message);
  }
}

testModels();

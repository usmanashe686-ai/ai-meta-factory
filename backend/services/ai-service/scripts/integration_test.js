const fetch = require('node-fetch');

const API_URL = 'http://ai-meta-factory.onrender.com';
const GENERATE_ENDPOINT = `${API_URL}/generate`;

async function callGenerate(prompt, model = 'tinyllama-1.1b', maxTokens = 300, temperature = 0.3) {
  const res = await fetch(GENERATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, max_tokens: maxTokens, temperature })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.text || data.generated_text || '';
}

async function runTest() {
  console.log('🚀 Starting integration test: Idea to Code');
  const IDEA = 'Create a task management app with user authentication, task creation, and due dates.';
  console.log(`\n📝 Idea: ${IDEA}`);

  // 1. Extract features
  console.log('\n🔍 Extracting features...');
  const featurePrompt = `Extract the core features from this project idea. Return a JSON array of objects with 'name', 'description', and 'priority' (high/medium/low). Idea: "${IDEA}"`;
  const featureText = await callGenerate(featurePrompt, 'tinyllama-1.1b', 300, 0.3);
  console.log('Raw response:', featureText);
  let features;
  try {
    const match = featureText.match(/\[[\s\S]*\]/);
    features = match ? JSON.parse(match[0]) : [];
  } catch (e) {
    console.warn('Failed to parse features, using fallback');
    features = [{ name: 'User Authentication', priority: 'high' }];
  }
  console.log('Features:', features);

  // 2. Generate roadmap
  console.log('\n🗺️ Generating roadmap...');
  const roadmapPrompt = `Create a detailed project roadmap for the following idea. Return a JSON array of objects with 'week' (number), 'title' (string), 'description' (string), and 'tasks' (array of strings). Idea: "${IDEA}"`;
  const roadmapText = await callGenerate(roadmapPrompt, 'tinyllama-1.1b', 500, 0.4);
  console.log('Raw response:', roadmapText);
  let roadmap;
  try {
    const match = roadmapText.match(/\[[\s\S]*\]/);
    roadmap = match ? JSON.parse(match[0]) : [];
  } catch (e) {
    console.warn('Failed to parse roadmap, using fallback');
    roadmap = [{ week: 1, title: 'Setup', description: 'Initial setup', tasks: ['Install tools'] }];
  }
  console.log('Roadmap:', roadmap);

  // 3. Generate code for first feature
  console.log('\n💻 Generating code for first feature...');
  const firstFeature = features[0]?.name || 'authentication';
  const codePrompt = `Write code for a feature: ${firstFeature} in a task management app. Use JavaScript/React.`;
  const code = await callGenerate(codePrompt, 'tinyllama-1.1b', 300, 0.2);
  console.log('\n📄 Generated Code:\n', code);

  console.log('\n✅ Integration test completed.');
}

runTest().catch(console.error);

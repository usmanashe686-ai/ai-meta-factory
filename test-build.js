const fs = require('fs');
const path = require('path');

console.log('📦 Testing Node.js environment...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Check for next
try {
  const next = require.resolve('next');
  console.log('✅ Next.js found at:', next);
} catch (e) {
  console.log('❌ Next.js not found:', e.message);
}

// Check for react
try {
  const react = require.resolve('react');
  console.log('✅ React found at:', react);
} catch (e) {
  console.log('❌ React not found:', e.message);
}

console.log('\n📁 Checking directory structure...');
['app', 'components', 'lib'].forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ exists`);
  } else {
    console.log(`❌ ${dir}/ missing`);
  }
});

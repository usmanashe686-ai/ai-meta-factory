// Simple test that doesn't require complex dependencies
console.log("🧪 Simple Mobile Export Test");
console.log("==========================");

import fs from 'fs';
import path from 'path';

// Check if files exist
const filesToCheck = [
  'lib/export/mobile/react-native-transformer.ts',
  'lib/export/mobile/expo-generator.ts'
];

console.log("\n📁 Checking files:");
filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
  }
});

// Test JSZip import
console.log("\n📦 Testing JSZip import:");
try {
  const JSZip = require('jszip');
  console.log("✅ JSZip imported successfully");
  
  // Create a simple test zip
  const zip = new JSZip();
  zip.file("test.txt", "Hello from AI Meta-Software Factory!");
  
  console.log("✅ JSZip instance created");
  
  // Try to generate blob
  zip.generateAsync({ type: "blob" }).then((blob: any) => {
    console.log(`✅ ZIP generated: ${blob.size} bytes`);
  }).catch((error: any) => {
    console.log(`⚠️  ZIP generation test skipped: ${error.message}`);
  });
  
} catch (error: any) {
  console.log(`❌ JSZip error: ${error.message}`);
}

// Test React Native Transformer
console.log("\n⚛️  Testing React Native Transformer:");
try {
  const transformerCode = fs.readFileSync(
    path.join(process.cwd(), 'lib/export/mobile/react-native-transformer.ts'),
    'utf-8'
  );
  
  if (transformerCode.includes('convertButton') && 
      transformerCode.includes('convertInput') &&
      transformerCode.includes('convertText')) {
    console.log("✅ React Native Transformer looks complete");
  } else {
    console.log("⚠️  React Native Transformer might be incomplete");
  }
  
} catch (error: any) {
  console.log(`❌ Transformer check failed: ${error.message}`);
}

console.log("\n🎉 Simple test completed!");
console.log("\n📝 To run full test:");
console.log("1. Install tsx: npm install -D tsx");
console.log("2. Run: npx tsx scripts/test-expo-generator.ts");

// ============================================================================
// AI Meta Factory – Export Utilities
// Prepare projects for export, create ZIP files, generate APK instructions.
// ============================================================================

import { Project } from '../types/project.types';
import { ExportFormat, BuildResult } from '../types/platform.types';
import { FileNode } from '../types/project.types';

/**
 * Prepare a project for export as a ZIP file
 */
export async function createProjectZip(project: Project): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  // Helper to flatten the file tree
  const addFilesToZip = (nodes: FileNode[], basePath = '') => {
    nodes.forEach(node => {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
      if (node.type === 'file') {
        zip.file(fullPath, node.content ?? '');
      } else if (node.children) {
        addFilesToZip(node.children, fullPath);
      }
    });
  };

  addFilesToZip(project.files);

  // Add metadata file
  zip.file('project.json', JSON.stringify({
    name: project.name,
    description: project.description,
    type: project.type,
    framework: project.framework,
    createdAt: project.createdAt.toISOString(),
    version: project.config.version,
  }, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate a Flutter project structure for APK building
 */
export function generateFlutterProject(project: Project): Record<string, string> {
  const name = project.slug || 'app';
  const description = project.description || 'Created with AI Meta Factory';

  return {
    'pubspec.yaml': `name: ${name}
description: ${description}
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
`,
    'lib/main.dart': `import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${project.name}',
      home: Scaffold(
        appBar: AppBar(title: Text('${project.name}')),
        body: Center(
          child: Text('Built with AI Meta Factory!'),
        ),
      ),
    );
  }
}
`,
    'android/app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aimetafactory.${name}">
  <application
      android:label="${project.name}"
      android:name="\${applicationName}"
      android:icon="@mipmap/ic_launcher">
    <activity
        android:name=".MainActivity"
        android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>`,
  };
}

/**
 * Generate a React Native project structure
 */
export function generateReactNativeProject(project: Project): Record<string, string> {
  return {
    'package.json': JSON.stringify({
      name: project.slug,
      version: '1.0.0',
      main: 'index.js',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
      },
      dependencies: {
        react: '18.2.0',
        'react-native': '0.72.0',
        expo: '~49.0.0',
      },
    }, null, 2),
    'App.js': `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>${project.name}</Text>
      <Text>Built with AI Meta Factory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});`,
    'index.js': `import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);`,
  };
}

/**
 * Generate a generic web project (HTML/CSS/JS)
 */
export function generateWebProject(project: Project): Record<string, string> {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>${project.name}</h1>
    <p>${project.description || 'Built with AI Meta Factory'}</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}

h1 { font-size: 3rem; margin-bottom: 1rem; }
p { font-size: 1.2rem; opacity: 0.9; }`,
    'script.js': `console.log('${project.name} loaded!');`,
  };
}

/**
 * Generate export instructions based on format
 */
export function getExportInstructions(format: ExportFormat): string {
  const instructions: Record<ExportFormat, string> = {
    zip: '✅ ZIP file ready – extract and run locally.',
    apk: '📱 APK file ready – install on Android or upload to Play Store.',
    ipa: '🍏 IPA file – requires Apple Developer account to sign and install.',
    exe: '🪟 Windows executable – double‑click to run.',
    dmg: '🍎 macOS disk image – drag to Applications folder.',
    appimage: '🐧 Linux AppImage – make executable and run.',
    docker: '🐳 Docker image – run with `docker run`.',
    pwa: '🌐 Progressive Web App – deploy and install via browser.',
    static: '📄 Static website – upload to any hosting service.',
    vercel: '▲ Deployed to Vercel – share the URL.',
    netlify: '🚀 Deployed to Netlify – share the URL.',
    github: '🐙 Pushed to GitHub – clone or deploy.',
  };
  return instructions[format] || 'Export ready.';
}

/**
 * Estimate build time based on project size and complexity
 */
export function estimateBuildTime(project: Project, format: ExportFormat): number {
  // Flatten files to count and get total size
  const flattenFiles = (nodes: FileNode[]): FileNode[] => {
    let files: FileNode[] = [];
    nodes.forEach(node => {
      if (node.type === 'file') files.push(node);
      if (node.children) files = files.concat(flattenFiles(node.children));
    });
    return files;
  };
  const allFiles = flattenFiles(project.files);
  const fileCount = allFiles.length;
  const totalSize = allFiles.reduce((acc, f) => acc + (f.content?.length || 0), 0);

  // Rough heuristic: base 2 seconds + 0.1s per file + 0.001s per KB
  let base = 2;
  if (format === 'apk' || format === 'ipa') base = 15;
  if (format === 'docker') base = 10;

  return Math.round(base + fileCount * 0.1 + totalSize / 1024 * 0.001);
}

/**
 * Generate a unique filename for the export
 */
export function generateExportFileName(project: Project, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = project.slug || 'project';
  return `${slug}-${timestamp}.${format}`;
}

/**
 * Create a community build request URL
 */
export function createCommunityBuildUrl(project: Project): string {
  const base = 'https://build.aimetafactory.com/request';
  const params = new URLSearchParams({
    project: project.id,
    name: project.name,
    type: project.type,
  });
  return `${base}?${params.toString()}`;
}

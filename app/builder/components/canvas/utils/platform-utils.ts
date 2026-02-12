// ============================================================================
// AI Meta Factory – Platform Utilities
// Detect platform from description, validate framework compatibility, etc.
// ============================================================================

import {
  ProjectType,
  Framework,
  PROJECT_TYPE_REGISTRY,
} from '../types/platform.types';

/**
 * Detect the most likely project type from a user's description
 */
export function detectPlatformFromDescription(description: string): ProjectType {
  const lower = description.toLowerCase();
  
  const keywords: Record<ProjectType, string[]> = {
    website: ['website', 'landing', 'blog', 'portfolio', 'e-commerce', 'ecommerce', 'static'],
    webapp: ['web app', 'dashboard', 'admin', 'crm', 'saas', 'analytics', 'web application'],
    mobile: ['app', 'android', 'ios', 'mobile', 'phone', 'flutter', 'react native'],
    desktop: ['desktop', 'windows', 'mac', 'linux', 'electron', 'tauri', 'application'],
    api: ['api', 'backend', 'server', 'microservice', 'graphql', 'rest', 'express'],
    bot: ['bot', 'chatbot', 'discord', 'slack', 'telegram', 'automation'],
    game: ['game', '2d', '3d', 'unity', 'unreal', 'phaser', 'three.js', 'babylon'],
    iot: ['iot', 'arduino', 'raspberry', 'sensor', 'smart home', 'embedded'],
  };
  
  let bestMatch: ProjectType = 'webapp';
  let highestScore = 0;
  
  (Object.keys(keywords) as ProjectType[]).forEach((type) => {
    const score = keywords[type].reduce((acc, word) => {
      return acc + (lower.includes(word) ? 1 : 0);
    }, 0);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = type;
    }
  });
  
  return bestMatch;
}

/**
 * Get recommended framework for a platform
 */
export function getRecommendedFramework(type: ProjectType): Framework {
  const recommendations: Record<ProjectType, Framework> = {
    website: 'next',
    webapp: 'react',
    mobile: 'react-native',
    desktop: 'electron',
    api: 'next', // API routes in Next.js
    bot: 'discordjs',
    game: 'phaser',
    iot: 'arduino',
  };
  return recommendations[type] || 'react';
}

/**
 * Check if a framework is compatible with a project type
 */
export function isFrameworkCompatible(type: ProjectType, framework: Framework): boolean {
  const compatibilityMap: Record<ProjectType, Framework[]> = {
    website: ['react', 'vue', 'svelte', 'next', 'nuxt', 'sveltekit', 'astro', 'static-html'],
    webapp: ['react', 'vue', 'svelte', 'next', 'nuxt', 'sveltekit'],
    mobile: ['react-native', 'flutter', 'ionic', 'capacitor'],
    desktop: ['electron', 'tauri', 'flutter-desktop'],
    api: ['next', 'express', 'fastify'],
    bot: ['discordjs', 'python-telegram'],
    game: ['phaser', 'threejs', 'babylon'],
    iot: ['arduino', 'raspberry-pi', 'esp32'],
  };
  
  return compatibilityMap[type]?.includes(framework) ?? false;
}

/**
 * Get default file structure for a new project of a given type
 */
export function getDefaultFiles(type: ProjectType): Record<string, string> {
  const defaults: Record<ProjectType, Record<string, string>> = {
    website: {
      'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Website</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
      'style.css': 'body { font-family: sans-serif; margin: 2rem; }',
      'script.js': 'console.log("Hello from AI Meta Factory!");',
    },
    webapp: {
      'App.js': 'import React from "react";\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}',
      'index.js': 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));',
    },
    mobile: {
      'App.js': 'import React from "react";\nimport { View, Text, StyleSheet } from "react-native";\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text>Hello, World!</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: "center",\n    alignItems: "center",\n  },\n});',
    },
    desktop: {
      'main.js': 'const { app, BrowserWindow } = require("electron");\n\nfunction createWindow() {\n  const win = new BrowserWindow({\n    width: 800,\n    height: 600,\n    webPreferences: {\n      nodeIntegration: true,\n    },\n  });\n\n  win.loadFile("index.html");\n}\n\napp.whenReady().then(createWindow);',
      'index.html': '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello from Electron!</h1>\n</body>\n</html>',
      'package.json': '{\n  "name": "desktop-app",\n  "version": "1.0.0",\n  "main": "main.js",\n  "scripts": {\n    "start": "electron ."\n  }\n}',
    },
    api: {
      'index.js': 'const express = require("express");\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.get("/", (req, res) => {\n  res.json({ message: "Hello World!" });\n});\n\napp.listen(port, () => {\n  console.log(`API listening on port ${port}`);\n});',
      'package.json': '{\n  "name": "api",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "express": "^4.18.0"\n  }\n}',
    },
    bot: {
      'index.js': 'const { Client, GatewayIntentBits } = require("discord.js");\nconst client = new Client({ intents: [GatewayIntentBits.Guilds] });\n\nclient.once("ready", () => {\n  console.log("Bot is ready!");\n});\n\nclient.on("interactionCreate", async (interaction) => {\n  if (!interaction.isChatInputCommand()) return;\n\n  if (interaction.commandName === "ping") {\n    await interaction.reply("Pong!");\n  }\n});\n\nclient.login(process.env.DISCORD_TOKEN);',
    },
    game: {
      'game.js': 'const config = {\n  type: Phaser.AUTO,\n  width: 800,\n  height: 600,\n  scene: {\n    preload: preload,\n    create: create,\n    update: update,\n  },\n};\n\nconst game = new Phaser.Game(config);\n\nfunction preload() {}\n\nfunction create() {\n  this.add.text(400, 300, "Hello, Phaser!", { fontSize: "32px" }).setOrigin(0.5);\n}\n\nfunction update() {}',
    },
    iot: {
      'sketch.ino': 'void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n  Serial.println("Hello from Arduino!");\n}',
    },
  };
  
  return defaults[type] || defaults.website;
}

/**
 * Validate if a project type and framework combination is supported
 */
export function validatePlatformChoice(type: ProjectType, framework?: Framework): { valid: boolean; message?: string } {
  if (!framework) {
    return { valid: true };
  }
  
  if (!isFrameworkCompatible(type, framework)) {
    return {
      valid: false,
      message: `Framework "${framework}" is not compatible with project type "${type}". Recommended: ${getRecommendedFramework(type)}`,
    };
  }
  
  return { valid: true };
}

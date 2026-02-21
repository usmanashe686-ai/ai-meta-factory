/**
 * Export Optimizer
 * 
 * This module optimizes a project for production by:
 * - Running framework‑specific build commands (Next.js, Vite, etc.)
 * - Compressing assets (images, CSS, JS)
 * - Ensuring tree shaking and code splitting are applied
 * 
 * It is designed to be called by the ExportService before creating the final ZIP.
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import glob from 'glob';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export interface OptimizerOptions {
  /** Path to the project root */
  projectDir: string;
  /** Whether to skip the build step (e.g., if already built) */
  skipBuild?: boolean;
  /** Additional environment variables to pass to build commands */
  env?: Record<string, string>;
  /** Specific optimizations to apply */
  optimizations?: {
    images?: boolean;
    css?: boolean;
    js?: boolean;
  };
}

export interface OptimizationResult {
  success: boolean;
  buildLog: string;
  outputDir: string;
  errors?: string[];
}

/**
 * Main optimization function.
 * Detects project type and runs appropriate build/optimization steps.
 */
export async function optimizeProject(options: OptimizerOptions): Promise<OptimizationResult> {
  const { projectDir, skipBuild = false, env = {}, optimizations = {} } = options;
  const errors: string[] = [];
  let buildLog = '';

  // Merge environment with process.env
  const mergedEnv = { ...process.env, ...env };

  // Detect project type
  const hasNextConfig = fs.existsSync(path.join(projectDir, 'next.config.js')) ||
                        fs.existsSync(path.join(projectDir, 'next.config.ts'));
  const hasViteConfig = fs.existsSync(path.join(projectDir, 'vite.config.js')) ||
                        fs.existsSync(path.join(projectDir, 'vite.config.ts'));
  const hasWebpackConfig = fs.existsSync(path.join(projectDir, 'webpack.config.js'));
  const hasPackageJson = fs.existsSync(path.join(projectDir, 'package.json'));

  if (!hasPackageJson) {
    errors.push('No package.json found – cannot determine project type.');
    return { success: false, buildLog, outputDir: projectDir, errors };
  }

  // Determine output directory after build
  let outputDir = projectDir;

  if (!skipBuild) {
    // Run `npm install` if node_modules is missing? (Optional)
    if (!fs.existsSync(path.join(projectDir, 'node_modules'))) {
      buildLog += 'Running npm install...\n';
      try {
        execSync('npm install', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
      } catch (e: any) {
        errors.push(`npm install failed: ${e.message}`);
      }
    }

    // Framework‑specific build
    if (hasNextConfig) {
      buildLog += 'Detected Next.js project. Running next build...\n';
      try {
        const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        // Next.js outputs to .next, but we'll serve from there; keep outputDir as projectDir.
        outputDir = projectDir;
      } catch (e: any) {
        errors.push(`Next.js build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else if (hasViteConfig) {
      buildLog += 'Detected Vite project. Running vite build...\n';
      try {
        const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        // Vite outputs to 'dist' by default
        const distPath = path.join(projectDir, 'dist');
        if (fs.existsSync(distPath)) {
          outputDir = distPath;
        }
      } catch (e: any) {
        errors.push(`Vite build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else if (hasWebpackConfig) {
      buildLog += 'Detected webpack project. Running webpack...\n';
      try {
        const output = execSync('npx webpack --mode production', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        // Assume output to 'dist' or 'build'
        const possible = ['dist', 'build'];
        for (const d of possible) {
          if (fs.existsSync(path.join(projectDir, d))) {
            outputDir = path.join(projectDir, d);
            break;
          }
        }
      } catch (e: any) {
        errors.push(`webpack build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else {
      // Generic: try `npm run build` if script exists
      const pkg = JSON.parse(await readFile(path.join(projectDir, 'package.json'), 'utf-8'));
      if (pkg.scripts && pkg.scripts.build) {
        buildLog += 'Running generic npm run build...\n';
        try {
          const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
          buildLog += output;
          // Check common output folders
          const possible = ['dist', 'build', 'out'];
          for (const d of possible) {
            if (fs.existsSync(path.join(projectDir, d))) {
              outputDir = path.join(projectDir, d);
              break;
            }
          }
        } catch (e: any) {
          errors.push(`npm run build failed: ${e.message}`);
          buildLog += e.stdout || '';
        }
      } else {
        buildLog += 'No build script found – skipping build step.\n';
      }
    }
  }

  // Additional asset optimizations (if requested)
  if (optimizations.images) {
    buildLog += 'Optimizing images...\n';
    try {
      await optimizeImages(projectDir);
    } catch (e: any) {
      errors.push(`Image optimization failed: ${e.message}`);
    }
  }
  if (optimizations.css) {
    buildLog += 'Optimizing CSS...\n';
    try {
      await optimizeCss(projectDir);
    } catch (e: any) {
      errors.push(`CSS optimization failed: ${e.message}`);
    }
  }
  if (optimizations.js) {
    buildLog += 'Optimizing JavaScript...\n';
    try {
      await optimizeJs(projectDir);
    } catch (e: any) {
      errors.push(`JS optimization failed: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    buildLog,
    outputDir,
    errors: errors.length ? errors : undefined,
  };
}

/**
 * Optimize images in the output directory using sharp.
 * Assumes sharp is installed (optional dependency).
 */
async function optimizeImages(projectDir: string) {
  // Look for common image folders in output directory
  const imageGlobs = [
    '**/*.{jpg,jpeg,png,gif,svg}',
    'public/**/*.{jpg,jpeg,png,gif,svg}',
    'assets/**/*.{jpg,jpeg,png,gif,svg}',
  ];
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    // sharp not installed – skip
    console.warn('sharp not installed – skipping image optimization');
    return;
  }

  for (const pattern of imageGlobs) {
    const files = glob.sync(pattern, { cwd: projectDir, absolute: true });
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.svg') {
        // SVGO could be used, but skip for now
        continue;
      }
      const image = sharp(file);
      const metadata = await image.metadata();
      // If width > 1920, resize (optional)
      if (metadata.width && metadata.width > 1920) {
        await image.resize({ width: 1920 }).toFile(file + '.tmp');
        fs.renameSync(file + '.tmp', file);
      } else {
        // Recompress without resizing
        await image.toFile(file + '.tmp');
        fs.renameSync(file + '.tmp', file);
      }
    }
  }
}

/**
 * Optimize CSS using cssnano via postcss.
 * Requires postcss and cssnano installed.
 */
async function optimizeCss(projectDir: string) {
  // Look for CSS files in output directory
  const cssFiles = glob.sync('**/*.css', { cwd: projectDir, absolute: true });
  if (cssFiles.length === 0) return;

  let postcss, cssnano;
  try {
    postcss = require('postcss');
    cssnano = require('cssnano');
  } catch {
    console.warn('postcss/cssnano not installed – skipping CSS optimization');
    return;
  }

  const processor = postcss([cssnano({ preset: 'default' })]);

  for (const file of cssFiles) {
    const css = await readFile(file, 'utf-8');
    const result = await processor.process(css, { from: file, to: file });
    await writeFile(file, result.css);
  }
}

/**
 * Optimize JavaScript using terser.
 * Requires terser installed.
 */
async function optimizeJs(projectDir: string) {
  // Look for JS files (but avoid minified ones)
  const jsFiles = glob.sync('**/*.{js,mjs}', { 
    cwd: projectDir, 
    absolute: true,
    ignore: ['**/*.min.js', '**/node_modules/**']
  });
  if (jsFiles.length === 0) return;

  let terser;
  try {
    terser = require('terser');
  } catch {
    console.warn('terser not installed – skipping JS optimization');
    return;
  }

  for (const file of jsFiles) {
    const code = await readFile(file, 'utf-8');
    const result = await terser.minify(code, {
      compress: true,
      mangle: true,
      sourceMap: false,
    });
    if (result.code) {
      await writeFile(file, result.code);
    }
  }
}

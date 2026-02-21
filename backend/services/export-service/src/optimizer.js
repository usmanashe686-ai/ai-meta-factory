/**
 * Export Optimizer (JavaScript version)
 * 
 * This module optimizes a project for production by:
 * - Running framework‑specific build commands (Next.js, Vite, etc.)
 * - Compressing assets (images, CSS, JS)
 * - Ensuring tree shaking and code splitting are applied
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = require('glob');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Main optimization function.
 */
async function optimizeProject(options) {
  const { projectDir, skipBuild = false, env = {}, optimizations = {} } = options;
  const errors = [];
  let buildLog = '';

  const mergedEnv = { ...process.env, ...env };

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

  let outputDir = projectDir;

  if (!skipBuild) {
    if (!fs.existsSync(path.join(projectDir, 'node_modules'))) {
      buildLog += 'Running npm install...\n';
      try {
        execSync('npm install', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
      } catch (e) {
        errors.push(`npm install failed: ${e.message}`);
      }
    }

    if (hasNextConfig) {
      buildLog += 'Detected Next.js project. Running next build...\n';
      try {
        const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        outputDir = projectDir;
      } catch (e) {
        errors.push(`Next.js build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else if (hasViteConfig) {
      buildLog += 'Detected Vite project. Running vite build...\n';
      try {
        const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        const distPath = path.join(projectDir, 'dist');
        if (fs.existsSync(distPath)) outputDir = distPath;
      } catch (e) {
        errors.push(`Vite build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else if (hasWebpackConfig) {
      buildLog += 'Detected webpack project. Running webpack...\n';
      try {
        const output = execSync('npx webpack --mode production', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
        buildLog += output;
        for (const d of ['dist', 'build']) {
          if (fs.existsSync(path.join(projectDir, d))) {
            outputDir = path.join(projectDir, d);
            break;
          }
        }
      } catch (e) {
        errors.push(`webpack build failed: ${e.message}`);
        buildLog += e.stdout || '';
      }
    } else {
      const pkg = JSON.parse(await readFile(path.join(projectDir, 'package.json'), 'utf-8'));
      if (pkg.scripts && pkg.scripts.build) {
        buildLog += 'Running generic npm run build...\n';
        try {
          const output = execSync('npm run build', { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8' });
          buildLog += output;
          for (const d of ['dist', 'build', 'out']) {
            if (fs.existsSync(path.join(projectDir, d))) {
              outputDir = path.join(projectDir, d);
              break;
            }
          }
        } catch (e) {
          errors.push(`npm run build failed: ${e.message}`);
          buildLog += e.stdout || '';
        }
      } else {
        buildLog += 'No build script found – skipping build step.\n';
      }
    }
  }

  if (optimizations.images) {
    buildLog += 'Optimizing images...\n';
    try {
      await optimizeImages(projectDir);
    } catch (e) {
      errors.push(`Image optimization failed: ${e.message}`);
    }
  }
  if (optimizations.css) {
    buildLog += 'Optimizing CSS...\n';
    try {
      await optimizeCss(projectDir);
    } catch (e) {
      errors.push(`CSS optimization failed: ${e.message}`);
    }
  }
  if (optimizations.js) {
    buildLog += 'Optimizing JavaScript...\n';
    try {
      await optimizeJs(projectDir);
    } catch (e) {
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

async function optimizeImages(projectDir) {
  const imageGlobs = [
    '**/*.{jpg,jpeg,png,gif,svg}',
    'public/**/*.{jpg,jpeg,png,gif,svg}',
    'assets/**/*.{jpg,jpeg,png,gif,svg}',
  ];
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('sharp not installed – skipping image optimization');
    return;
  }

  for (const pattern of imageGlobs) {
    const files = glob.sync(pattern, { cwd: projectDir, absolute: true });
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.svg') continue;
      const image = sharp(file);
      const metadata = await image.metadata();
      if (metadata.width && metadata.width > 1920) {
        await image.resize({ width: 1920 }).toFile(file + '.tmp');
        fs.renameSync(file + '.tmp', file);
      } else {
        await image.toFile(file + '.tmp');
        fs.renameSync(file + '.tmp', file);
      }
    }
  }
}

async function optimizeCss(projectDir) {
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

async function optimizeJs(projectDir) {
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

module.exports = { optimizeProject };

/**
 * Export Validator (JavaScript version)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

async function validateExport(options) {
  const { projectDir, platform, framework, runSimulator = false, timeout = 30000 } = options;
  const errors = [];
  const warnings = [];
  const details = {};
  let log = '';

  if (!fs.existsSync(projectDir)) {
    errors.push(`Project directory does not exist: ${projectDir}`);
    return { success: false, errors, warnings, details, log };
  }

  log += `Validating export at ${projectDir} (platform: ${platform}, framework: ${framework})\n`;

  try {
    const essentialChecks = await checkEssentialFiles(projectDir, platform, framework);
    errors.push(...essentialChecks.errors);
    warnings.push(...essentialChecks.warnings);
    details.files = essentialChecks.files;
    log += essentialChecks.log;
  } catch (e) {
    errors.push(`Essential file check failed: ${e.message}`);
  }

  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgContent = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(pkgContent);
      details.packageJson = pkg;
      log += `package.json found with name: ${pkg.name}\n`;
    } catch (e) {
      warnings.push(`Invalid package.json: ${e.message}`);
    }
  }

  try {
    const buildResult = await testBuild(projectDir, timeout);
    if (!buildResult.success) {
      errors.push(`Test build failed: ${buildResult.error}`);
    } else {
      details.buildOutput = buildResult.output;
      log += buildResult.log;
    }
  } catch (e) {
    warnings.push(`Build test skipped: ${e.message}`);
  }

  try {
    const platformChecks = await validatePlatform(projectDir, platform, framework);
    errors.push(...platformChecks.errors);
    warnings.push(...platformChecks.warnings);
    log += platformChecks.log;
  } catch (e) {
    warnings.push(`Platform validation error: ${e.message}`);
  }

  if (runSimulator) {
    try {
      const simResult = await runOnSimulator(projectDir, platform, framework, timeout);
      if (!simResult.success) {
        warnings.push(`Simulator run failed: ${simResult.error}`);
      } else {
        details.simulatorOutput = simResult.output;
        log += simResult.log;
      }
    } catch (e) {
      warnings.push(`Simulator run skipped: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    details,
    log,
  };
}

async function checkEssentialFiles(projectDir, platform, framework) {
  const errors = [];
  const warnings = [];
  const files = [];
  let log = '';

  const expected = [];
  if (platform === 'web') {
    expected.push('index.html');
  } else if (platform === 'mobile') {
    if (framework === 'flutter') {
      expected.push('pubspec.yaml');
    } else if (framework === 'react-native') {
      expected.push('package.json', 'index.js');
    }
  } else if (platform === 'desktop') {
    if (framework === 'electron') {
      expected.push('package.json', 'main.js');
    } else if (framework === 'tauri') {
      expected.push('src-tauri/Cargo.toml');
    }
  } else if (platform === 'iot') {
    if (framework === 'arduino') {
      const inoFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.ino'));
      if (inoFiles.length === 0) errors.push('No .ino sketch found');
      files.push(...inoFiles);
    }
  }

  for (const file of expected) {
    const fullPath = path.join(projectDir, file);
    try {
      await access(fullPath, fs.constants.R_OK);
      files.push(file);
      log += `Found ${file}\n`;
    } catch {
      warnings.push(`Expected file not found: ${file}`);
    }
  }

  return { errors, warnings, files, log };
}

async function testBuild(projectDir, timeout) {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { success: false, error: 'No package.json found', log: '' };
  }

  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  if (!pkg.scripts || !pkg.scripts.build) {
    return { success: false, error: 'No build script defined', log: '' };
  }

  try {
    const output = execSync('npm run build', { cwd: projectDir, timeout, encoding: 'utf-8' });
    return { success: true, output, log: `Build successful\n${output}` };
  } catch (e) {
    return { success: false, error: e.message, log: e.stdout || '' };
  }
}

async function validatePlatform(projectDir, platform, framework) {
  const errors = [];
  const warnings = [];
  let log = '';

  if (platform === 'mobile') {
    const apkExists = fs.existsSync(path.join(projectDir, 'app-release.apk')) ||
                      fs.existsSync(path.join(projectDir, 'build/app/outputs/flutter-apk/app-release.apk'));
    if (!apkExists) {
      warnings.push('No APK found – may not be a mobile build');
    } else {
      log += 'APK found.\n';
    }
  } else if (platform === 'desktop') {
    const exeExists = fs.existsSync(path.join(projectDir, 'dist')) &&
                      fs.readdirSync(path.join(projectDir, 'dist')).some(f => f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.AppImage'));
    if (!exeExists) {
      warnings.push('No desktop executable found');
    }
  }

  return { errors, warnings, log };
}

async function runOnSimulator(projectDir, platform, framework, timeout) {
  return {
    success: false,
    error: 'Simulator not implemented in this validator',
    log: 'Simulator run skipped.',
  };
}

module.exports = { validateExport };

/**
 * Export Validator
 * 
 * This module validates an exported project to ensure it is functional.
 * It performs checks like:
 * - Verifying essential files exist
 * - Running a test build (if applicable)
 * - Optionally launching a simulator/emulator for mobile/desktop targets
 * - Checking for common errors
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

export interface ValidationOptions {
  /** Path to the exported project root */
  projectDir: string;
  /** Type of export: 'web', 'mobile', 'desktop', 'game', 'iot' */
  platform: string;
  /** Specific framework (e.g., 'react', 'nextjs', 'flutter', 'electron') */
  framework?: string;
  /** Whether to attempt running on a simulator/emulator */
  runSimulator?: boolean;
  /** Timeout for validation steps (ms) */
  timeout?: number;
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
  log: string;
}

/**
 * Main validation function.
 */
export async function validateExport(options: ValidationOptions): Promise<ValidationResult> {
  const { projectDir, platform, framework, runSimulator = false, timeout = 30000 } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, any> = {};
  let log = '';

  if (!fs.existsSync(projectDir)) {
    errors.push(`Project directory does not exist: ${projectDir}`);
    return { success: false, errors, warnings, details, log };
  }

  log += `Validating export at ${projectDir} (platform: ${platform}, framework: ${framework})\n`;

  // 1. Check for essential files based on platform/framework
  try {
    const essentialChecks = await checkEssentialFiles(projectDir, platform, framework);
    errors.push(...essentialChecks.errors);
    warnings.push(...essentialChecks.warnings);
    details.files = essentialChecks.files;
    log += essentialChecks.log;
  } catch (e: any) {
    errors.push(`Essential file check failed: ${e.message}`);
  }

  // 2. Try to parse package.json (if exists)
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgContent = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(pkgContent);
      details.packageJson = pkg;
      log += `package.json found with name: ${pkg.name}\n`;
    } catch (e: any) {
      warnings.push(`Invalid package.json: ${e.message}`);
    }
  }

  // 3. Run a test build if possible (e.g., `npm run build` if script exists)
  try {
    const buildResult = await testBuild(projectDir, timeout);
    if (!buildResult.success) {
      errors.push(`Test build failed: ${buildResult.error}`);
    } else {
      details.buildOutput = buildResult.output;
      log += buildResult.log;
    }
  } catch (e: any) {
    warnings.push(`Build test skipped: ${e.message}`);
  }

  // 4. Validate specific platform requirements
  try {
    const platformChecks = await validatePlatform(projectDir, platform, framework);
    errors.push(...platformChecks.errors);
    warnings.push(...platformChecks.warnings);
    log += platformChecks.log;
  } catch (e: any) {
    warnings.push(`Platform validation error: ${e.message}`);
  }

  // 5. Optionally run on simulator/emulator
  if (runSimulator) {
    try {
      const simResult = await runOnSimulator(projectDir, platform, framework, timeout);
      if (!simResult.success) {
        warnings.push(`Simulator run failed: ${simResult.error}`);
      } else {
        details.simulatorOutput = simResult.output;
        log += simResult.log;
      }
    } catch (e: any) {
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

/**
 * Check that essential files exist for the given platform/framework.
 */
async function checkEssentialFiles(
  projectDir: string,
  platform: string,
  framework?: string
): Promise<{ errors: string[]; warnings: string[]; files: string[]; log: string }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const files: string[] = [];
  let log = '';

  // Define expected files (simplified)
  const expected: string[] = [];
  if (platform === 'web') {
    expected.push('index.html');
    if (framework === 'react' || framework === 'nextjs') {
      // Not always present in build output, but we can check for build artifacts
    }
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
      // Look for .ino files
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

/**
 * Attempt to run a test build (e.g., `npm run build`) to catch compilation errors.
 */
async function testBuild(projectDir: string, timeout: number): Promise<{ success: boolean; error?: string; output?: string; log: string }> {
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
  } catch (e: any) {
    return { success: false, error: e.message, log: e.stdout || '' };
  }
}

/**
 * Validate platform-specific requirements (e.g., for iOS, check for .ipa, for Android check .apk).
 */
async function validatePlatform(
  projectDir: string,
  platform: string,
  framework?: string
): Promise<{ errors: string[]; warnings: string[]; log: string }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let log = '';

  // Look for platform-specific artifacts
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

/**
 * Attempt to run the project on a simulator/emulator.
 * This is highly platform-specific; we only provide a stub.
 */
async function runOnSimulator(
  projectDir: string,
  platform: string,
  framework?: string,
  timeout?: number
): Promise<{ success: boolean; error?: string; output?: string; log: string }> {
  // This is a placeholder; real implementation would launch emulator.
  return {
    success: false,
    error: 'Simulator not implemented in this validator',
    log: 'Simulator run skipped.',
  };
}

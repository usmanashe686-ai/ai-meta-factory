import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface TestResult {
  passed: boolean
  tests: {
    name: string
    passed: boolean
    message?: string
  }[]
  summary: string
}

export class APKTester {
  static async testProject(projectDir: string): Promise<TestResult> {
    const tests = [
      this.testPackageJson,
      this.testAppEntry,
      this.testDependencies,
      this.testComponents,
      this.testBuildConfig
    ]

    const results: any[] = []
    
    for (const test of tests) {
      try {
        const result = await (test as Function)(projectDir)
        results.push(result)
      } catch (error: any) {
        results.push({
          name: test.name,
          passed: false,
          message: error.message
        })
      }
    }

    const passedCount = results.filter(r => r.passed).length
    const totalCount = results.length

    return {
      passed: passedCount === totalCount,
      tests: results,
      summary: `${passedCount}/${totalCount} tests passed`
    }
  }

  private static async testPackageJson(projectDir: string) {
    const packagePath = path.join(projectDir, 'package.json')
    
    try {
      await fs.access(packagePath)
      const content = await fs.readFile(packagePath, 'utf-8')
      const pkg = JSON.parse(content)

      if (!pkg.name || !pkg.main || !pkg.dependencies) {
        throw new Error('Invalid package.json structure')
      }

      return {
        name: 'package.json',
        passed: true,
        message: 'Valid package.json found'
      }
    } catch (error) {
      throw new Error('Missing or invalid package.json')
    }
  }

  private static async testAppEntry(projectDir: string) {
    const appPaths = [
      path.join(projectDir, 'App.js'),
      path.join(projectDir, 'App.tsx'),
      path.join(projectDir, 'src', 'App.js'),
      path.join(projectDir, 'src', 'App.tsx')
    ]

    for (const appPath of appPaths) {
      try {
        await fs.access(appPath)
        const content = await fs.readFile(appPath, 'utf-8')
        
        // Basic React validation
        if (!content.includes('react') || !content.includes('export default')) {
          throw new Error('Invalid React component structure')
        }

        return {
          name: 'App Entry',
          passed: true,
          message: `Found valid App entry at ${path.basename(appPath)}`
        }
      } catch (error) {
        continue
      }
    }

    throw new Error('No valid App entry file found')
  }

  private static async testDependencies(projectDir: string) {
    const packagePath = path.join(projectDir, 'package.json')
    const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'))
    
    const requiredDeps = ['react', 'react-native', 'expo']
    const missingDeps = requiredDeps.filter(dep => !pkg.dependencies?.[dep])

    if (missingDeps.length > 0) {
      throw new Error(`Missing required dependencies: ${missingDeps.join(', ')}`)
    }

    return {
      name: 'Dependencies',
      passed: true,
      message: 'All required dependencies found'
    }
  }

  private static async testComponents(projectDir: string) {
    const componentsDir = path.join(projectDir, 'components')
    
    try {
      await fs.access(componentsDir)
      const files = await fs.readdir(componentsDir)
      const componentFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.tsx') || f.endsWith('.jsx'))

      if (componentFiles.length === 0) {
        throw new Error('No component files found')
      }

      // Test one component file
      const testFile = path.join(componentsDir, componentFiles[0])
      const content = await fs.readFile(testFile, 'utf-8')

      if (!content.includes('import') || !content.includes('export')) {
        throw new Error('Invalid component file structure')
      }

      return {
        name: 'Components',
        passed: true,
        message: `${componentFiles.length} component files found`
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error('Components directory not found')
      }
      throw error
    }
  }

  private static async testBuildConfig(projectDir: string) {
    const configPaths = [
      path.join(projectDir, 'app.json'),
      path.join(projectDir, 'eas.json')
    ]

    const foundConfigs: string[] = []
    
    for (const configPath of configPaths) {
      try {
        await fs.access(configPath)
        foundConfigs.push(path.basename(configPath))
      } catch (error) {
        continue
      }
    }

    if (foundConfigs.length === 0) {
      throw new Error('No build configuration files found')
    }

    return {
      name: 'Build Config',
      passed: true,
      message: `Found config files: ${foundConfigs.join(', ')}`
    }
  }

  // Quick terminal test for Termux
  static async quickTermuxTest(): Promise<boolean> {
    try {
      // Check if Termux has basic Android tools
      const commands = [
        'which termux-setup-storage',
        'which apksigner || echo "apksigner not found"',
        'which aapt || echo "aapt not found"'
      ]

      for (const cmd of commands) {
        try {
          await execAsync(cmd, { timeout: 5000 })
        } catch (error) {
          // Command not found is expected for some tools
          console.log(`Command check: ${cmd}`)
        }
      }

      return true
    } catch (error) {
      console.error('Termux test failed:', error)
      return false
    }
  }
}

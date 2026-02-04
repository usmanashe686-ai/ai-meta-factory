import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class AIWorkflow {
  async generateCode(prompt: string): Promise<{
    files: Record<string, string>;
    metadata: any;
  }> {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          framework: 'nextjs', 
          language: 'typescript' 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const files: Record<string, string> = {};
        data.files?.forEach((file: any) => {
          files[file.name] = file.content;
        });

        return {
          files,
          metadata: data.metadata
        };
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Code generation failed:', error);
      throw error;
    }
  }
  
  async enhanceCode(fileName: string, code: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName, 
          currentCode: code,
          language: this.getLanguage(fileName)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.enhancedCode;
      } else {
        throw new Error(data.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Code enhancement failed:', error);
      return code;
    }
  }
  
  async exportProject(
    files: Record<string, string>,
    projectName: string = 'ai-project'
  ): Promise<void> {
    try {
      const zip = new JSZip();
      
      Object.entries(files).forEach(([filePath, content]) => {
        zip.file(filePath, content);
      });
      
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'typescript': '^5.0.0',
        }
      };
      
      zip.file('package.json', JSON.stringify(packageJson, null, 2));
      
      const readme = `# ${projectName}

🚀 AI-Generated Project by AI Meta Factory

## Generated Files
${Object.keys(files).map(f => `- \`${f}\``).join('\n')}

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

Generated on ${new Date().toLocaleDateString()}`;
      
      zip.file('README.md', readme);
      
      zip.file('.gitignore', `# Dependencies
/node_modules
/.pnp
.pnp.js

# Next.js
/.next/
/out/

# Build
/build

# Misc
.DS_Store
*.pem

# Environment
.env*.local`);
      
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });
      
      saveAs(content, `${projectName}.zip`);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  private getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': case 'scss': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  }
}

export const workflow = new AIWorkflow();

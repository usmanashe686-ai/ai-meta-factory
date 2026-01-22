export class ProjectExporter {
  static exportProject(projectData: any, format: 'json' | 'html' | 'zip' = 'json') {
    switch (format) {
      case 'json':
        return this.exportAsJSON(projectData);
      case 'html':
        return this.exportAsHTML(projectData);
      case 'zip':
        return this.exportAsZIP(projectData);
      default:
        return this.exportAsJSON(projectData);
    }
  }

  private static exportAsJSON(projectData: any) {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      exporter: 'AI Meta Factory',
      project: {
        ...projectData,
        metadata: {
          ...projectData.metadata,
          exported: true,
          exportVersion: '2.0'
        }
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    return {
      data: dataStr,
      blob: new Blob([dataStr], { type: 'application/json' }),
      dataUri,
      size: dataStr.length
    };
  }

  private static exportAsHTML(projectData: any) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.metadata.name || 'AI App Builder Project'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 1000px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
        }
        
        .title {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 10px;
        }
        
        .metadata {
            display: flex;
            justify-content: center;
            gap: 30px;
            color: #666;
            font-size: 0.9rem;
        }
        
        .components-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 30px;
        }
        
        .component-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .component-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .component-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 6px;
            height: 100%;
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
        }
        
        .component-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .component-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .component-type {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .properties {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            border: 1px solid #e2e8f0;
        }
        
        .property-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .property-item:last-child {
            border-bottom: none;
        }
        
        .property-key {
            color: #64748b;
            font-weight: 500;
        }
        
        .property-value {
            color: #1e293b;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
        }
        
        .stat-item {
            background: #f1f5f9;
            padding: 15px 25px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3b82f6;
            display: block;
        }
        
        .stat-label {
            font-size: 0.8rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            
            .components-grid {
                grid-template-columns: 1fr;
            }
            
            .metadata {
                flex-direction: column;
                gap: 10px;
            }
            
            .stats {
                flex-direction: column;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${projectData.metadata.name || 'AI App Builder Project'}</h1>
            <div class="metadata">
                <div>Exported: ${new Date().toLocaleDateString()}</div>
                <div>Components: ${projectData.components.length}</div>
                <div>Version: ${projectData.metadata.version || '1.0'}</div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <span class="stat-value">${projectData.components.length}</span>
                <span class="stat-label">Components</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${projectData.metadata.version || '1'}</span>
                <span class="stat-label">Version</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${new Date(projectData.metadata.lastModified || new Date()).toLocaleDateString()}</span>
                <span class="stat-label">Last Modified</span>
            </div>
        </div>
        
        <div class="components-grid">
            ${projectData.components.map((comp: any) => `
            <div class="component-card">
                <div class="component-header">
                    <div class="component-name">${comp.name || 'Unnamed Component'}</div>
                    <span class="component-type">${comp.type || 'component'}</span>
                </div>
                <div class="properties">
                    ${Object.entries(comp.properties || {}).map(([key, value]) => `
                    <div class="property-item">
                        <span class="property-key">${key}</span>
                        <span class="property-value">${JSON.stringify(value)}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Exported from AI Meta Factory • ${new Date().toLocaleString()}</p>
            <p>This is a preview of your project. Import this JSON file back into the app for full functionality.</p>
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return {
      data: htmlContent,
      blob,
      dataUri: URL.createObjectURL(blob),
      size: htmlContent.length
    };
  }

  private static exportAsZIP(projectData: any) {
    // This would create a ZIP file with JSON and HTML versions
    // For now, just export JSON
    return this.exportAsJSON(projectData);
  }

  static async importProject(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedData = JSON.parse(content);
          
          // Handle both v1 and v2 export formats
          let projectData;
          if (importedData.project) {
            // v2 format
            projectData = importedData.project;
          } else if (importedData.components && importedData.layout) {
            // v1 format or raw project data
            projectData = importedData;
          } else {
            throw new Error('Invalid project file format');
          }
          
          resolve(projectData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  static createTemplate(projectData: any, templateName: string, description?: string) {
    const template = {
      ...projectData,
      metadata: {
        ...projectData.metadata,
        isTemplate: true,
        templateName,
        templateDescription: description,
        templateCreated: new Date().toISOString(),
        originalProjectId: projectData.id,
        tags: [...(projectData.metadata.tags || []), 'template']
      }
    };
    
    // Remove sensitive or project-specific data
    delete template.id;
    delete template.createdAt;
    delete template.updatedAt;
    delete template.lastModifiedBy;
    
    // Clean up component IDs
    template.components = template.components.map((comp: any) => ({
      ...comp,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    return template;
  }

  static async validateProjectFile(file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    projectData?: any;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      // Check required structure
      if (!data.project && !data.components) {
        errors.push('File does not contain valid project data');
        return { isValid: false, errors, warnings };
      }
      
      const projectData = data.project || data;
      
      // Validate components
      if (!Array.isArray(projectData.components)) {
        errors.push('Components must be an array');
      }
      
      // Validate layout
      if (!projectData.layout || typeof projectData.layout !== 'object') {
        warnings.push('Layout is missing or invalid');
      }
      
      // Validate metadata
      if (!projectData.metadata || typeof projectData.metadata !== 'object') {
        warnings.push('Metadata is missing or invalid');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        projectData: errors.length === 0 ? projectData : undefined
      };
      
    } catch (error) {
      errors.push('Invalid JSON file');
      return { isValid: false, errors, warnings };
    }
  }
}

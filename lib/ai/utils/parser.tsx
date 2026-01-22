export function parseAIGeneratedCode(code: string): {
  type: string;
  props: Record<string, any>;
  componentCode: string;
} {
  // Extract component name from export statement
  let componentName = 'AIComponent';
  const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/;
  const exportMatch = code.match(exportRegex);
  if (exportMatch) {
    componentName = exportMatch[1];
  }

  // Extract props interface/type
  const props: Record<string, any> = {};
  
  // Look for interface or type definition
  const interfaceRegex = /(?:interface|type)\s+(\w+Props)\s*{([^}]+)}/s;
  const interfaceMatch = code.match(interfaceRegex);
  
  if (interfaceMatch) {
    const interfaceContent = interfaceMatch[2];
    const propLines = interfaceContent.split('\n');
    
    propLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        const propMatch = trimmed.match(/(\w+)(?:\?)?:\s*(.+?)(?:\s*;)?$/);
        if (propMatch) {
          const [_, propName, propType] = propMatch;
          
          // Skip generic props like 'children'
          if (propName === 'children') return;
          
          // Set default values based on type
          if (propType.includes('string')) {
            props[propName] = 'Example text';
          } else if (propType.includes('number')) {
            props[propName] = 42;
          } else if (propType.includes('boolean')) {
            props[propName] = false;
          } else if (propType.includes('ReactNode')) {
            props[propName] = 'Content';
          } else if (propType.includes('CSSProperties')) {
            props[propName] = {};
          } else if (propType.includes('Function') || propType.includes('=>')) {
            props[propName] = () => console.log(`${propName} clicked`);
          } else {
            props[propName] = null;
          }
        }
      }
    });
  }

  // If no props found, set sensible defaults
  if (Object.keys(props).length === 0) {
    props.text = 'AI Generated Component';
    props.variant = 'primary';
    props.size = 'medium';
    props.className = '';
    props.onClick = () => console.log('AI component clicked');
  }

  // Determine component type based on code patterns
  let type = 'ai-component';
  if (code.includes('button') || componentName.toLowerCase().includes('button')) {
    type = 'button';
  } else if (code.includes('input') || componentName.toLowerCase().includes('input')) {
    type = 'input';
  } else if (code.includes('card') || componentName.toLowerCase().includes('card')) {
    type = 'card';
  } else if (code.includes('form') || componentName.toLowerCase().includes('form')) {
    type = 'form';
  }

  return {
    type,
    props: {
      ...props,
      name: componentName,
      code: code,
      isAI: true,
      parsedAt: new Date().toISOString()
    },
    componentCode: code
  };
}

// Helper function for logging
export function logAIParsing(code: string, parsed: any) {
  console.group('🔍 AI Code Parsing');
  console.log('📝 Original Code Length:', code.length);
  console.log('🏷️ Component Name:', parsed.props.name);
  console.log('🎯 Type:', parsed.type);
  console.log('⚙️ Props:', Object.keys(parsed.props).length);
  console.groupEnd();
  return parsed;
}


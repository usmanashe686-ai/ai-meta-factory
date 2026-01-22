export function parseAIGeneratedCode(code: string): any {
  console.log('[Parser] Parsing AI code');
  return {
    type: 'ai-component',
    props: { name: 'AIComponent', code: code, isAI: true }
  };
}

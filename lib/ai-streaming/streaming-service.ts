// AI Streaming Service - Real-time AI responses
import { createOpenAI } from '@ai-sdk/openai'

// Initialize AI clients
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-dev'
})

// AI model configurations
export const AI_MODELS = {
  'gpt-4-turbo': { provider: 'openai', costPerToken: 0.00001 },
  'gpt-3.5-turbo': { provider: 'openai', costPerToken: 0.000001 },
  'deepseek-chat': { provider: 'openai', costPerToken: 0.0000005 },
  'gemini-pro': { provider: 'google', costPerToken: 0.00000075 }
}

// Stream AI response
export async function* streamAIResponse(
  prompt: string,
  model: keyof typeof AI_MODELS = 'gpt-3.5-turbo',
  context?: string[]
) {
  const fullPrompt = context 
    ? `Context:\n${context.join('\n')}\n\nQuestion: ${prompt}\n\nAnswer:`
    : prompt

  console.log(`🚀 Streaming AI response with model: ${model}`)
  
  try {
    // Simulate streaming for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const responses = [
        "I'm thinking about your question...\n\n",
        "This is an interesting challenge!\n\n",
        "Let me break down the solution:\n\n",
        "1. First, we need to understand the requirements\n",
        "2. Then, we can design the architecture\n",
        "3. Finally, implement with best practices\n\n",
        "Here's a detailed implementation:\n\n",
        "```jsx\nimport React from 'react';\n\n",
        "export const SolutionComponent = () => {\n",
        "  return (\n",
        "    <div className='p-4'>\n",
        "      <h1>Solution Implemented!</h1>\n",
        "    </div>\n",
        "  );\n};\n```"
      ]

      for (const chunk of responses) {
        await new Promise(resolve => setTimeout(resolve, 100))
        yield {
          content: chunk,
          model,
          timestamp: new Date().toISOString(),
          tokens: chunk.length / 4 // rough estimate
        }
      }
      return
    }

    // Real OpenAI streaming (commented for now - add your API key)
    /*
    const response = await openai.chat.completions.create({
      model: model === 'deepseek-chat' ? 'gpt-3.5-turbo' : model, // Fallback
      messages: [{ role: 'user', content: fullPrompt }],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    })

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        yield {
          content,
          model,
          timestamp: new Date().toISOString(),
          tokens: 1
        }
      }
    }
    */
    
  } catch (error) {
    console.error('AI Streaming Error:', error)
    yield {
      content: `\n\n⚠️ AI Service Error: ${error.message}\n\nPlease check your API keys or try again later.`,
      model: 'error',
      timestamp: new Date().toISOString(),
      tokens: 0
    }
  }
}

// Calculate cost based on tokens
export function calculateAICost(tokens: number, model: keyof typeof AI_MODELS) {
  const modelConfig = AI_MODELS[model]
  return (tokens * modelConfig.costPerToken).toFixed(6)
}

// Get available models
export function getAvailableModels() {
  return Object.keys(AI_MODELS).map(model => ({
    id: model,
    name: model.replace('-', ' ').toUpperCase(),
    provider: AI_MODELS[model as keyof typeof AI_MODELS].provider,
    description: `${model} - Best for ${model.includes('4') ? 'complex reasoning' : model.includes('deepseek') ? 'cost-effective coding' : 'general purpose'}`
  }))
}

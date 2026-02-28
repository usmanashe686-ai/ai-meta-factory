import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Check API keys exist
    if (!process.env.OPENAI_API_KEY || !(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)) {
      return NextResponse.json({
        success: false,
        error: 'API keys not configured',
        message: 'Add OPENAI_API_KEY and GOOGLE_API_KEY to Vercel Environment Variables',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    console.log(`🚀 REAL AI Pipeline starting for: "${prompt.substring(0, 50)}..."`);

    const steps = [];
    let generatedCode = '';
    let analysis = '';
    let design = '';
    let usedFallback = false;
    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    // STEP 1: ChatGPT Analysis
    try {
      const stepStart = Date.now();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a UI/UX architect. Analyze component requests concisely.'
            },
            {
              role: 'user',
              content: `Analyze this component request: "${prompt}"`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        analysis = data.choices[0]?.message?.content || 'No analysis generated';
        steps.push({
          step: 1,
          model: 'ChatGPT gpt-4o-mini',
          task: 'Analysis & Structure',
          status: '✅ Success',
          time: `${Date.now() - stepStart}ms`,
          output: analysis.substring(0, 200) + '...'
        });
      } else {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
      }
    } catch (error: any) {
      steps.push({
        step: 1,
        model: 'ChatGPT',
        task: 'Analysis & Structure',
        status: '❌ Failed',
        error: error.message.substring(0, 100)
      });
    }

    // STEP 2: ChatGPT Design
    try {
      const stepStart = Date.now();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a UI designer. Provide concise design specifications.'
            },
            {
              role: 'user',
              content: `Based on this analysis:\n${analysis}\n\nDesign specs for: "${prompt}"`
            }
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        design = data.choices[0]?.message?.content || 'No design generated';
        steps.push({
          step: 2,
          model: 'ChatGPT gpt-4o-mini',
          task: 'UI/UX Design',
          status: '✅ Success',
          time: `${Date.now() - stepStart}ms`,
          output: design.substring(0, 200) + '...'
        });
      } else {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
      }
    } catch (error: any) {
      steps.push({
        step: 2,
        model: 'ChatGPT',
        task: 'UI/UX Design',
        status: '❌ Failed',
        error: error.message.substring(0, 100)
      });
    }

    // STEP 3: Gemini Code Generation (🔴 USING REST API ONLY)
    try {
      const stepStart = Date.now();
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate React/TypeScript/Tailwind code for: "${prompt}"\n\nAnalysis: ${analysis}\nDesign: ${design}\n\nReturn ONLY the component code, no explanations. Use modern React with TypeScript and Tailwind CSS.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Clean up the code
        if (generatedCode) {
          generatedCode = generatedCode
            .replace(/```(?:jsx|tsx|javascript|typescript)?\n?/g, '')
            .replace(/```/g, '')
            .trim();
        }
        
        steps.push({
          step: 3,
          model: 'Gemini 1.5 Flash (REST)',
          task: 'Code Generation',
          status: generatedCode ? '✅ Success' : '⚠️ No code generated',
          time: `${Date.now() - stepStart}ms`,
          output: generatedCode ? (generatedCode.substring(0, 150) + '...') : 'Empty response'
        });
      } else {
        // Try gemini-pro as fallback
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate React component for: "${prompt}"`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800
              }
            })
          }
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          generatedCode = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (generatedCode) {
            generatedCode = generatedCode
              .replace(/```(?:jsx|tsx|javascript|typescript)?\n?/g, '')
              .replace(/```/g, '')
              .trim();
          }
          steps.push({
            step: 3,
            model: 'Gemini Pro (REST fallback)',
            task: 'Code Generation',
            status: generatedCode ? '✅ Success' : '⚠️ No code generated',
            time: `${Date.now() - stepStart}ms`,
            output: generatedCode ? (generatedCode.substring(0, 150) + '...') : 'Fallback failed'
          });
        } else {
          throw new Error(`Gemini REST error: ${response.status}`);
        }
      }
    } catch (error: any) {
      steps.push({
        step: 3,
        model: 'Gemini',
        task: 'Code Generation',
        status: '❌ Failed',
        error: error.message.substring(0, 100)
      });
    }

    // STEP 4 & 5: Optional steps (only if code was generated)
    if (generatedCode) {
      // STEP 4: Gemini Error Checking
      try {
        const stepStart = Date.now();
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Review this React code for errors:\n\n${generatedCode.substring(0, 1000)}\n\nProvide a brief error check.`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 300
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const errorCheck = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          steps.push({
            step: 4,
            model: 'Gemini 1.5 Flash (REST)',
            task: 'Error Checking',
            status: '✅ Success',
            time: `${Date.now() - stepStart}ms`,
            output: errorCheck.substring(0, 150) + '...'
          });
        }
      } catch (error) {
        steps.push({
          step: 4,
          model: 'Gemini 1.5 Flash',
          task: 'Error Checking',
          status: '⚠️ Skipped',
          note: 'Non-critical step failed'
        });
      }

      // STEP 5: Gemini Optimization
      try {
        const stepStart = Date.now();
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Optimize this React code:\n\n${generatedCode.substring(0, 800)}\n\nProvide optimization suggestions.`
                }]
              }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 300
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const optimization = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          steps.push({
            step: 5,
            model: 'Gemini 1.5 Flash (REST)',
            task: 'Optimization',
            status: '✅ Success',
            time: `${Date.now() - stepStart}ms`,
            output: optimization.substring(0, 150) + '...'
          });
        }
      } catch (error) {
        steps.push({
          step: 5,
          model: 'Gemini 1.5 Flash',
          task: 'Optimization',
          status: '⚠️ Skipped',
          note: 'Non-critical step failed'
        });
      }
    }

    // Fallback logic
    if (!generatedCode) {
      usedFallback = true;
      generatedCode = `// Component: ${getComponentType(prompt)} (Fallback Mode)
// Generated because Gemini REST API was unavailable

import React from 'react';

interface ${getComponentType(prompt)}Props {
  title?: string;
  className?: string;
}

const ${getComponentType(prompt)}Component: React.FC<${getComponentType(prompt)}Props> = ({ 
  title = "${prompt.substring(0, 40)}", 
  className = "" 
}) => {
  return (
    <div className={\`p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-lg \${className}\`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-gray-300">
        This component was generated in fallback mode.
      </p>
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
          Primary Action
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
          Secondary
        </button>
      </div>
    </div>
  );
};

export default ${getComponentType(prompt)}Component;`;
    }

    // DETERMINE SUCCESS
    const successfulSteps = steps.filter(s => s.status === '✅ Success').length;
    const isSuccess = generatedCode.length > 0 && successfulSteps >= 2;

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess 
        ? (usedFallback ? '⚠️ Generated with fallback (APIs partially failed)' : '🎉 Generated with REAL AI') 
        : '❌ Generation failed',
      prompt,
      component: {
        type: getComponentType(prompt),
        name: `${getComponentType(prompt)} Component`,
        code: generatedCode,
        length: generatedCode.length,
        generatedAt: new Date().toISOString(),
        aiPipeline: 'OpenAI gpt-4o-mini → Gemini REST API',
        usesRealAI: isSuccess && !usedFallback
      },
      steps,
      metrics: {
        totalTime: `${totalTime}ms`,
        successfulSteps,
        totalSteps: steps.length,
        codeGenerated: generatedCode.length > 0,
        usedAPIs: ['OpenAI gpt-4o-mini', 'Gemini REST API'],
        geminiMethod: 'REST API (no SDK)'
      },
      honesty: {
        generatedWithRealAI: isSuccess && !usedFallback,
        usedFallback: usedFallback,
        apiStatus: 'See /api/health for detailed API status',
        note: usedFallback ? 'Component generated with fallback logic (Gemini REST unavailable)' : 'Component generated with live REST APIs'
      }
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error: any) {
    console.error('❌ AI pipeline fatal error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Pipeline failed completely',
      timestamp: new Date().toISOString(),
      help: 'Check /api/health for API status and configure keys in Vercel',
      honesty: {
        generatedWithRealAI: false,
        usedFallback: false,
        failedCompletely: true
      }
    }, { status: 500 });
  }
}

// Helper function
function getComponentType(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('button')) return 'Button';
  if (p.includes('nav')) return 'Navigation';
  if (p.includes('card')) return 'Card';
  if (p.includes('form')) return 'Form';
  if (p.includes('table')) return 'Table';
  if (p.includes('accordion')) return 'Accordion';
  if (p.includes('modal')) return 'Modal';
  if (p.includes('sidebar')) return 'Sidebar';
  if (p.includes('hero')) return 'Hero';
  return 'Component';
}

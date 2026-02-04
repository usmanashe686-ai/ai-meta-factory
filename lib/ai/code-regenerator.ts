import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface RegenerationOptions {
  fileName: string;
  code: string;
  language?: string;
  instructions?: string;
}

export interface RegenerationResult {
  success: boolean;
  code: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
  };
}

/**
 * AI Code Regenerator
 * Safely improves or refactors existing code
 */
export async function regenerateCode(
  options: RegenerationOptions
): Promise<RegenerationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        code: options.code,
        error: "OPENAI_API_KEY not configured",
      };
    }

    const {
      fileName,
      code,
      language = "typescript",
      instructions = "Improve and refactor this code while preserving functionality",
    } = options;

    const prompt = `
You are a senior ${language} engineer.

TASK:
${instructions}

RULES:
- Preserve functionality
- Improve readability
- Add error handling
- Optimize performance
- Use best practices
- Return ONLY code

FILE: ${fileName}

CODE:
${code}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert developer. Always return only valid code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2500,
    });

    const newCode =
      completion.choices[0]?.message?.content?.trim() || code;

    return {
      success: true,
      code: newCode,
      metadata: {
        tokensUsed: completion.usage?.total_tokens,
        model: "gpt-4o-mini",
      },
    };
  } catch (error: any) {
    console.error("Code regeneration failed:", error);

    return {
      success: false,
      code: options.code,
      error: error.message || "Unknown regeneration error",
    };
  }
}

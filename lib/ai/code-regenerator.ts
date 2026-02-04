import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export class AICodeRegenerator {
  static async regenerate(
    fileName: string,
    code: string,
    language: string = "typescript"
  ) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return {
          success: false,
          code,
          error: "Missing OPENAI_API_KEY",
        };
      }

      const prompt = `
You are a senior ${language} developer.

Improve this file while preserving functionality.

Return ONLY code.

FILE: ${fileName}

CODE:
${code}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Return only valid code." },
          { role: "user", content: prompt }
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
        },
      };
    } catch (error: any) {
      return {
        success: false,
        code,
        error: error.message,
      };
    }
  }
}

import { API_BASE_URL } from "@/lib/apiConfig";

/**
 * STREAMING GENERATION (Cursor-style)
 */
export async function generateStream(
  prompt: string,
  onToken: (token: string) => void
) {
  const res = await fetch(`${API_BASE_URL}/ai/generate-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.body) throw new Error("Streaming not supported");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    fullText += chunk;

    onToken(fullText); // send cumulative text (important for diff)
  }

  return fullText;
}

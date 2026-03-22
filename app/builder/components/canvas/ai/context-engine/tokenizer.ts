export const estimateTokens = (text: string): number => {
  // A rough but fast rule of thumb: 1 token ~= 4 characters for code
  return Math.ceil(text.length / 4);
};

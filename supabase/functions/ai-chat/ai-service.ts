
import { callOpenAI, callAnthropic, callGemini } from './ai-providers.ts';

interface UserApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
}

export async function getAIResponse(message: string, eventContext: string, userApiKeys: UserApiKeys) {
  // Determine which API to use based on available keys
  if (userApiKeys?.gemini) {
    return await callGemini(message, eventContext, userApiKeys.gemini);
  } else if (userApiKeys?.openai) {
    return await callOpenAI(message, eventContext, userApiKeys.openai);
  } else if (userApiKeys?.anthropic) {
    return await callAnthropic(message, eventContext, userApiKeys.anthropic);
  } else {
    // Fallback to server-side keys if available
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (geminiKey) {
      return await callGemini(message, eventContext, geminiKey);
    } else if (openaiKey) {
      return await callOpenAI(message, eventContext, openaiKey);
    } else if (anthropicKey) {
      return await callAnthropic(message, eventContext, anthropicKey);
    } else {
      throw new Error('No API keys available. Please provide your own API keys.');
    }
  }
}

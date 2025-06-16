
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
    
    console.log('Server-side API keys availability:', {
      hasGemini: !!geminiKey,
      hasOpenAI: !!openaiKey,
      hasAnthropic: !!anthropicKey
    });
    
    if (geminiKey) {
      console.log('Using server-side Gemini API key');
      return await callGemini(message, eventContext, geminiKey);
    } else if (openaiKey) {
      console.log('Using server-side OpenAI API key');
      return await callOpenAI(message, eventContext, openaiKey);
    } else if (anthropicKey) {
      console.log('Using server-side Anthropic API key');
      return await callAnthropic(message, eventContext, anthropicKey);
    } else {
      console.error('No API keys available - neither user-provided nor server-side');
      throw new Error('No AI API keys are currently available. Please add your own API keys to use the AI chat feature.');
    }
  }
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from './cors.ts';
import { checkRateLimit } from './rate-limiting.ts';
import { getEventContext } from './event-context.ts';
import { getAIResponse } from './ai-service.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    const { message, eventIds, userApiKeys } = await req.json();

    console.log('Received request:', { 
      message: message?.substring(0, 100) + '...', 
      eventIds, 
      hasUserApiKeys: !!(userApiKeys?.openai || userApiKeys?.anthropic || userApiKeys?.gemini) 
    });

    // Check if user has provided their own API keys
    const hasUserApiKeys = !!(userApiKeys?.openai || userApiKeys?.anthropic || userApiKeys?.gemini);
    
    // Check rate limiting if no user API keys
    const rateLimitResult = await checkRateLimit(req, hasUserApiKeys);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: rateLimitResult.error 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get event context if eventIds are provided
    const eventContext = await getEventContext(eventIds);

    // Get AI response
    const response = await getAIResponse(message, eventContext, userApiKeys);

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

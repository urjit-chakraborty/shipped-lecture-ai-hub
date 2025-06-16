
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
    
    // Check rate limiting if no user API keys, passing the message to handle __CHECK_USAGE__
    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit(req, hasUserApiKeys, message);
      if (!rateLimitResult.allowed) {
        console.log('Rate limit exceeded:', rateLimitResult.error);
        return new Response(JSON.stringify({ 
          error: rateLimitResult.error 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (rateLimitError) {
      console.error('Rate limiting check failed:', rateLimitError);
      // Continue without rate limiting if the check fails
      rateLimitResult = { allowed: true, currentCount: 0 };
    }

    // If this is just a usage check, return the current count
    if (message === '__CHECK_USAGE__') {
      return new Response(JSON.stringify({ 
        currentCount: rateLimitResult.currentCount 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get event context if eventIds are provided
    let eventContext = '';
    try {
      eventContext = await getEventContext(eventIds);
    } catch (contextError) {
      console.error('Error fetching event context:', contextError);
      // Continue without event context if fetching fails
      eventContext = '';
    }

    // Get AI response
    const response = await getAIResponse(message, eventContext, userApiKeys || {});

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    // Provide more specific error messages
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;
    
    if (error.message?.includes('No AI API keys')) {
      errorMessage = error.message;
      statusCode = 503; // Service Unavailable
    } else if (error.message?.includes('Daily message limit')) {
      errorMessage = error.message;
      statusCode = 429; // Too Many Requests
    } else if (error.message?.includes('API error')) {
      errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      statusCode = 502; // Bad Gateway
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

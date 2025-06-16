
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, eventIds, userApiKeys } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get event context if eventIds are provided
    let eventContext = '';
    if (eventIds && eventIds.length > 0) {
      const { data: events } = await supabase
        .from('events')
        .select('title, description, transcript, ai_summary')
        .in('id', eventIds);

      if (events && events.length > 0) {
        eventContext = events.map(event => {
          let context = `Event: ${event.title}\n`;
          if (event.description) context += `Description: ${event.description}\n`;
          if (event.transcript) context += `Transcript: ${event.transcript}\n`;
          if (event.ai_summary) context += `AI Summary: ${event.ai_summary}\n`;
          return context;
        }).join('\n---\n');
      }
    }

    // Determine which API to use based on available keys
    let response;
    if (userApiKeys?.openai) {
      response = await callOpenAI(message, eventContext, userApiKeys.openai);
    } else if (userApiKeys?.anthropic) {
      response = await callAnthropic(message, eventContext, userApiKeys.anthropic);
    } else {
      // Fallback to server-side keys if available
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      
      if (openaiKey) {
        response = await callOpenAI(message, eventContext, openaiKey);
      } else if (anthropicKey) {
        response = await callAnthropic(message, eventContext, anthropicKey);
      } else {
        throw new Error('No API keys available. Please provide your own API keys.');
      }
    }

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

async function callOpenAI(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content. Here's the context from selected videos:\n\n${eventContext}\n\nAnswer questions based on this context when relevant, and provide general web development guidance when needed.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content. Here's the context from selected videos:\n\n${eventContext}\n\nAnswer questions based on this context when relevant, and provide general web development guidance when needed.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      system: systemMessage,
      messages: [
        { role: 'user', content: message }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_MESSAGE_LIMIT = 5; // Messages per day for users without API keys
const MAX_TRANSCRIPT_LENGTH = 12000; // Maximum characters to send to AI

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, eventIds, userApiKeys } = await req.json();

    console.log('Received request:', { 
      message: message?.substring(0, 100) + '...', 
      eventIds, 
      hasUserApiKeys: !!(userApiKeys?.openai || userApiKeys?.anthropic) 
    });

    // Initialize Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has provided their own API keys
    const hasUserApiKeys = !!(userApiKeys?.openai || userApiKeys?.anthropic);
    
    // If no user API keys, check rate limiting
    if (!hasUserApiKeys) {
      // Get client IP and handle multiple IPs in forwarded header
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      
      let clientIP = '127.0.0.1';
      if (forwardedFor) {
        // Take the first IP from the comma-separated list
        clientIP = forwardedFor.split(',')[0].trim();
      } else if (realIp) {
        clientIP = realIp.trim();
      }

      console.log('Client IP determined as:', clientIP);

      // Check current usage for this IP
      const { data: usageData, error: usageError } = await supabase
        .from('ai_chat_usage')
        .select('message_count')
        .eq('ip_address', clientIP)
        .eq('last_reset_date', new Date().toISOString().split('T')[0])
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error checking usage:', usageError);
        throw new Error('Failed to check usage limits');
      }

      const currentCount = usageData?.message_count || 0;

      if (currentCount >= DAILY_MESSAGE_LIMIT) {
        return new Response(JSON.stringify({ 
          error: `Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Please add your own API keys to continue using the AI assistant.` 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('ai_chat_usage')
        .upsert({
          ip_address: clientIP,
          message_count: currentCount + 1,
          last_reset_date: new Date().toISOString().split('T')[0],
        }, {
          onConflict: 'ip_address,last_reset_date'
        });

      if (updateError) {
        console.error('Error updating usage:', updateError);
        // Don't fail the request, just log the error
      }
    }

    // Get event context if eventIds are provided
    let eventContext = '';
    if (eventIds && eventIds.length > 0) {
      console.log('Fetching events for IDs:', eventIds);
      
      // First, let's check if these IDs exist at all
      const { data: allEvents, error: allEventsError } = await supabase
        .from('events')
        .select('id, title')
        .limit(10);

      console.log('Sample events in database:', allEvents?.map(e => ({ id: e.id, title: e.title })));

      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, description, transcription, ai_summary')
        .in('id', eventIds);

      console.log('Events query result:', { 
        eventsCount: events?.length || 0, 
        error: eventsError,
        eventTitles: events?.map(e => e.title),
        actualEventIds: events?.map(e => e.id)
      });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Failed to fetch video context');
      }

      if (events && events.length > 0) {
        // Filter out events without transcription
        const eventsWithTranscripts = events.filter(event => event.transcription && event.transcription.trim() !== '');
        console.log('Events with transcripts:', eventsWithTranscripts.length);
        console.log('Transcript lengths:', eventsWithTranscripts.map(e => ({ 
          title: e.title, 
          transcriptLength: e.transcription?.length || 0 
        })));

        if (eventsWithTranscripts.length === 0) {
          console.log('No events have transcripts available');
          eventContext = 'Note: The selected videos do not have transcripts available yet.';
        } else {
          eventContext = eventsWithTranscripts.map(event => {
            let context = `=== VIDEO: ${event.title} ===\n`;
            if (event.description) {
              context += `Description: ${event.description}\n\n`;
            }
            if (event.ai_summary) {
              context += `AI Summary: ${event.ai_summary}\n\n`;
            }
            if (event.transcription) {
              // Chunk large transcripts
              const transcript = event.transcription;
              if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
                console.log(`Chunking transcript for "${event.title}" (${transcript.length} chars -> ${MAX_TRANSCRIPT_LENGTH} chars)`);
                
                // Take the first part and last part to give context of beginning and end
                const chunkSize = Math.floor(MAX_TRANSCRIPT_LENGTH / 2) - 100; // Leave room for separator
                const firstChunk = transcript.substring(0, chunkSize);
                const lastChunk = transcript.substring(transcript.length - chunkSize);
                
                context += `Full Transcript (chunked due to length):\n`;
                context += `[BEGINNING OF VIDEO]\n${firstChunk}\n\n`;
                context += `[... MIDDLE SECTION TRUNCATED FOR LENGTH ...]\n\n`;
                context += `[END OF VIDEO]\n${lastChunk}\n`;
                context += `\n[Note: This is a ${Math.round(transcript.length / 1000)}k character transcript, showing beginning and end sections]`;
              } else {
                context += `Full Transcript:\n${transcript}\n`;
              }
            }
            return context;
          }).join('\n==========================================\n\n');

          console.log('Built context length:', eventContext.length);
        }
      } else {
        console.log('No events found for provided IDs. Requested IDs:', eventIds);
        eventContext = `Note: No videos found for the selected IDs (${eventIds.join(', ')}). Please check if the video IDs are correct.`;
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
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content they've selected. 

IMPORTANT: You have been provided with specific video content below. Use this content to answer questions when relevant. Reference specific details from the transcripts when possible.

VIDEO CONTENT:
${eventContext}

Answer questions based on this video content when relevant, and provide general web development guidance when needed. When referencing the videos, mention specific details from the transcripts to show you're using the actual content.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  console.log('Calling OpenAI with system message length:', systemMessage.length);

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
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(message: string, eventContext: string, apiKey: string) {
  const systemMessage = eventContext
    ? `You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development and the video content they've selected.

IMPORTANT: You have been provided with specific video content below. Use this content to answer questions when relevant. Reference specific details from the transcripts when possible.

VIDEO CONTENT:
${eventContext}

Answer questions based on this video content when relevant, and provide general web development guidance when needed. When referencing the videos, mention specific details from the transcripts to show you're using the actual content.`
    : 'You are an AI assistant for the Lovable Shipped Video Hub. Help users with questions about web development, Lovable platform, and general programming topics.';

  console.log('Calling Anthropic with system message length:', systemMessage.length);

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
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

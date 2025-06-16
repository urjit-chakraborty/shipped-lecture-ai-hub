
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, eventId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let contextInfo = '';
    
    // If eventId is provided, get the specific event's transcript
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('title, description, transcription, event_type')
        .eq('id', eventId)
        .single();
      
      if (event) {
        contextInfo = `
Event: ${event.title}
Type: ${event.event_type}
Description: ${event.description || 'No description available'}
Transcript: ${event.transcription || 'No transcript available yet'}
        `;
      }
    } else {
      // Get recent events with transcripts for general context
      const { data: events } = await supabase
        .from('events')
        .select('title, event_type, transcription')
        .not('transcription', 'is', null)
        .order('event_date', { ascending: false })
        .limit(3);
      
      if (events && events.length > 0) {
        contextInfo = `
Recent Video Content Available:
${events.map(event => `- ${event.title} (${event.event_type})`).join('\n')}
        `;
      }
    }

    const systemPrompt = `You are an AI assistant for the Lovable Shipped Video Hub, a platform for learning modern web development. You help users understand content from our video library, answer questions about web development, and provide guidance on using Lovable.

${contextInfo ? `Current Context:\n${contextInfo}` : ''}

Guidelines:
- Be helpful and knowledgeable about web development, React, TypeScript, and modern development practices
- If referencing video content, be specific about which video or topic you're discussing
- If you don't have transcript information for a specific video, acknowledge this and offer general guidance
- Encourage users to watch the full videos for complete understanding
- Keep responses concise but informative`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

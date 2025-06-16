
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
    const { eventId, youtubeUrl } = await req.json();

    if (!eventId || !youtubeUrl) {
      throw new Error('Event ID and YouTube URL are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Fetch transcript using YouTube Transcript API
    const transcript = await fetchYouTubeTranscript(videoId);
    
    // Generate AI summary
    const summary = await generateAISummary(transcript);

    // Update the event with transcript and summary
    const { error } = await supabase
      .from('events')
      .update({
        transcription: transcript,
        ai_summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transcript and summary generated successfully',
        transcript: transcript.substring(0, 200) + '...',
        summary: summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-transcript-summary function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  try {
    const apiToken = Deno.env.get('YOUTUBE_TRANSCRIPT_API_TOKEN');
    if (!apiToken) {
      throw new Error('YouTube Transcript API token not configured');
    }

    // Using the new YouTube Transcript API
    const response = await fetch('https://www.youtube-transcript.io/api/transcripts', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ids: [videoId],
        countryCode: 'us'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube Transcript API error:', response.status, errorText);
      throw new Error(`YouTube Transcript API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube Transcript API response:', data);
    
    // The API returns an array, get the first element which contains our video data
    if (data && Array.isArray(data) && data.length > 0) {
      const videoData = data.find(item => item.id === videoId) || data[0];
      
      // Check if we have tracks with transcript data
      if (videoData.tracks && videoData.tracks.length > 0) {
        const transcriptTrack = videoData.tracks.find(track => track.language === 'en') || videoData.tracks[0];
        if (transcriptTrack && transcriptTrack.transcript) {
          return transcriptTrack.transcript.map((segment: any) => segment.text).join(' ');
        }
      }
    }
    
    throw new Error('No transcript found in API response');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    // Return a placeholder that indicates manual transcription is needed
    return `[Transcript unavailable for video ${videoId} - Please add manually. Error: ${error.message}]`;
  }
}

async function generateAISummary(transcript: string): Promise<string> {
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      return 'AI summary unavailable - OpenAI API key not configured';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that creates concise, informative summaries of video content. Focus on key topics, main points, and actionable insights. Keep summaries between 100-200 words.'
          },
          {
            role: 'user',
            content: `Please provide a summary of this video transcript:\n\n${transcript.substring(0, 4000)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate AI summary');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'AI summary unavailable - Error occurred during generation';
  }
}

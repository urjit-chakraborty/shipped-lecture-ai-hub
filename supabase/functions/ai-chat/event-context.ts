
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const MAX_TRANSCRIPT_LENGTH = 12000; // Maximum characters to send to AI

export async function getEventContext(eventIds: string[] | undefined) {
  if (!eventIds || eventIds.length === 0) {
    return '';
  }

  // Initialize Supabase client with service role key for database access
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  if (!events || events.length === 0) {
    console.log('No events found for provided IDs. Requested IDs:', eventIds);
    return `Note: No videos found for the selected IDs (${eventIds.join(', ')}). Please check if the video IDs are correct.`;
  }

  // Filter out events without transcription
  const eventsWithTranscripts = events.filter(event => event.transcription && event.transcription.trim() !== '');
  console.log('Events with transcripts:', eventsWithTranscripts.length);
  console.log('Transcript lengths:', eventsWithTranscripts.map(e => ({ 
    title: e.title, 
    transcriptLength: e.transcription?.length || 0 
  })));

  if (eventsWithTranscripts.length === 0) {
    console.log('No events have transcripts available');
    return 'Note: The selected videos do not have transcripts available yet.';
  }

  const eventContext = eventsWithTranscripts.map(event => {
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
  return eventContext;
}


import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEventSelection = (preselectedEventIds: string[] = []) => {
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(preselectedEventIds);

  // Fetch all events for selection
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    console.log('Preselected event IDs:', preselectedEventIds);
    if (preselectedEventIds.length > 0) {
      setSelectedEventIds(preselectedEventIds);
      console.log('Setting selected events:', preselectedEventIds);
    }
  }, [preselectedEventIds]);

  const addEvent = (eventId: string) => {
    if (!selectedEventIds.includes(eventId)) {
      console.log('Adding event:', eventId);
      setSelectedEventIds(prev => {
        const newIds = [...prev, eventId];
        console.log('New selected event IDs:', newIds);
        return newIds;
      });
    }
  };

  const removeEvent = (eventId: string) => {
    console.log('Removing event:', eventId);
    setSelectedEventIds(prev => {
      const newIds = prev.filter(id => id !== eventId);
      console.log('New selected event IDs after removal:', newIds);
      return newIds;
    });
  };

  // Filter events to only show those with transcripts
  const eventsWithTranscripts = events.filter(event => event.transcription);
  const availableEvents = eventsWithTranscripts.filter(event => !selectedEventIds.includes(event.id));
  const selectedEvents = eventsWithTranscripts.filter(event => selectedEventIds.includes(event.id));

  return {
    selectedEventIds,
    events,
    availableEvents,
    selectedEvents,
    addEvent,
    removeEvent,
  };
};

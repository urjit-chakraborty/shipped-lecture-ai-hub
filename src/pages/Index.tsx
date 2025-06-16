
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { EventsGrid } from "@/components/layout/EventsGrid";
import { Footer } from "@/components/layout/Footer";
import { useVideoTracking } from "@/hooks/useVideoTracking";

const Index = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatPreselectedEvents, setAiChatPreselectedEvents] = useState<string[]>([]);
  const { trackAIChatOpen } = useVideoTracking();

  const {
    data: events = [],
    isLoading
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      // Custom sorting to ensure proper chronological order
      const sortedEvents = (data || []).sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        // Kick-off should come first
        if (aTitle.includes('kick-off') || aTitle.includes('kickoff')) return -1;
        if (bTitle.includes('kick-off') || bTitle.includes('kickoff')) return 1;
        
        // Extract week numbers for proper ordering
        const aWeekMatch = aTitle.match(/week\s*(\d+)/);
        const bWeekMatch = bTitle.match(/week\s*(\d+)/);
        
        if (aWeekMatch && bWeekMatch) {
          const aWeek = parseInt(aWeekMatch[1]);
          const bWeek = parseInt(bWeekMatch[1]);
          if (aWeek !== bWeek) return aWeek - bWeek;
        }
        
        // If one has a week number and the other doesn't, prioritize the one with week number
        if (aWeekMatch && !bWeekMatch) return -1;
        if (!aWeekMatch && bWeekMatch) return 1;
        
        // Fall back to date ordering
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      });
      
      return sortedEvents;
    }
  });

  const handleAIChatClick = (event?: any) => {
    if (event) {
      // Pre-select specific event
      setAiChatPreselectedEvents([event.id]);
      trackAIChatOpen(event.id, event.title);
    } else {
      // Open general AI chat
      setAiChatPreselectedEvents([]);
      trackAIChatOpen();
    }
    setIsAIChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header 
        isAIChatOpen={isAIChatOpen}
        setIsAIChatOpen={setIsAIChatOpen}
        aiChatPreselectedEvents={aiChatPreselectedEvents}
        handleAIChatClick={handleAIChatClick}
      />
      
      <Hero />
      
      <EventsGrid 
        events={events}
        isLoading={isLoading}
        handleAIChatClick={handleAIChatClick}
      />
      
      <Footer />
    </div>
  );
};

export default Index;

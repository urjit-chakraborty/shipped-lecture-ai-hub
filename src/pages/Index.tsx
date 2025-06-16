
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { EventsGrid } from "@/components/layout/EventsGrid";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatPreselectedEvents, setAiChatPreselectedEvents] = useState<string[]>([]);

  const {
    data: events = [],
    isLoading
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('events').select('*').order('event_date', {
        ascending: true
      });
      if (error) throw error;
      return data || [];
    }
  });

  const handleAIChatClick = (event?: any) => {
    if (event) {
      // Pre-select specific event
      setAiChatPreselectedEvents([event.id]);
    } else {
      // Open general AI chat
      setAiChatPreselectedEvents([]);
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

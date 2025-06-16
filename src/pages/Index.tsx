import { Play, Calendar, Clock, Users, MessageCircle, Rocket, Zap, Code, Coffee, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, isFuture } from "date-fns";
import { AIChat } from "@/components/AIChat";
import { AISummaryDialog } from "@/components/AISummaryDialog";
import { APIKeyManager } from "@/components/APIKeyManager";
import { useState } from "react";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatPreselectedEvents, setAiChatPreselectedEvents] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Lecture":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Workshop":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Fireside Chat":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "Livestream":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatLocalTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return {
      date: format(date, 'MMM dd'),
      time: format(date, 'h:mm a'),
      year: format(date, 'yyyy')
    };
  };

  const getEventStatus = (event: any) => {
    const eventDate = new Date(event.event_date);
    const hasVideo = !!event.youtube_url;
    const hasTranscript = !!event.transcription; // Check if transcript exists
    if (isPast(eventDate) && hasVideo) {
      return {
        status: 'available',
        text: 'Watch Video'
      };
    } else if (isPast(eventDate) && !hasVideo) {
      return {
        status: 'processing',
        text: 'Video Coming Soon'
      };
    } else {
      return {
        status: 'upcoming',
        text: 'Upcoming Event'
      };
    }
  };

  const handleEventClick = (event: any) => {
    const eventStatus = getEventStatus(event);
    if (eventStatus.status === 'available') {
      window.open(event.youtube_url, '_blank');
    }
  };

  const handlePlayButtonClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (event.youtube_url) {
      window.open(event.youtube_url, '_blank');
    }
  };

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

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Lovable Shipped
                </h1>
                <p className="text-sm text-slate-600">Video Hub</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Videos
              </a>
              <a href="/calendar" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Calendar
              </a>
              <APIKeyManager />
              <Dialog open={isAIChatOpen} onOpenChange={setIsAIChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleAIChatClick()}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>AI Video Assistant</DialogTitle>
                  </DialogHeader>
                  <AIChat preselectedEventIds={aiChatPreselectedEvents} />
                </DialogContent>
              </Dialog>
            </nav>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600">
                    <Menu className="w-6 h-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle>Navigation</DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                        <X className="w-5 h-5" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="px-4 pb-6 space-y-4">
                    <a 
                      href="#" 
                      className="block py-3 text-lg text-slate-600 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Videos
                    </a>
                    <a 
                      href="/calendar" 
                      className="block py-3 text-lg text-slate-600 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Calendar
                    </a>
                    <div className="py-3">
                      <APIKeyManager />
                    </div>
                    <div className="pt-2">
                      <Dialog open={isAIChatOpen} onOpenChange={setIsAIChatOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" 
                            onClick={() => {
                              handleAIChatClick();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            AI Assistant
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>AI Video Assistant</DialogTitle>
                          </DialogHeader>
                          <AIChat preselectedEventIds={aiChatPreselectedEvents} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Rocket className="w-8 h-8 text-blue-600" />
            <Zap className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Ship Faster with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lovable</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Watch how top developers ship web applications at lightning speed. Learn the strategies, 
            tools, and techniques that turn ideas into deployed products in record time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3">
              <Play className="w-5 h-5 mr-2" />
              See Videos
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3">
              <Calendar className="w-5 h-5 mr-2" />
              View Schedule
            </Button>
          </div>
        </div>

        {/* Buy Me a Coffee */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-center">
            <CardContent className="p-6">
              <Coffee className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Support the Creator</h3>
              <p className="text-amber-700 mb-4">Enjoying the content? Buy me a coffee to keep the videos coming!</p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                <a href="https://coff.ee/urjitc" target="_blank" rel="noopener noreferrer">
                  <Coffee className="w-4 h-4 mr-2" />
                  Buy Me a Coffee
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Featured Videos</h3>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <a href="/calendar">View Calendar</a>
          </Button>
        </div>

        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </CardHeader>
              </Card>)}
          </div> : events.length === 0 ? <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events scheduled yet. Check back soon!</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map(event => {
          const eventStatus = getEventStatus(event);
          const localTime = formatLocalTime(event.event_date);
          const thumbnailUrl = event.youtube_url ? getYouTubeThumbnailUrl(event.youtube_url) : null;
          const hasTranscript = !!event.transcription; // Check if transcript exists
          
          return <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-200 overflow-hidden">
                  <div className="relative">
                    {thumbnailUrl ? <div className="w-full h-48 relative overflow-hidden bg-black flex items-center justify-center">
                        <img src={thumbnailUrl} alt={event.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError={e => {
                  // Fallback to gradient background if thumbnail fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }} />
                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 absolute inset-0 items-center justify-center hidden">
                          <Play className="w-16 h-16 text-blue-600/50" />
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        {event.youtube_url && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={e => handlePlayButtonClick(event, e)}>
                            <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors duration-200">
                              <Play className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>}
                      </div> : <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Code className="w-16 h-16 text-blue-600/50" />
                      </div>}
                    <div className="absolute top-3 right-3">
                      <Badge className={getCategoryColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white text-sm font-medium bg-black/50 rounded-full px-3 py-1">
                      <Calendar className="w-4 h-4" />
                      <span>{localTime.date}</span>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description || "Join us for an exciting build session covering the latest in web development."}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{localTime.time}</span>
                      </div>
                      <span>{localTime.year}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {eventStatus.status === 'available' ? <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={() => handleEventClick(event)}>
                          <Play className="w-4 h-4 mr-2" />
                          {eventStatus.text}
                        </Button> : eventStatus.status === 'processing' ? <Button variant="outline" className="w-full" disabled>
                          <Clock className="w-4 h-4 mr-2" />
                          {eventStatus.text}
                        </Button> : <Button variant="outline" className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          {eventStatus.text}
                        </Button>}
                      
                      {/* Only show AI chat button if transcript exists */}
                      {hasTranscript && (
                        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleAIChatClick(event)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Ask AI about this video
                        </Button>
                      )}

                      {/* AI Summary Button - only show if AI summary exists */}
                      {event.ai_summary && <AISummaryDialog eventTitle={event.title} aiSummary={event.ai_summary} eventType={event.event_type} />}
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Ready to Ship Your Next Project?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are shipping faster than ever with Lovable. 
            Learn the tools, techniques, and mindset that accelerate development from idea to deployment.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
            <Zap className="w-5 h-5 mr-2" />
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Lovable Shipped</span>
              </div>
              <p className="text-sm">
                Your go-to resource for shipping web applications faster with modern development techniques and AI-powered assistance.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">All Videos</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Release Calendar</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Getting Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Settings</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Lovable Shipped Video Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};

export default Index;

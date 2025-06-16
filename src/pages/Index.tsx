
import { Play, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, isFuture } from "date-fns";

const Index = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
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
    
    if (isPast(eventDate) && hasVideo) {
      return { status: 'available', text: 'Watch Video' };
    } else if (isPast(eventDate) && !hasVideo) {
      return { status: 'processing', text: 'Video Coming Soon' };
    } else {
      return { status: 'upcoming', text: 'Upcoming Event' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Lovable Shipped
                </h1>
                <p className="text-sm text-slate-600">Video Hub</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Videos
              </a>
              <a href="/calendar" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Calendar
              </a>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Master Modern Web Development
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Access comprehensive video content, interactive AI assistance, and hands-on learning materials 
            to accelerate your development journey with Lovable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3">
              <Play className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3">
              <Calendar className="w-5 h-5 mr-2" />
              View Schedule
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{events.length}+</div>
            <div className="text-slate-600">Video Events</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Live</div>
            <div className="text-slate-600">Streaming</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
            <div className="text-slate-600">Powered Chat</div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Featured Events</h3>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <a href="/calendar">View Calendar</a>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events scheduled yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => {
              const eventStatus = getEventStatus(event);
              const localTime = formatLocalTime(event.event_date);
              
              return (
                <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-200 overflow-hidden">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Play className="w-16 h-16 text-blue-600/50" />
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge className={getCategoryColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-blue-700 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{localTime.date}</span>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description || "Join us for an exciting event covering the latest in web development."}
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
                    
                    {eventStatus.status === 'available' ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => window.open(event.youtube_url, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {eventStatus.text}
                      </Button>
                    ) : eventStatus.status === 'processing' ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        {eventStatus.text}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        {eventStatus.text}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already learning and building amazing applications with our comprehensive video series.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
            Get Started Today
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
                  <Play className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Lovable Shipped</span>
              </div>
              <p className="text-sm">
                Your go-to resource for modern web development education and AI-powered learning assistance.
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
    </div>
  );
};

export default Index;

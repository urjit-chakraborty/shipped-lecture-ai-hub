
import { Play, Calendar, Clock, Code, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { AISummaryDialog } from "@/components/AISummaryDialog";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  youtube_url: string;
  transcription: string;
  ai_summary: string;
}

interface EventsGridProps {
  events: Event[];
  isLoading: boolean;
  handleAIChatClick: (event?: any) => void;
}

export const EventsGrid = ({ events, isLoading, handleAIChatClick }: EventsGridProps) => {
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

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.event_date);
    const hasVideo = !!event.youtube_url;
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

  const handleEventClick = (event: Event) => {
    const eventStatus = getEventStatus(event);
    if (eventStatus.status === 'available') {
      window.open(event.youtube_url, '_blank');
    }
  };

  const handlePlayButtonClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.youtube_url) {
      window.open(event.youtube_url, '_blank');
    }
  };

  return (
    <section className="container mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Featured Videos</h3>
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
          {events.map(event => {
            const eventStatus = getEventStatus(event);
            const localTime = formatLocalTime(event.event_date);
            const thumbnailUrl = event.youtube_url ? getYouTubeThumbnailUrl(event.youtube_url) : null;
            const hasTranscript = !!event.transcription;
            
            return (
              <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-200 overflow-hidden">
                <div className="relative">
                  {thumbnailUrl ? (
                    <div className="w-full h-48 relative overflow-hidden bg-black flex items-center justify-center">
                      <img 
                        src={thumbnailUrl} 
                        alt={event.title} 
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 absolute inset-0 items-center justify-center hidden">
                        <Play className="w-16 h-16 text-blue-600/50" />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                      {event.youtube_url && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={(e) => handlePlayButtonClick(event, e)}>
                          <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors duration-200">
                            <Play className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Code className="w-16 h-16 text-blue-600/50" />
                    </div>
                  )}
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
                    {eventStatus.status === 'available' ? (
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={() => handleEventClick(event)}>
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
                    
                    {hasTranscript && (
                      <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleAIChatClick(event)}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask AI about this video
                      </Button>
                    )}

                    {event.ai_summary && (
                      <AISummaryDialog eventTitle={event.title} aiSummary={event.ai_summary} eventType={event.event_type} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

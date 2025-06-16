
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useState } from "react";
import { Clock, Calendar as CalendarIcon, Play, Users } from "lucide-react";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());

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
        return "bg-green-100 text-green-800 border-green-200";
      case "Workshop":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fireside Chat":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Livestream":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatLocalTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'h:mm a'),
      dayOfWeek: format(date, 'EEEE')
    };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getEventDates = () => {
    return events.map(event => new Date(event.event_date));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    return eachDayOfInterval({ start, end });
  };

  const hasEventsOnDate = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.event_date), date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Event Calendar
                </h1>
                <p className="text-sm text-slate-600">Schedule & Timeline</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Home
              </a>
              <a href="#" className="text-blue-600 font-medium">
                Calendar
              </a>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select Date
                </CardTitle>
                <CardDescription>
                  Click on any date to view scheduled events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onMonthChange={setViewMonth}
                  modifiers={{
                    hasEvents: (date) => hasEventsOnDate(date)
                  }}
                  modifiersClassNames={{
                    hasEvents: "bg-blue-100 text-blue-900 font-semibold"
                  }}
                  className="rounded-md border-0"
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <div className="w-3 h-3 bg-blue-100 rounded border"></div>
                    <span>Days with events</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {selectedDate ? (
                    <>Events for {format(selectedDate, 'MMMM dd, yyyy')}</>
                  ) : (
                    'Select a date to view events'
                  )}
                </CardTitle>
                <CardDescription>
                  All times are displayed in your local timezone
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      {selectedDate ? 'No events scheduled for this date' : 'Select a date to view events'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Choose a highlighted date on the calendar to see scheduled events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => {
                      const localTime = formatLocalTime(event.event_date);
                      const eventDate = new Date(event.event_date);
                      const isPast = eventDate < new Date();
                      const hasVideo = !!event.youtube_url;
                      
                      return (
                        <div key={event.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-slate-900">
                                  {event.title}
                                </h3>
                                <Badge className={getCategoryColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                              </div>
                              <p className="text-slate-600 mb-3">
                                {event.description || "Join us for an exciting event covering the latest in web development."}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{localTime.dayOfWeek}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{localTime.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            {isPast && hasVideo ? (
                              <Button 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                onClick={() => window.open(event.youtube_url, '_blank')}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Watch Video
                              </Button>
                            ) : isPast && !hasVideo ? (
                              <Button variant="outline" disabled>
                                <Clock className="w-4 h-4 mr-2" />
                                Video Coming Soon
                              </Button>
                            ) : (
                              <Button variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Set Reminder
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events Summary */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Events Overview
              </CardTitle>
              <CardDescription>
                Next events in your local timezone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter(event => new Date(event.event_date) > new Date())
                  .slice(0, 6)
                  .map((event) => {
                    const localTime = formatLocalTime(event.event_date);
                    
                    return (
                      <div key={event.id} className="p-4 border border-slate-200 rounded-lg bg-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(event.event_type)} variant="secondary">
                            {event.event_type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">
                          {event.title}
                        </h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{localTime.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{localTime.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

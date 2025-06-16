
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Bot, User, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  preselectedEventIds?: string[];
}

export const AIChat = ({ preselectedEventIds = [] }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(preselectedEventIds);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for user API keys
  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');
  const hasUserApiKeys = !!(userOpenaiKey || userAnthropicKey);

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
    // Set preselected events
    if (preselectedEventIds.length > 0) {
      setSelectedEventIds(preselectedEventIds);
    }
  }, [preselectedEventIds]);

  useEffect(() => {
    // Add welcome message
    const getWelcomeMessage = () => {
      if (!hasUserApiKeys) {
        return `Hello! To use the AI assistant, please add your API keys using the "API Keys" button in the header. This allows you to ask questions about video content and get AI-powered assistance.`;
      }
      
      if (selectedEventIds.length === 1) {
        const selectedEvent = events.find(e => e.id === selectedEventIds[0]);
        return `Hello! I'm here to help you with questions about "${selectedEvent?.title}" and other web development topics. What would you like to know?`;
      } else if (selectedEventIds.length > 1) {
        return `Hello! I'm here to help you with questions about the ${selectedEventIds.length} selected videos and other web development topics. What would you like to know?`;
      } else {
        return `Hello! I'm your AI assistant for the Lovable Shipped Video Hub. I can help answer questions about our video content, web development, and guide you through using Lovable. Select videos below to get context-specific help, or ask me anything!`;
      }
    };

    const welcomeMessage: Message = {
      id: '1',
      content: getWelcomeMessage(),
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [selectedEventIds, events, hasUserApiKeys]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!hasUserApiKeys) {
      toast.error('Please add your API keys in the header to use the AI assistant');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage.content,
          eventIds: selectedEventIds.length > 0 ? selectedEventIds : undefined,
          userApiKeys: {
            openai: userOpenaiKey,
            anthropic: userAnthropicKey,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEvent = (eventId: string) => {
    if (!selectedEventIds.includes(eventId)) {
      setSelectedEventIds(prev => [...prev, eventId]);
    }
  };

  const removeEvent = (eventId: string) => {
    setSelectedEventIds(prev => prev.filter(id => id !== eventId));
  };

  // Filter events to only show those with transcripts
  const eventsWithTranscripts = events.filter(event => event.transcription);
  const availableEvents = eventsWithTranscripts.filter(event => !selectedEventIds.includes(event.id));
  const selectedEvents = eventsWithTranscripts.filter(event => selectedEventIds.includes(event.id));

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          AI Video Assistant
        </CardTitle>
        
        {!hasUserApiKeys && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add your API keys using the "API Keys" button in the header to enable AI assistance.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Video Selection */}
        {hasUserApiKeys && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select onValueChange={addEvent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select videos with transcripts for context (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Selected Events */}
            {selectedEvents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEvents.map((event) => (
                  <Badge key={event.id} variant="secondary" className="flex items-center gap-1">
                    {event.title}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeEvent(event.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 pt-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasUserApiKeys ? "Ask about the video content or web development..." : "Add API keys to enable AI chat..."}
              disabled={isLoading || !hasUserApiKeys}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !hasUserApiKeys}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

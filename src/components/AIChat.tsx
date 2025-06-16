
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Bot, User, Loader2, X, Plus, AlertCircle, AlertTriangle } from 'lucide-react';
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

const DAILY_MESSAGE_LIMIT = 10;

export const AIChat = ({ preselectedEventIds = [] }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(preselectedEventIds);
  const [usageCount, setUsageCount] = useState<number>(0);
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

  // Fetch current usage count if no user API keys
  const { data: currentUsage } = useQuery({
    queryKey: ['ai-chat-usage'],
    queryFn: async () => {
      if (hasUserApiKeys) return null;
      
      const { data, error } = await supabase
        .from('ai_chat_usage')
        .select('message_count')
        .eq('last_reset_date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
        return null;
      }
      
      return data?.message_count || 0;
    },
    enabled: !hasUserApiKeys,
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null) {
      setUsageCount(currentUsage);
    }
  }, [currentUsage]);

  useEffect(() => {
    // Set preselected events and ensure they persist
    console.log('Preselected event IDs:', preselectedEventIds);
    if (preselectedEventIds.length > 0) {
      setSelectedEventIds(preselectedEventIds);
      console.log('Setting selected events:', preselectedEventIds);
    }
  }, [preselectedEventIds]);

  useEffect(() => {
    // Add welcome message
    const getWelcomeMessage = () => {
      if (!hasUserApiKeys) {
        const remainingMessages = DAILY_MESSAGE_LIMIT - usageCount;
        const usageText = remainingMessages > 0 
          ? `You have ${remainingMessages} free messages remaining today.`
          : 'You have reached your daily limit of free messages.';
        
        return `Hello! I'm here to help you with questions about video content and web development topics. ${usageText} To get unlimited access, please add your API keys using the "API Keys" button in the header.`;
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
  }, [selectedEventIds, events, hasUserApiKeys, usageCount]);

  useEffect(() => {
    // Improved scroll to bottom functionality
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollContainer) {
        // Use requestAnimationFrame to ensure the DOM has updated
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
      }
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!hasUserApiKeys && usageCount >= DAILY_MESSAGE_LIMIT) {
      toast.error('Daily message limit reached. Please add your API keys to continue.');
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
      console.log('Sending message with event IDs:', selectedEventIds);
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

      // Update usage count if no user API keys
      if (!hasUserApiKeys) {
        setUsageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.message?.includes('Daily message limit')) {
        toast.error('Daily message limit reached. Please add your API keys to continue.');
        setUsageCount(DAILY_MESSAGE_LIMIT);
      } else {
        toast.error('Failed to send message. Please try again.');
      }
      
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

  const remainingMessages = DAILY_MESSAGE_LIMIT - usageCount;
  const isAtLimit = usageCount >= DAILY_MESSAGE_LIMIT;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        {/* Chat persistence warning */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Note:</strong> Chat conversations are not saved and will be lost when you close or refresh this window.
          </AlertDescription>
        </Alert>
        
        {!hasUserApiKeys && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isAtLimit 
                ? `Daily limit of ${DAILY_MESSAGE_LIMIT} messages reached. Add your API keys using the "API Keys" button in the header for unlimited access.`
                : `Free usage: ${remainingMessages}/${DAILY_MESSAGE_LIMIT} messages remaining today. Add your API keys for unlimited access.`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {/* Video Selection */}
        {(hasUserApiKeys || !isAtLimit) && (
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
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4 min-h-full">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
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
        
        <div className="p-6 pt-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isAtLimit 
                  ? "Add API keys to continue chatting..." 
                  : hasUserApiKeys 
                    ? "Ask about the video content or web development..." 
                    : `Ask me anything (${remainingMessages} messages left)...`
              }
              disabled={isLoading || isAtLimit}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isAtLimit}
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

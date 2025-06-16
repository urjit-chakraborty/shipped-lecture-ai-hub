
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const DAILY_MESSAGE_LIMIT = 10;

export const useAIChat = (selectedEventIds: string[], hasUserApiKeys: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');

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

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    usageCount,
    setUsageCount,
    scrollAreaRef,
    sendMessage,
    handleKeyPress,
    DAILY_MESSAGE_LIMIT,
  };
};

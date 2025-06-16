
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const DAILY_MESSAGE_LIMIT = 5;

export const useAIChat = (selectedEventIds: string[], hasUserApiKeys: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');
  const userGeminiKey = localStorage.getItem('user_gemini_api_key');

  const sendMessage = async (usageCount: number, setUsageCount: (value: number | ((prev: number) => number)) => void, refetchUsage?: () => void) => {
    if (!input.trim() || isLoading) return;

    console.log('useAIChat - Current usage count before sending:', usageCount);

    if (!hasUserApiKeys && usageCount >= DAILY_MESSAGE_LIMIT) {
      toast.error(`Daily message limit of ${DAILY_MESSAGE_LIMIT} reached! Add your own API keys to continue chatting without limits.`, {
        duration: 5000,
        action: {
          label: 'Add API Keys',
          onClick: () => {
            toast.info('Click the "API Keys" button in the header to add your own keys.');
          }
        }
      });
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
      console.log('useAIChat - Sending message with event IDs:', selectedEventIds);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage.content,
          eventIds: selectedEventIds.length > 0 ? selectedEventIds : undefined,
          userApiKeys: {
            openai: userOpenaiKey,
            anthropic: userAnthropicKey,
            gemini: userGeminiKey,
          },
        },
      });

      console.log('useAIChat - Response data:', data);
      console.log('useAIChat - Response error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update usage count after successful message
      if (!hasUserApiKeys) {
        console.log('useAIChat - Incrementing usage count from', usageCount, 'to', usageCount + 1);
        setUsageCount(prev => prev + 1);
        
        // Refetch to get the accurate server count after a delay
        if (refetchUsage) {
          setTimeout(() => {
            console.log('useAIChat - Refetching usage count...');
            refetchUsage();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('Daily message limit') || error.status === 429) {
        // Rate limit hit - update usage count to limit and refetch to sync
        console.log('useAIChat - Rate limit hit, setting usage count to limit');
        setUsageCount(DAILY_MESSAGE_LIMIT);
        if (refetchUsage) {
          refetchUsage();
        }
        toast.error(`Daily message limit of ${DAILY_MESSAGE_LIMIT} reached! Add your own API keys to continue chatting without limits.`, {
          duration: 6000,
          action: {
            label: 'Add API Keys',
            onClick: () => {
              toast.info('Click the "API Keys" button in the header to add your own keys.');
            }
          }
        });
        errorMessage = 'Daily message limit reached. Please add your own API keys to continue using the AI assistant.';
      } else if (error.message?.includes('No AI API keys')) {
        toast.error('AI service is temporarily unavailable. Please add your own API keys.', {
          duration: 5000,
          action: {
            label: 'Add API Keys',
            onClick: () => {
              toast.info('Click the "API Keys" button in the header to add your own keys.');
            }
          }
        });
        errorMessage = 'AI service is currently unavailable. Please add your own API keys to use the AI assistant.';
      } else if (error.message?.includes('API error') || error.message?.includes('temporarily unavailable')) {
        toast.error('AI service is temporarily unavailable. Please try again later.');
        errorMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
      } else {
        toast.error('Failed to send message. Please try again.');
      }
      
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // This will be called from the component with the proper usage tracking
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    scrollAreaRef,
    sendMessage,
    handleKeyPress,
    DAILY_MESSAGE_LIMIT,
  };
};

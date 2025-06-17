
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const DAILY_CREDIT_LIMIT = 5;

export const useAIChat = (selectedEventIds: string[], hasUserApiKeys: boolean, chatId?: string) => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');
  const userGeminiKey = localStorage.getItem('user_gemini_api_key');

  // Load chat history when chatId changes
  useEffect(() => {
    if (!chatId || !user) {
      setMessages([]);
      return;
    }

    const storageKey = `chat_history_${user.id}`;
    const savedChats = localStorage.getItem(storageKey);
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        const currentChat = parsedChats.find((chat: any) => chat.id === chatId);
        
        if (currentChat && currentChat.messages) {
          const chatMessages = currentChat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(chatMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setMessages([]);
      }
    }
  }, [chatId, user]);

  // Save messages to chat history
  const saveMessageToHistory = (message: Message) => {
    if (!chatId || !user) return;

    const storageKey = `chat_history_${user.id}`;
    const savedChats = localStorage.getItem(storageKey);
    
    try {
      const parsedChats = savedChats ? JSON.parse(savedChats) : [];
      const chatIndex = parsedChats.findIndex((chat: any) => chat.id === chatId);
      
      if (chatIndex >= 0) {
        // Update existing chat
        parsedChats[chatIndex].messages.push(message);
        parsedChats[chatIndex].updatedAt = new Date().toISOString();
        
        // Auto-generate title from first user message if title is empty
        if (!parsedChats[chatIndex].title && message.role === 'user') {
          parsedChats[chatIndex].title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        }
      } else {
        // Create new chat
        const newChat = {
          id: chatId,
          title: message.role === 'user' ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : '',
          messages: [message],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        parsedChats.unshift(newChat);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(parsedChats));
    } catch (error) {
      console.error('Failed to save message to history:', error);
    }
  };

  const sendMessage = async (usageCount: number, setUsageCount: (value: number | ((prev: number) => number)) => void, refetchUsage?: () => void, currentChatId?: string) => {
    if (!input.trim() || isLoading) return;

    // Check if user is authenticated
    if (!user || !session?.access_token) {
      console.log('useAIChat - No authentication session available');
      toast.error('Please sign in to use the AI assistant.', {
        duration: 5000,
        action: {
          label: 'Sign In',
          onClick: () => {
            window.location.href = '/auth';
          }
        }
      });
      return;
    }

    console.log('useAIChat - Current usage count before sending:', usageCount);
    console.log('useAIChat - Session token available:', !!session.access_token);

    if (!hasUserApiKeys && usageCount >= DAILY_CREDIT_LIMIT) {
      toast.error(`Daily credit limit of ${DAILY_CREDIT_LIMIT} reached! Add your own API keys to continue chatting without limits.`, {
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
    saveMessageToHistory(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      console.log('useAIChat - Sending message with event IDs:', selectedEventIds);
      console.log('useAIChat - Using session token:', session.access_token.substring(0, 20) + '...');
      
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('useAIChat - Response data:', data);
      console.log('useAIChat - Response error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        
        // Handle authentication errors
        if (error.status === 401 || error.message?.includes('Authentication required')) {
          toast.error('Please sign in to use the AI assistant.', {
            duration: 5000,
            action: {
              label: 'Sign In',
              onClick: () => {
                window.location.href = '/auth';
              }
            }
          });
          return;
        }
        
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
      saveMessageToHistory(assistantMessage);

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
      
      if (error.message?.includes('Daily credit limit') || error.status === 429) {
        // Rate limit hit - update usage count to limit and refetch to sync
        console.log('useAIChat - Credit limit hit, setting usage count to limit');
        setUsageCount(DAILY_CREDIT_LIMIT);
        if (refetchUsage) {
          refetchUsage();
        }
        toast.error(`Daily credit limit of ${DAILY_CREDIT_LIMIT} reached! Add your own API keys to continue chatting without limits.`, {
          duration: 6000,
          action: {
            label: 'Add API Keys',
            onClick: () => {
              toast.info('Click the "API Keys" button in the header to add your own keys.');
            }
          }
        });
        errorMessage = 'Daily credit limit reached. Please add your own API keys to continue using the AI assistant.';
      } else if (error.message?.includes('Authentication required') || error.status === 401) {
        toast.error('Please sign in to use the AI assistant.', {
          duration: 5000,
          action: {
            label: 'Sign In',
            onClick: () => {
              window.location.href = '/auth';
            }
          }
        });
        errorMessage = 'Authentication required. Please sign in to use the AI assistant.';
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
      saveMessageToHistory(errorResponseMessage);
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
    DAILY_MESSAGE_LIMIT: DAILY_CREDIT_LIMIT,
  };
};

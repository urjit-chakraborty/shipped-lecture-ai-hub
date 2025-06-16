
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const useWelcomeMessage = (
  selectedEventIds: string[],
  events: any[],
  hasUserApiKeys: boolean,
  usageCount: number,
  dailyCreditLimit: number,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const { user } = useAuth();
  
  useEffect(() => {
    const getWelcomeMessage = () => {
      // Check if user is authenticated
      if (!user) {
        return `Hello! I'm your AI assistant for the Lovable Shipped Video Hub. To start chatting and get help with our video content and web development topics, please sign in to your account. Each account gets ${dailyCreditLimit} free credits daily.`;
      }
      
      if (!hasUserApiKeys) {
        const remainingCredits = dailyCreditLimit - usageCount;
        const usageText = remainingCredits > 0 
          ? `You have ${remainingCredits} credits remaining today.`
          : 'You have used all your daily credits.';
        
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
  }, [selectedEventIds, events, hasUserApiKeys, usageCount, dailyCreditLimit, setMessages, user]);
};

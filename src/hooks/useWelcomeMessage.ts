
import { useEffect } from 'react';

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
  dailyMessageLimit: number,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  useEffect(() => {
    const getWelcomeMessage = () => {
      if (!hasUserApiKeys) {
        const remainingMessages = dailyMessageLimit - usageCount;
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
  }, [selectedEventIds, events, hasUserApiKeys, usageCount, dailyMessageLimit, setMessages]);
};


import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChatHistory = (selectedChatId: string | null) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    if (!user) return;
    
    const storageKey = `chat_history_${user.id}`;
    const savedChats = localStorage.getItem(storageKey);
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [user]);

  // Update current chat when selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      const chat = chats.find(c => c.id === selectedChatId);
      setCurrentChat(chat || null);
    } else {
      setCurrentChat(null);
    }
  }, [selectedChatId, chats]);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (!user || chats.length === 0) return;
    
    const storageKey = `chat_history_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(chats));
  }, [chats, user]);

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, ...updates, updatedAt: new Date() }
        : chat
    ));
  };

  const addMessageToChat = (chatId: string, message: ChatMessage) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = {
          ...chat,
          messages: [...chat.messages, message],
          updatedAt: new Date()
        };
        
        // Auto-generate title from first user message if title is empty
        if (!chat.title && message.role === 'user') {
          updatedChat.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        }
        
        return updatedChat;
      }
      return chat;
    }));
  };

  return {
    chats,
    currentChat,
    createNewChat,
    deleteChat,
    updateChat,
    addMessageToChat
  };
};

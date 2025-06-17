
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIChatHeader } from './AIChatHeader';
import { AIChatMessages } from './AIChatMessages';
import { AIChatInput } from './AIChatInput';
import { useEventSelection } from '@/hooks/useEventSelection';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAIChat } from '@/hooks/useAIChat';
import { useWelcomeMessage } from '@/hooks/useWelcomeMessage';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

interface AIChatProps {
  preselectedEventIds?: string[];
  chatId?: string;
}

const DAILY_CREDIT_LIMIT = 5;

export const AIChat = ({ preselectedEventIds = [], chatId }: AIChatProps) => {
  const { user } = useAuth();
  
  // Check for user API keys
  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');
  const userGeminiKey = localStorage.getItem('user_gemini_api_key');
  const hasUserApiKeys = !!(userOpenaiKey || userAnthropicKey || userGeminiKey);

  // Event selection hook
  const {
    selectedEventIds,
    availableEvents,
    selectedEvents,
    addEvent,
    removeEvent,
    events,
  } = useEventSelection(preselectedEventIds);

  // Usage tracking hook with user-based checking
  const { usageCount, setUsageCount, refetchUsage } = useUsageTracking(hasUserApiKeys);

  // Chat functionality hook
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    scrollAreaRef,
    sendMessage,
    handleKeyPress,
  } = useAIChat(selectedEventIds, hasUserApiKeys, chatId);

  // Welcome message hook
  useWelcomeMessage(
    selectedEventIds,
    events,
    hasUserApiKeys,
    usageCount,
    DAILY_CREDIT_LIMIT,
    setMessages
  );

  // Scroll to bottom hook
  useScrollToBottom(messages, isLoading, scrollAreaRef);

  const remainingCredits = DAILY_CREDIT_LIMIT - usageCount;
  const isAtLimit = usageCount >= DAILY_CREDIT_LIMIT;

  const handleSendMessage = () => {
    sendMessage(usageCount, setUsageCount, refetchUsage, chatId);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <AIChatHeader
            hasUserApiKeys={hasUserApiKeys}
            isAtLimit={isAtLimit}
            remainingMessages={remainingCredits}
            dailyMessageLimit={DAILY_CREDIT_LIMIT}
            availableEvents={availableEvents}
            selectedEvents={selectedEvents}
            addEvent={addEvent}
            removeEvent={removeEvent}
          />
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-6">
            Please sign in to your account to start chatting with the AI assistant. 
            Each account gets {DAILY_CREDIT_LIMIT} free credits daily.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <AIChatHeader
          hasUserApiKeys={hasUserApiKeys}
          isAtLimit={isAtLimit}
          remainingMessages={remainingCredits}
          dailyMessageLimit={DAILY_CREDIT_LIMIT}
          availableEvents={availableEvents}
          selectedEvents={selectedEvents}
          addEvent={addEvent}
          removeEvent={removeEvent}
        />
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <AIChatMessages
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef}
        />
        
        <AIChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleInputKeyPress}
          isLoading={isLoading}
          isAtLimit={isAtLimit}
          hasUserApiKeys={hasUserApiKeys}
          remainingMessages={remainingCredits}
        />
      </CardContent>
    </Card>
  );
};

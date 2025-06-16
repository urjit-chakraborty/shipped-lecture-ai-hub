import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AIChatHeader } from './AIChatHeader';
import { AIChatMessages } from './AIChatMessages';
import { AIChatInput } from './AIChatInput';
import { useEventSelection } from '@/hooks/useEventSelection';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAIChat } from '@/hooks/useAIChat';
import { useWelcomeMessage } from '@/hooks/useWelcomeMessage';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

interface AIChatProps {
  preselectedEventIds?: string[];
}

const DAILY_MESSAGE_LIMIT = 5;

export const AIChat = ({ preselectedEventIds = [] }: AIChatProps) => {
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

  // Usage tracking hook
  const { usageCount, setUsageCount } = useUsageTracking(hasUserApiKeys);

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
  } = useAIChat(selectedEventIds, hasUserApiKeys);

  // Welcome message hook
  useWelcomeMessage(
    selectedEventIds,
    events,
    hasUserApiKeys,
    usageCount,
    DAILY_MESSAGE_LIMIT,
    setMessages
  );

  // Scroll to bottom hook
  useScrollToBottom(messages, isLoading, scrollAreaRef);

  const remainingMessages = DAILY_MESSAGE_LIMIT - usageCount;
  const isAtLimit = usageCount >= DAILY_MESSAGE_LIMIT;

  const handleSendMessage = () => {
    sendMessage(usageCount, setUsageCount);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <AIChatHeader
          hasUserApiKeys={hasUserApiKeys}
          isAtLimit={isAtLimit}
          remainingMessages={remainingMessages}
          dailyMessageLimit={DAILY_MESSAGE_LIMIT}
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
          remainingMessages={remainingMessages}
        />
      </CardContent>
    </Card>
  );
};

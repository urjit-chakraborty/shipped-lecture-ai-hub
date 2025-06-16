
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface AIChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isAtLimit: boolean;
  hasUserApiKeys: boolean;
  remainingMessages: number;
}

export const AIChatInput = ({
  input,
  setInput,
  onSendMessage,
  onKeyPress,
  isLoading,
  isAtLimit,
  hasUserApiKeys,
  remainingMessages,
}: AIChatInputProps) => {
  return (
    <div className="p-6 pt-4 border-t flex-shrink-0">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
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
          onClick={onSendMessage}
          disabled={!input.trim() || isLoading || isAtLimit}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

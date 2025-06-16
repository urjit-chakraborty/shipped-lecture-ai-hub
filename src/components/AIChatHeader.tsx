
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface AIChatHeaderProps {
  hasUserApiKeys: boolean;
  isAtLimit: boolean;
  remainingMessages: number;
  dailyMessageLimit: number;
  availableEvents: any[];
  selectedEvents: any[];
  addEvent: (eventId: string) => void;
  removeEvent: (eventId: string) => void;
}

export const AIChatHeader = ({
  hasUserApiKeys,
  isAtLimit,
  remainingMessages,
  dailyMessageLimit,
  availableEvents,
  selectedEvents,
  addEvent,
  removeEvent,
}: AIChatHeaderProps) => {
  return (
    <>
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
              ? `Daily limit of ${dailyMessageLimit} messages reached. Add your API keys using the "API Keys" button in the header for unlimited access.`
              : `Free usage: ${remainingMessages}/${dailyMessageLimit} messages remaining today. Add your API keys for unlimited access.`
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
    </>
  );
};

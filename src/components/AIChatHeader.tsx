
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, AlertTriangle, X, Activity } from 'lucide-react';

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
  const usedCredits = dailyMessageLimit - remainingMessages;
  const usagePercentage = (usedCredits / dailyMessageLimit) * 100;

  return (
    <>
      {/* Chat persistence warning */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Note:</strong> Chat conversations are not saved and will be lost when you close or refresh this window.
        </AlertDescription>
      </Alert>
      
      {/* Usage tracking for users without API keys */}
      {!hasUserApiKeys && (
        <div className="space-y-3">
          <Alert className={isAtLimit ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
            <Activity className={`h-4 w-4 ${isAtLimit ? "text-red-600" : "text-blue-600"}`} />
            <AlertDescription className={isAtLimit ? "text-red-800" : "text-blue-800"}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Daily Credits: {usedCredits}/{dailyMessageLimit}
                  </span>
                  <span className="text-sm">
                    {isAtLimit ? 'Limit reached' : `${remainingMessages} remaining`}
                  </span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={`w-full h-2 ${isAtLimit ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
                />
                {isAtLimit ? (
                  <p className="text-sm">
                    Add your API keys using the "API Keys" button in the header for unlimited access.
                  </p>
                ) : (
                  <p className="text-sm">
                    Add your API keys for unlimited access without daily limits.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Unlimited usage indicator for users with API keys */}
      {hasUserApiKeys && (
        <Alert className="border-green-200 bg-green-50">
          <Activity className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Unlimited Usage:</strong> You're using your own API keys for unlimited AI assistant access.
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

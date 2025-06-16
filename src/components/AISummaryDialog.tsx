
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AISummaryDialogProps {
  eventTitle: string;
  aiSummary: string;
  eventType: string;
}

export const AISummaryDialog = ({ eventTitle, aiSummary, eventType }: AISummaryDialogProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Lecture":
        return "bg-green-100 text-green-800";
      case "Workshop":
        return "bg-blue-100 text-blue-800";
      case "Fireside Chat":
        return "bg-purple-100 text-purple-800";
      case "Livestream":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Summary
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{eventTitle}</h3>
            <Badge className={getCategoryColor(eventType)}>
              {eventType}
            </Badge>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {aiSummary}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

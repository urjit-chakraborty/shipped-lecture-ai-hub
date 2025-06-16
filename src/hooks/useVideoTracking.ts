
import { posthog } from '@/lib/posthog';

export const useVideoTracking = () => {
  const trackVideoPlay = (eventId: string, eventTitle: string, eventType: string) => {
    posthog.capture('video_play', {
      event_id: eventId,
      event_title: eventTitle,
      event_type: eventType,
    });
  };

  const trackAIChatOpen = (eventId?: string, eventTitle?: string) => {
    posthog.capture('ai_chat_open', {
      event_id: eventId,
      event_title: eventTitle,
      context: eventId ? 'specific_video' : 'general',
    });
  };

  const trackAIMessage = (messageLength: number, hasContext: boolean) => {
    posthog.capture('ai_message_sent', {
      message_length: messageLength,
      has_video_context: hasContext,
    });
  };

  const trackEventCardClick = (eventId: string, eventTitle: string, eventType: string) => {
    posthog.capture('event_card_click', {
      event_id: eventId,
      event_title: eventTitle,
      event_type: eventType,
    });
  };

  return {
    trackVideoPlay,
    trackAIChatOpen,
    trackAIMessage,
    trackEventCardClick,
  };
};


import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsageTracking = (hasUserApiKeys: boolean) => {
  const [usageCount, setUsageCount] = useState<number>(0);

  // Fetch current usage count if no user API keys
  const { data: currentUsage, refetch } = useQuery({
    queryKey: ['ai-chat-usage'],
    queryFn: async () => {
      if (hasUserApiKeys) return null;
      
      const { data, error } = await supabase
        .from('ai_chat_usage')
        .select('message_count')
        .eq('last_reset_date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
        return null;
      }
      
      return data?.message_count || 0;
    },
    enabled: !hasUserApiKeys,
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null) {
      setUsageCount(currentUsage);
    }
  }, [currentUsage]);

  const updateUsageCount = (newCount: number) => {
    setUsageCount(newCount);
    // Refetch to ensure consistency
    if (!hasUserApiKeys) {
      refetch();
    }
  };

  return { usageCount, setUsageCount: updateUsageCount };
};

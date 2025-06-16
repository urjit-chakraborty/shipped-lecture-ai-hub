
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
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data (renamed from cacheTime)
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null) {
      console.log('Updating usage count from query:', currentUsage);
      setUsageCount(currentUsage);
    }
  }, [currentUsage]);

  const updateUsageCount = async (newCount: number | ((prev: number) => number)) => {
    const actualNewCount = typeof newCount === 'function' ? newCount(usageCount) : newCount;
    console.log('Updating usage count to:', actualNewCount);
    setUsageCount(actualNewCount);
    
    // Force refetch to sync with backend
    if (!hasUserApiKeys) {
      setTimeout(() => {
        refetch();
      }, 100);
    }
  };

  return { usageCount, setUsageCount: updateUsageCount };
};


import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsageTracking = (hasUserApiKeys: boolean) => {
  const [usageCount, setUsageCount] = useState<number>(0);

  // Fetch current usage count based on IP if no user API keys
  const { data: currentUsage, refetch } = useQuery({
    queryKey: ['ai-chat-usage'],
    queryFn: async () => {
      if (hasUserApiKeys) return null;
      
      // Try to get usage count from backend by making a test call
      try {
        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: {
            message: '__CHECK_USAGE__', // Special message to check usage without incrementing
            eventIds: undefined,
            userApiKeys: {},
          },
        });
        
        // If we get a rate limit error, parse the current count
        if (error && error.message?.includes('Daily message limit')) {
          return 5; // At limit
        }
        
        // If successful, we're not at limit, so fetch from database
        const { data: usageData, error: dbError } = await supabase
          .from('ai_chat_usage')
          .select('message_count')
          .eq('last_reset_date', new Date().toISOString().split('T')[0])
          .maybeSingle();
        
        if (dbError) {
          console.error('Error fetching usage from database:', dbError);
          return 0;
        }
        
        return usageData?.message_count || 0;
      } catch (error) {
        console.error('Error checking usage:', error);
        return 0;
      }
    },
    enabled: !hasUserApiKeys,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null) {
      console.log('Updating usage count from IP check:', currentUsage);
      setUsageCount(currentUsage);
    }
  }, [currentUsage]);

  const updateUsageCount = async (newCount: number | ((prev: number) => number)) => {
    const actualNewCount = typeof newCount === 'function' ? newCount(usageCount) : newCount;
    console.log('Updating usage count to:', actualNewCount);
    setUsageCount(actualNewCount);
    
    // Force refetch to sync with backend after a short delay
    if (!hasUserApiKeys) {
      setTimeout(() => {
        refetch();
      }, 500);
    }
  };

  return { usageCount, setUsageCount: updateUsageCount, refetchUsage: refetch };
};

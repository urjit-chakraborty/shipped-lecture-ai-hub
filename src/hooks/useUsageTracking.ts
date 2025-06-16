
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
      
      console.log('useUsageTracking - Fetching usage count...');
      
      // Make a special usage check call that doesn't increment the counter
      try {
        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: {
            message: '__CHECK_USAGE__',
            eventIds: undefined,
            userApiKeys: {},
          },
        });
        
        if (error) {
          console.error('Error checking usage:', error);
          return 0;
        }
        
        console.log('useUsageTracking - Usage check response:', data);
        return data?.currentCount || 0;
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
      console.log('useUsageTracking - Updating usage count from server:', currentUsage);
      setUsageCount(currentUsage);
    }
  }, [currentUsage]);

  const updateUsageCount = async (newCount: number | ((prev: number) => number)) => {
    const actualNewCount = typeof newCount === 'function' ? newCount(usageCount) : newCount;
    console.log('useUsageTracking - Updating local usage count to:', actualNewCount);
    setUsageCount(actualNewCount);
    
    // Force refetch to sync with backend
    if (!hasUserApiKeys) {
      console.log('useUsageTracking - Refetching usage count from server...');
      setTimeout(() => {
        refetch();
      }, 1000); // Give backend time to update
    }
  };

  return { usageCount, setUsageCount: updateUsageCount, refetchUsage: refetch };
};

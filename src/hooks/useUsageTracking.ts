import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsageTracking = (hasUserApiKeys: boolean) => {
  const [usageCount, setUsageCount] = useState<number>(() => {
    // Initialize from localStorage if date matches today
    const storedDate = localStorage.getItem('ai_chat_usage_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (storedDate === today) {
      const storedCount = localStorage.getItem('ai_chat_usage_count');
      return storedCount ? parseInt(storedCount, 10) : 0;
    }
    
    // Reset if date doesn't match
    localStorage.setItem('ai_chat_usage_date', today);
    localStorage.setItem('ai_chat_usage_count', '0');
    return 0;
  });

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
          return usageCount; // Return current count instead of 0 on error
        }
        
        console.log('useUsageTracking - Usage check response:', data);
        return data?.currentCount ?? usageCount; // Fallback to current count if undefined
      } catch (error) {
        console.error('Error checking usage:', error);
        return usageCount; // Return current count instead of 0 on error
      }
    },
    enabled: !hasUserApiKeys,
    refetchOnWindowFocus: true, // Enable refetch on window focus
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null) {
      console.log('useUsageTracking - Updating usage count from server:', currentUsage);
      setUsageCount(currentUsage);
      // Update localStorage
      localStorage.setItem('ai_chat_usage_count', currentUsage.toString());
      localStorage.setItem('ai_chat_usage_date', new Date().toISOString().split('T')[0]);
    }
  }, [currentUsage]);

  const updateUsageCount = async (newCount: number | ((prev: number) => number)) => {
    const actualNewCount = typeof newCount === 'function' ? newCount(usageCount) : newCount;
    console.log('useUsageTracking - Updating local usage count to:', actualNewCount);
    setUsageCount(actualNewCount);
    
    // Update localStorage
    localStorage.setItem('ai_chat_usage_count', actualNewCount.toString());
    localStorage.setItem('ai_chat_usage_date', new Date().toISOString().split('T')[0]);
    
    // Force refetch to sync with backend
    if (!hasUserApiKeys) {
      console.log('useUsageTracking - Refetching usage count from server...');
      // Immediate refetch
      refetch();
      // Follow-up refetch after a delay to ensure consistency
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  };

  return { usageCount, setUsageCount: updateUsageCount, refetchUsage: refetch };
};

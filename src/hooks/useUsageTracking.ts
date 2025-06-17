
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUsageTracking = (hasUserApiKeys: boolean) => {
  const { user, session } = useAuth();
  const [usageCount, setUsageCount] = useState<number>(() => {
    if (!user) return 0;
    
    // Initialize from localStorage if date matches today and user matches
    const storedUserId = localStorage.getItem('ai_chat_user_id');
    const storedDate = localStorage.getItem('ai_chat_usage_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (storedUserId === user.id && storedDate === today) {
      const storedCount = localStorage.getItem('ai_chat_usage_count');
      return storedCount ? parseInt(storedCount, 10) : 0;
    }
    
    // Reset if date doesn't match or user changed
    localStorage.setItem('ai_chat_user_id', user.id);
    localStorage.setItem('ai_chat_usage_date', today);
    localStorage.setItem('ai_chat_usage_count', '0');
    return 0;
  });

  // Fetch current usage count based on user authentication if no user API keys
  const { data: currentUsage, refetch } = useQuery({
    queryKey: ['ai-chat-usage', user?.id, session?.access_token],
    queryFn: async () => {
      if (hasUserApiKeys || !user || !session?.access_token) return null;
      
      console.log('useUsageTracking - Fetching usage count for user:', user.id, 'with session token');
      
      // Make a special usage check call that doesn't increment the counter
      try {
        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: {
            message: '__CHECK_USAGE__',
            eventIds: undefined,
            userApiKeys: {},
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
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
    enabled: !hasUserApiKeys && !!user && !!session?.access_token,
    refetchOnWindowFocus: true, // Enable refetch on window focus
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data
  });

  useEffect(() => {
    if (currentUsage !== undefined && currentUsage !== null && user) {
      console.log('useUsageTracking - Updating usage count from server:', currentUsage);
      setUsageCount(currentUsage);
      // Update localStorage
      localStorage.setItem('ai_chat_usage_count', currentUsage.toString());
      localStorage.setItem('ai_chat_usage_date', new Date().toISOString().split('T')[0]);
      localStorage.setItem('ai_chat_user_id', user.id);
    }
  }, [currentUsage, user]);

  // Reset usage count when user changes
  useEffect(() => {
    if (user) {
      const storedUserId = localStorage.getItem('ai_chat_user_id');
      if (storedUserId !== user.id) {
        console.log('useUsageTracking - User changed, resetting usage count');
        setUsageCount(0);
        localStorage.setItem('ai_chat_user_id', user.id);
        localStorage.setItem('ai_chat_usage_date', new Date().toISOString().split('T')[0]);
        localStorage.setItem('ai_chat_usage_count', '0');
        // Refetch for the new user
        if (!hasUserApiKeys && session?.access_token) {
          refetch();
        }
      }
    } else {
      // User logged out, reset everything
      setUsageCount(0);
      localStorage.removeItem('ai_chat_user_id');
      localStorage.removeItem('ai_chat_usage_date');
      localStorage.removeItem('ai_chat_usage_count');
    }
  }, [user, hasUserApiKeys, refetch, session?.access_token]);

  const updateUsageCount = async (newCount: number | ((prev: number) => number)) => {
    if (!user) return;
    
    const actualNewCount = typeof newCount === 'function' ? newCount(usageCount) : newCount;
    console.log('useUsageTracking - Updating local usage count to:', actualNewCount);
    setUsageCount(actualNewCount);
    
    // Update localStorage
    localStorage.setItem('ai_chat_usage_count', actualNewCount.toString());
    localStorage.setItem('ai_chat_usage_date', new Date().toISOString().split('T')[0]);
    localStorage.setItem('ai_chat_user_id', user.id);
    
    // Force refetch to sync with backend
    if (!hasUserApiKeys && session?.access_token) {
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

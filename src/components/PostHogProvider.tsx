
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { posthog } from '@/lib/posthog';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const location = useLocation();

  useEffect(() => {
    // Capture pageview on route change
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview');
    }
  }, [location]);

  return <>{children}</>;
};

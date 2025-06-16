
import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('YOUR_ACTUAL_API_KEY_HERE', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll manually capture pageviews
    capture_pageleave: true,
  });
}

export { posthog };


import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_q4UxYrDMCq0eD1eR1iwOzAHsk6cVscpGlAdVBy3xTdl', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll manually capture pageviews
    capture_pageleave: true,
  });
}

export { posthog };

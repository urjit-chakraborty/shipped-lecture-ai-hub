
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const DAILY_CREDIT_LIMIT = 5;

export async function checkRateLimit(req: Request, hasUserApiKeys: boolean, message?: string) {
  if (hasUserApiKeys) {
    return { allowed: true, currentCount: 0 };
  }

  // Initialize Supabase client with service role key for database access
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get the authorization header to extract the user
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { 
      allowed: false, 
      currentCount: 0,
      error: 'Authentication required. Please sign in to use the AI assistant.',
      requiresAuth: true
    };
  }

  // Create a client with the user's token to get the authenticated user
  const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: {
      headers: {
        authorization: authHeader,
      },
    },
  });

  const { data: { user }, error: userError } = await userSupabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting user:', userError);
    return { 
      allowed: false, 
      currentCount: 0,
      error: 'Authentication required. Please sign in to use the AI assistant.',
      requiresAuth: true
    };
  }

  console.log('User authenticated:', user.id);

  // Get current date in UTC
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // For usage check, just return the current count without incrementing
  if (message === '__CHECK_USAGE__') {
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits_used')
      .eq('user_id', user.id)
      .eq('last_reset_date', today)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      console.error('Error checking credits:', creditsError);
      throw new Error('Failed to check usage limits');
    }

    const currentCount = creditsData?.credits_used || 0;
    console.log('Usage check - Current credits used for user:', user.id, '=', currentCount);
    return { allowed: currentCount < DAILY_CREDIT_LIMIT, currentCount };
  }

  // For actual messages, use the atomic increment function
  const { data: creditsData, error: creditsError } = await supabase.rpc('increment_user_credits', {
    p_user_id: user.id,
    p_date: today,
    p_limit: DAILY_CREDIT_LIMIT
  });

  if (creditsError) {
    console.error('Error updating credits:', creditsError);
    throw new Error('Failed to check usage limits');
  }

  const currentCount = creditsData?.credits_used || 0;
  console.log('Message request - Current credits used for user:', user.id, '=', currentCount);

  if (currentCount > DAILY_CREDIT_LIMIT) {
    console.log('Credit limit exceeded for user:', user.id, 'Credits used:', currentCount);
    return { 
      allowed: false, 
      currentCount,
      error: `Daily credit limit of ${DAILY_CREDIT_LIMIT} reached. Please add your own API keys to continue using the AI assistant.`
    };
  }

  return { allowed: true, currentCount };
}

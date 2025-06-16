import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const DAILY_MESSAGE_LIMIT = 5;

export async function checkRateLimit(req: Request, hasUserApiKeys: boolean, message?: string) {
  if (hasUserApiKeys) {
    return { allowed: true, currentCount: 0 };
  }

  // Initialize Supabase client with service role key for database access
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get client IP with improved detection
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const trueClientIp = req.headers.get('true-client-ip');
  
  let clientIP = '127.0.0.1';
  if (cfConnectingIp) {
    clientIP = cfConnectingIp.trim();
  } else if (trueClientIp) {
    clientIP = trueClientIp.trim();
  } else if (forwardedFor) {
    // Take the first IP from the comma-separated list
    clientIP = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIP = realIp.trim();
  }

  console.log('Client IP determined as:', clientIP);

  // Get current date in UTC
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // For usage check, just return the current count without incrementing
  if (message === '__CHECK_USAGE__') {
    const { data: usageData, error: usageError } = await supabase
      .from('ai_chat_usage')
      .select('message_count')
      .eq('ip_address', clientIP)
      .eq('last_reset_date', today)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error checking usage:', usageError);
      throw new Error('Failed to check usage limits');
    }

    const currentCount = usageData?.message_count || 0;
    console.log('Usage check - Current count for IP:', clientIP, '=', currentCount);
    return { allowed: currentCount < DAILY_MESSAGE_LIMIT, currentCount };
  }

  // For actual messages, use the atomic increment function
  const { data: usageData, error: usageError } = await supabase.rpc('increment_message_count', {
    p_ip_address: clientIP,
    p_date: today,
    p_limit: DAILY_MESSAGE_LIMIT
  });

  if (usageError) {
    console.error('Error updating usage:', usageError);
    throw new Error('Failed to check usage limits');
  }

  const currentCount = usageData?.message_count || 0;
  console.log('Message request - Current count for IP:', clientIP, '=', currentCount);

  if (currentCount > DAILY_MESSAGE_LIMIT) {
    console.log('Rate limit exceeded for IP:', clientIP, 'Count:', currentCount);
    return { 
      allowed: false, 
      currentCount,
      error: `Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Please add your own API keys to continue using the AI assistant.`
    };
  }

  return { allowed: true, currentCount };
}

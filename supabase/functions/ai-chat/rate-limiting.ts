
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

  // Get client IP and handle multiple IPs in forwarded header
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  let clientIP = '127.0.0.1';
  if (forwardedFor) {
    // Take the first IP from the comma-separated list
    clientIP = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIP = realIp.trim();
  }

  console.log('Client IP determined as:', clientIP);

  // Check current usage for this IP
  const { data: usageData, error: usageError } = await supabase
    .from('ai_chat_usage')
    .select('message_count')
    .eq('ip_address', clientIP)
    .eq('last_reset_date', new Date().toISOString().split('T')[0])
    .single();

  if (usageError && usageError.code !== 'PGRST116') {
    console.error('Error checking usage:', usageError);
    throw new Error('Failed to check usage limits');
  }

  const currentCount = usageData?.message_count || 0;
  console.log('Current usage count for IP:', clientIP, '=', currentCount);

  // If this is just a usage check, return current count without incrementing
  if (message === '__CHECK_USAGE__') {
    console.log('Usage check request - returning current count:', currentCount);
    return { allowed: currentCount < DAILY_MESSAGE_LIMIT, currentCount };
  }

  if (currentCount >= DAILY_MESSAGE_LIMIT) {
    console.log('Rate limit exceeded for IP:', clientIP, 'Count:', currentCount);
    return { 
      allowed: false, 
      currentCount,
      error: `Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Please add your own API keys to continue using the AI assistant.`
    };
  }

  // Increment usage count only for actual messages
  const newCount = currentCount + 1;
  console.log('Incrementing usage count from', currentCount, 'to', newCount);
  
  const { error: updateError } = await supabase
    .from('ai_chat_usage')
    .upsert({
      ip_address: clientIP,
      message_count: newCount,
      last_reset_date: new Date().toISOString().split('T')[0],
    }, {
      onConflict: 'ip_address,last_reset_date'
    });

  if (updateError) {
    console.error('Error updating usage:', updateError);
    // Don't fail the request, just log the error
  }

  return { allowed: true, currentCount: newCount };
}

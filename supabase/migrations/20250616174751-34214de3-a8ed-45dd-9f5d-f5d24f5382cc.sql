-- Create a function to atomically increment message count
CREATE OR REPLACE FUNCTION increment_message_count(
  p_ip_address INET,
  p_date DATE,
  p_limit INTEGER
) RETURNS TABLE (message_count INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert or update the count atomically
  INSERT INTO ai_chat_usage (ip_address, message_count, last_reset_date)
  VALUES (p_ip_address, 1, p_date)
  ON CONFLICT (ip_address, last_reset_date)
  DO UPDATE SET 
    message_count = LEAST(ai_chat_usage.message_count + 1, p_limit + 1),
    updated_at = NOW()
  RETURNING message_count INTO v_count;

  -- Return the current count
  RETURN QUERY SELECT v_count;
END;
$$; 
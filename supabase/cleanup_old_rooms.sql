-- Run this in the Supabase SQL editor.
-- Deletes game_rooms older than 10 minutes that are still 'waiting' or 'ready'
-- (abandoned sessions that were never cleaned up).

CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM game_rooms
  WHERE status IN ('waiting', 'ready')
    AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$;

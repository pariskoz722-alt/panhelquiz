-- Run this in the Supabase SQL editor.
-- SECURITY DEFINER lets the function bypass RLS so player2 can update
-- a room they don't own. auth.uid() is still used to verify the caller.

CREATE OR REPLACE FUNCTION accept_friend_invite(p_room_id uuid)
RETURNS SETOF game_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  UPDATE game_rooms
  SET player2_id = v_user_id,
      status     = 'ready'
  WHERE id           = p_room_id
    AND status       = 'waiting'
    AND player1_id  != v_user_id   -- can't accept your own invite
  RETURNING *;
END;
$$;

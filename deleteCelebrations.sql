CREATE OR REPLACE FUNCTION delete_celebration(
  p_user_id TEXT,
  p_event_type event_type,
  p_day INT,
  p_month INT
) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM celebrations
    WHERE user_id = p_user_id
      AND event_type = p_event_type
      AND EXTRACT(DAY FROM event_date::timestamp) = p_day
      AND EXTRACT(MONTH FROM event_date::timestamp) = p_month
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
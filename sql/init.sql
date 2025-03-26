CREATE TYPE event_type AS ENUM ('birthday', 'work-anniversary', 'custom');
CREATE TYPE recurrence AS ENUM ('yearly', 'monthly', 'daily', 'once');

CREATE TABLE celebrations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type event_type NOT NULL,
    recurrence recurrence NOT NULL DEFAULT 'once',
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, event_type, event_date)
);

CREATE TABLE channel_subscriptions {
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (channel_id)
}

-- Delete a celebration
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
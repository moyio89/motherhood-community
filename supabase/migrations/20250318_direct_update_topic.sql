-- Create a function to directly update a topic
CREATE OR REPLACE FUNCTION direct_update_topic(
  topic_id INT,
  new_title TEXT,
  new_content TEXT,
  new_category TEXT,
  new_sorting TEXT,
  new_is_hot BOOLEAN,
  new_is_sticky BOOLEAN
) RETURNS VOID AS $$
BEGIN
  UPDATE topics
  SET 
    title = new_title,
    content = new_content,
    category = new_category,
    sorting = new_sorting,
    is_hot = new_is_hot,
    is_sticky = new_is_sticky,
    updated_at = NOW()
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

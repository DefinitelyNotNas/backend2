INSERT INTO communities (name, description, pco_group_id) VALUES
  ('Young Adults','Midweek community','PCO_GROUP_001'),
  ('Prayer Team','Intercession and prayer support','PCO_GROUP_002')
ON CONFLICT (pco_group_id) DO NOTHING;

INSERT INTO tags (name) VALUES ('faith'),('grace'),('discipleship')
ON CONFLICT (name) DO NOTHING;

INSERT INTO preachings (title,youtube_url,youtube_video_id,description,preacher_name,recorded_at)
VALUES ('Run With Endurance','https://youtu.be/dQw4w9WgXcQ','dQw4w9WgXcQ','Encouragement to persevere','Guest Speaker','2025-01-05T16:00:00Z')
ON CONFLICT (youtube_video_id) DO NOTHING;

INSERT INTO preaching_topics (preaching_id, tag_id)
SELECT p.id, t.id
FROM preachings p
JOIN tags t ON t.name IN ('faith','discipleship')
WHERE p.youtube_video_id='dQw4w9WgXcQ'
ON CONFLICT DO NOTHING;

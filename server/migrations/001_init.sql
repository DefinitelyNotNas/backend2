CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  pco_person_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pco_group_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_memberships (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, community_id)
);

CREATE TABLE IF NOT EXISTS preachings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL UNIQUE,
  description TEXT,
  preacher_name TEXT,
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS preaching_topics (
  preaching_id INTEGER NOT NULL REFERENCES preachings(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (preaching_id, tag_id)
);

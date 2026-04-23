-- =====================================================================
-- 001_init.sql — Mathat Kula community news platform
-- Idempotent schema for PostgreSQL >= 14.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT      NOT NULL UNIQUE,
  password_hash     TEXT        NOT NULL,
  display_name      TEXT        NOT NULL,
  tamil_name        TEXT,
  avatar_url        TEXT,
  role              TEXT        NOT NULL DEFAULT 'reader'
                                CHECK (role IN ('reader','editor','admin')),
  tier              TEXT        NOT NULL DEFAULT 'free'
                                CHECK (tier IN ('free','paid','life')),
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- ---------------------------------------------------------------------
-- SESSIONS (refresh tokens — access tokens are stateless JWTs)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  user_agent  TEXT,
  ip          TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ---------------------------------------------------------------------
-- ARTICLES (published, scheduled, and long-form drafts)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        NOT NULL UNIQUE,

  title_tamil        TEXT,
  title_english      TEXT        NOT NULL,
  summary            TEXT        NOT NULL DEFAULT '',
  content            TEXT        NOT NULL DEFAULT '',

  category           TEXT        NOT NULL
                                 CHECK (category IN ('events','culture','announcements','learning','astrology')),
  language           TEXT        NOT NULL DEFAULT 'bilingual'
                                 CHECK (language IN ('tamil','english','bilingual')),
  priority           TEXT        NOT NULL DEFAULT 'normal'
                                 CHECK (priority IN ('normal','featured','breaking')),

  image_url          TEXT,
  meta_description   TEXT,

  -- Monetization
  pricing_tier       TEXT        NOT NULL DEFAULT 'free'
                                 CHECK (pricing_tier IN ('free','paid')),
  price              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency           TEXT        NOT NULL DEFAULT 'INR'
                                 CHECK (currency IN ('INR','USD','SGD','MYR')),
  access_tier        TEXT        NOT NULL DEFAULT 'all-members'
                                 CHECK (access_tier IN ('all-members','paid-members','life-members')),
  preview_percent    INTEGER     NOT NULL DEFAULT 100
                                 CHECK (preview_percent BETWEEN 0 AND 100),
  support_note       TEXT,

  -- Flags
  pinned             BOOLEAN     NOT NULL DEFAULT false,
  featured           BOOLEAN     NOT NULL DEFAULT false,
  allow_comments     BOOLEAN     NOT NULL DEFAULT true,
  notify_subscribers BOOLEAN     NOT NULL DEFAULT true,
  email_digest       BOOLEAN     NOT NULL DEFAULT false,

  -- Lifecycle
  status             TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','scheduled','published','archived')),
  scheduled_for      TIMESTAMPTZ,
  published_at       TIMESTAMPTZ,
  read_minutes       INTEGER     NOT NULL DEFAULT 3 CHECK (read_minutes >= 0),
  view_count         INTEGER     NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  like_count         INTEGER     NOT NULL DEFAULT 0 CHECK (like_count >= 0),

  author_id          UUID        REFERENCES users(id) ON DELETE SET NULL,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A scheduled article must have a future timestamp.
  CONSTRAINT scheduled_requires_timestamp
    CHECK (status <> 'scheduled' OR scheduled_for IS NOT NULL),
  -- A published article must have published_at set.
  CONSTRAINT published_requires_timestamp
    CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_articles_status        ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category      ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at  ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author        ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_for ON articles(scheduled_for);

-- Full-text search across Tamil + English titles and summary.
CREATE INDEX IF NOT EXISTS idx_articles_search
  ON articles USING GIN (
    to_tsvector(
      'simple',
      coalesce(title_english,'') || ' ' ||
      coalesce(title_tamil,'')   || ' ' ||
      coalesce(summary,'')
    )
  );

-- ---------------------------------------------------------------------
-- ARTICLE TAGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  PRIMARY KEY (article_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag);

-- ---------------------------------------------------------------------
-- DRAFTS (autosave snapshots — either a fresh composition or an edit
-- session attached to an existing article). One active draft per
-- (user, article) pair.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drafts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id     UUID        REFERENCES articles(id) ON DELETE SET NULL,
  payload        JSONB       NOT NULL,
  title_preview  TEXT,
  category       TEXT,
  last_saved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drafts_user          ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_last_saved_at ON drafts(last_saved_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_drafts_user_article
  ON drafts(user_id, article_id) WHERE article_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- BOOKMARKS (reader "save for later")
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created
  ON bookmarks(user_id, created_at DESC);

-- ---------------------------------------------------------------------
-- READING PROGRESS (resume-where-you-left-off)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_progress (
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  percent    SMALLINT    NOT NULL CHECK (percent BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- ---------------------------------------------------------------------
-- ARTICLE PURCHASES (paywall access)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_purchases (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  currency    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON article_purchases(user_id);

-- ---------------------------------------------------------------------
-- Triggers to keep updated_at fresh on UPDATE.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS articles_set_updated_at ON articles;
CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Schema migration bookkeeping
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  name       TEXT        PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

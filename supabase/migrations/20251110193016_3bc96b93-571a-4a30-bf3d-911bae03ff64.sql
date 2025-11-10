-- Add index on published_at for scheduled post queries
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at) WHERE status = 'scheduled';

-- Add index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE public.listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('product','service')),
  entity_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_media_entity ON public.listing_media(entity_type, entity_id);

ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_media public read"
  ON public.listing_media FOR SELECT
  USING (true);

CREATE POLICY "admins manage listing_media"
  ON public.listing_media FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  author TEXT NOT NULL DEFAULT 'Sk8 Pro Center',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blogs public read"
  ON public.blogs FOR SELECT
  USING (published = true);

CREATE POLICY "admins read all blogs"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins manage blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER blogs_set_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed dummy data
INSERT INTO public.blogs (title, slug, excerpt, content, cover_url, author) VALUES
('Beginner''s Guide to Roller Skating in Nairobi', 'beginners-guide-nairobi',
 'Just got your first pair of skates? Here''s where to go, what to wear, and how to fall safely.',
 E'Welcome to the Nairobi skate scene! Whether you''re rolling on quads or inlines, the first few sessions are all about confidence.\n\n## Where to skate\nKaruraTrails, Two Rivers parking after hours, and our indoor floor at Sk8 Pro Center are all great starting points.\n\n## Gear up\nAlways wear a helmet, wrist guards, and knee pads. We rent full sets at the shop.\n\n## Fall like a pro\nBend your knees, fall forward onto your pads — never backwards.\n\nSee you at the next group session!',
 'https://images.unsplash.com/photo-1564982752979-3f7693f48812?w=1200&q=80', 'Coach Mwangi'),
('Top 5 Tricks Every Skater Should Master', 'top-5-tricks',
 'From the basic T-stop to your first crossover — these five fundamentals unlock everything else.',
 E'Tricks aren''t just for show — they build the muscle memory that keeps you safe.\n\n1. **T-Stop** — your most reliable brake.\n2. **Crossovers** — corner like you mean it.\n3. **Backwards skating** — opens up dance and hockey.\n4. **One-foot glide** — balance is everything.\n5. **Mohawk turn** — the gateway to artistic skating.\n\nDrill each one for 10 minutes a session and you''ll see results in two weeks.',
 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=1200&q=80', 'Coach Atieno'),
('Maintaining Your Skates: A Quarterly Checklist', 'skate-maintenance-checklist',
 'Bearings grinding? Wheels uneven? Run through this 10-minute checklist every three months.',
 E'Your skates work hard. Treat them right and they''ll last years.\n\n## The checklist\n- Rotate wheels (inside ↔ outside)\n- Clean and re-lube bearings\n- Tighten truck bolts\n- Inspect boot stitching\n- Replace toe stops if worn past the line\n\nDrop by the shop on a Saturday — we''ll do it for free with any wheel purchase.',
 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=80', 'Sk8 Pro Center');
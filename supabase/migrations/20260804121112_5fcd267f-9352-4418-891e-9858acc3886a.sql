
-- 1. Product overrides
CREATE TABLE public.product_overrides (
  slug TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  sku TEXT,
  description TEXT,
  image TEXT,
  mrp NUMERIC,
  price NUMERIC,
  discount_type TEXT NOT NULL DEFAULT 'none',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  availability TEXT NOT NULL DEFAULT 'in',
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  labels TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT ALL ON public.product_overrides TO service_role;
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_overrides public read" ON public.product_overrides FOR SELECT USING (true);
CREATE POLICY "product_overrides staff manage" ON public.product_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- 2. Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'flash',
  discount_type TEXT NOT NULL DEFAULT 'percent',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  product_slugs TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  min_items INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers public read" ON public.offers FOR SELECT USING (true);
CREATE POLICY "offers staff manage" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- 3. Upsell settings (singleton)
CREATE TABLE public.upsell_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  enabled BOOLEAN NOT NULL DEFAULT true,
  section_title TEXT NOT NULL DEFAULT 'Complete your order',
  layout TEXT NOT NULL DEFAULT 'carousel',
  max_items INTEGER NOT NULL DEFAULT 6,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.upsell_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upsell_settings TO authenticated;
GRANT ALL ON public.upsell_settings TO service_role;
ALTER TABLE public.upsell_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upsell_settings public read" ON public.upsell_settings FOR SELECT USING (true);
CREATE POLICY "upsell_settings staff manage" ON public.upsell_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
INSERT INTO public.upsell_settings (id) VALUES (true);

-- 4. Upsell items
CREATE TABLE public.upsell_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  promo_price NUMERIC,
  discount_type TEXT NOT NULL DEFAULT 'none',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.upsell_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upsell_items TO authenticated;
GRANT ALL ON public.upsell_items TO service_role;
ALTER TABLE public.upsell_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upsell_items public read" ON public.upsell_items FOR SELECT USING (true);
CREATE POLICY "upsell_items staff manage" ON public.upsell_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- 5. Recommendation rules
CREATE TABLE public.recommendation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_category TEXT NOT NULL,
  recommend_slugs TEXT[] NOT NULL DEFAULT '{}',
  recommend_categories TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recommendation_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_rules TO authenticated;
GRANT ALL ON public.recommendation_rules TO service_role;
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendation_rules public read" ON public.recommendation_rules FOR SELECT USING (true);
CREATE POLICY "recommendation_rules staff manage" ON public.recommendation_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

INSERT INTO public.recommendation_rules (trigger_category, recommend_categories, priority) VALUES
  ('cakes', ARRAY['cookies','desserts','ice-cream'], 10),
  ('seasonal-special', ARRAY['cookies','desserts','ice-cream'], 9),
  ('cookies', ARRAY['desserts','ice-cream'], 8),
  ('ice-cream', ARRAY['cookies','desserts'], 7);

-- 6. Founder profile (singleton)
CREATE TABLE public.founder_profile (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  name TEXT NOT NULL DEFAULT 'Charan L. S.',
  designation TEXT NOT NULL DEFAULT 'Founder & CEO',
  company TEXT NOT NULL DEFAULT 'C & It''s Magic',
  founded TEXT NOT NULL DEFAULT '2026',
  location TEXT NOT NULL DEFAULT 'Bengaluru, Karnataka, India',
  photo_url TEXT,
  bio TEXT NOT NULL DEFAULT '',
  mission TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT,
  instagram_url TEXT,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.founder_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_profile TO authenticated;
GRANT ALL ON public.founder_profile TO service_role;
ALTER TABLE public.founder_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder public read" ON public.founder_profile FOR SELECT USING (true);
CREATE POLICY "founder staff manage" ON public.founder_profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

INSERT INTO public.founder_profile (id, bio, mission, vision, timeline) VALUES (
  true,
  'C & It''s Magic was founded by Charan L. S. with a vision to create premium handcrafted cakes, desserts, cookies, brownies, and café-style experiences using the finest ingredients and exceptional craftsmanship. Every product is created with a focus on quality, innovation, and customer satisfaction. The mission is to build one of India''s most trusted premium bakery brands and expand globally while delivering memorable experiences through every creation.',
  'To create premium handcrafted desserts that combine quality, creativity, and unforgettable taste.',
  'To become a globally recognized premium bakery and café brand known for innovation, craftsmanship, and customer delight.',
  '[{"year":"2026","title":"C & It''s Magic is founded","text":"A luxury cloud kitchen born in Lakkur, Malur."},{"year":"2026","title":"Signature cake collection","text":"Handcrafted cakes, cookies and desserts launch across Bengaluru rural."},{"year":"Next","title":"Café & global expansion","text":"Building towards a flagship café experience and a national footprint."}]'::jsonb
);

CREATE TRIGGER product_overrides_touch BEFORE UPDATE ON public.product_overrides FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER offers_touch BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER upsell_items_touch BEFORE UPDATE ON public.upsell_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER upsell_settings_touch BEFORE UPDATE ON public.upsell_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER founder_profile_touch BEFORE UPDATE ON public.founder_profile FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

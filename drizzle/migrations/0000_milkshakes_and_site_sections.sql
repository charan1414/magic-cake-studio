CREATE TABLE public.milkshakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  ingredients text NOT NULL DEFAULT '',
  allergens text NOT NULL DEFAULT '',
  image_url text,
  image_alt text,
  sizes jsonb NOT NULL DEFAULT '[{"label":"Regular","price":149,"sale_price":null},{"label":"Large","price":199,"sale_price":null}]'::jsonb,
  customisations jsonb NOT NULL DEFAULT '[]'::jsonb,
  badges text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'in' CHECK (status IN ('in','low','out')),
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  prep_minutes integer NOT NULL DEFAULT 10 CHECK (prep_minutes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.milkshakes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milkshakes TO authenticated;
GRANT ALL ON public.milkshakes TO service_role;
ALTER TABLE public.milkshakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active milkshakes" ON public.milkshakes FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff manage milkshakes" ON public.milkshakes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE TRIGGER milkshakes_touch BEFORE UPDATE ON public.milkshakes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.validate_milkshake()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE s jsonb;
BEGIN
  IF trim(NEW.name) = '' THEN RAISE EXCEPTION 'Name is required'; END IF;
  IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Slug must be lowercase letters, numbers and dashes'; END IF;
  IF jsonb_typeof(NEW.sizes) <> 'array' OR jsonb_array_length(NEW.sizes) = 0 THEN RAISE EXCEPTION 'At least one size is required'; END IF;
  FOR s IN SELECT * FROM jsonb_array_elements(NEW.sizes) LOOP
    IF coalesce(trim(s->>'label'),'') = '' THEN RAISE EXCEPTION 'Every size needs a name'; END IF;
    IF (s->>'price') IS NULL OR (s->>'price')::numeric <= 0 THEN RAISE EXCEPTION 'Every size needs a price above 0'; END IF;
    IF (s->>'sale_price') IS NOT NULL AND ((s->>'sale_price')::numeric <= 0 OR (s->>'sale_price')::numeric >= (s->>'price')::numeric) THEN
      RAISE EXCEPTION 'Sale price must be above 0 and below the regular price'; END IF;
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER milkshakes_validate BEFORE INSERT OR UPDATE ON public.milkshakes FOR EACH ROW EXECUTE FUNCTION public.validate_milkshake();

CREATE TABLE public.site_sections (
  key text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  show_on_home boolean NOT NULL DEFAULT true,
  home_order integer NOT NULL DEFAULT 0,
  nav_label text NOT NULL DEFAULT '',
  show_in_nav boolean NOT NULL DEFAULT true,
  nav_order integer NOT NULL DEFAULT 0,
  card_layout text NOT NULL DEFAULT 'grid',
  per_row_desktop integer NOT NULL DEFAULT 3,
  per_row_mobile integer NOT NULL DEFAULT 1,
  home_limit integer NOT NULL DEFAULT 4,
  banner_url text,
  promo_text text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'gold',
  show_badges boolean NOT NULL DEFAULT true,
  show_discounts boolean NOT NULL DEFAULT true,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  og_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads sections" ON public.site_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage sections" ON public.site_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_sections_touch BEFORE UPDATE ON public.site_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Public reads product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Staff upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')));
CREATE POLICY "Staff update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')));
CREATE POLICY "Staff delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')));
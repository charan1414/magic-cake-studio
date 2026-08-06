-- Price history
CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'catalog',
  slug text NOT NULL,
  name text,
  previous_price numeric,
  new_price numeric,
  previous_discount numeric,
  new_discount numeric,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.price_history TO authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read price history" ON public.price_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff write price history" ON public.price_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE INDEX price_history_slug_idx ON public.price_history (slug, created_at DESC);

-- Notify me requests
CREATE TABLE public.notify_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'healthy',
  slug text NOT NULL,
  product_name text,
  email text,
  phone text,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.notify_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notify_requests TO authenticated;
GRANT ALL ON public.notify_requests TO service_role;
ALTER TABLE public.notify_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request notification" ON public.notify_requests FOR INSERT TO anon, authenticated
  WITH CHECK (slug IS NOT NULL AND (email IS NOT NULL OR phone IS NOT NULL));
CREATE POLICY "Staff read notify requests" ON public.notify_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update notify requests" ON public.notify_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete notify requests" ON public.notify_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- Healthy range storefront settings + CMS content blocks
CREATE TABLE public.healthy_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  sort_mode text NOT NULL DEFAULT 'manual',
  ingredients_title text NOT NULL DEFAULT 'Only real ingredients',
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  nutrition_title text NOT NULL DEFAULT 'Nutrition highlights',
  nutrition jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_title text NOT NULL DEFAULT 'How it is made',
  process jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.healthy_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.healthy_settings TO authenticated;
GRANT ALL ON public.healthy_settings TO service_role;
ALTER TABLE public.healthy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Healthy settings are public" ON public.healthy_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage healthy settings" ON public.healthy_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE TRIGGER healthy_settings_touch BEFORE UPDATE ON public.healthy_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.healthy_settings (id, ingredients, nutrition, process) VALUES (
  true,
  '[{"title":"Whole grain flours","body":"Whole wheat, oats, ragi and millet — stone-milled, never refined."},{"title":"Jaggery, dates & figs","body":"All the sweetness comes from unrefined jaggery, medjool dates and figs."},{"title":"Nuts, seeds & nut butters","body":"Almonds, walnuts, pumpkin and sunflower seeds for protein and crunch."},{"title":"Cold-pressed fats","body":"Cold-pressed oils and cultured butter instead of hydrogenated shortening."}]'::jsonb,
  '[{"title":"0 g","body":"Refined sugar in every bar and cake"},{"title":"8-12 g","body":"Plant protein per protein bar serving"},{"title":"100%","body":"Whole grain flour, zero maida"},{"title":"48 hrs","body":"Fresh shelf life — no preservatives"}]'::jsonb,
  '[{"title":"Sourced weekly","body":"Grains, jaggery and nuts sourced from small Karnataka growers every week."},{"title":"Slow batch baking","body":"Baked in small batches so nothing sits, nothing stales."},{"title":"Chilled & sealed","body":"Cooled, hand-sealed and dispatched the same day it is baked."}]'::jsonb
);
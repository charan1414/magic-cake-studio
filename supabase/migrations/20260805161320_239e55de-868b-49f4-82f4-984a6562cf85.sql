CREATE TABLE public.healthy_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  discount_starts_at timestamptz,
  discount_ends_at timestamptz,
  badges text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'in',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.healthy_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthy_products TO authenticated;
GRANT ALL ON public.healthy_products TO service_role;

ALTER TABLE public.healthy_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthy products are publicly viewable"
  ON public.healthy_products FOR SELECT
  USING (status <> 'hidden' AND enabled = true);

CREATE POLICY "Staff manage healthy products"
  ON public.healthy_products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE TRIGGER healthy_products_touch
  BEFORE UPDATE ON public.healthy_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

INSERT INTO public.healthy_products (slug, name, description, price, display_order, badges) VALUES
  ('protein-bar', 'Protein Bar', 'Try clean fuel — oats & nut butter, zero refined sugar.', 59, 1, ARRAY['healthy-choice']),
  ('banana-cake', 'Banana Cake', 'Try it slow-baked with ripe banana, whole wheat & jaggery.', 149, 2, ARRAY['best-seller']),
  ('carrot-cake', 'Carrot Cake', 'Try it spiced & date-sweetened — carrot, cinnamon & whole grain flour.', 150, 3, ARRAY['chefs-choice']),
  ('granola-bar', 'Granola Bar', 'Try it crisp & wholesome — rolled oats, honey & seeds.', 89, 4, ARRAY['customer-favorite']),
  ('seeds-bar', 'Seeds Bar', 'Try it naturally sweet — pumpkin, sunflower, chia & dates.', 109, 5, ARRAY['new-arrival']),
  ('dry-fruit-bar', 'Dry Fruit Bar', 'Try it rich & nutrient-dense — almonds, cashews, raisins & figs.', 129, 6, ARRAY['healthy-choice']);
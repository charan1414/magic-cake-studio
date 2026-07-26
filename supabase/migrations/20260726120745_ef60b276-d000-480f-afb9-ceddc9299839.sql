CREATE TABLE IF NOT EXISTS public.product_inventory (
  slug text PRIMARY KEY,
  quantity_remaining integer NOT NULL DEFAULT 50 CHECK (quantity_remaining >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 8 CHECK (low_stock_threshold >= 0),
  active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stock_status text GENERATED ALWAYS AS (
    CASE
      WHEN active = false THEN 'out'
      WHEN quantity_remaining <= 0 THEN 'out'
      WHEN quantity_remaining <= low_stock_threshold THEN 'low'
      ELSE 'in'
    END
  ) STORED
);

GRANT SELECT ON public.product_inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_inventory TO authenticated;
GRANT ALL ON public.product_inventory TO service_role;

ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active inventory"
ON public.product_inventory
FOR SELECT
TO anon, authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can insert inventory"
ON public.product_inventory
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can update inventory"
ON public.product_inventory
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete inventory"
ON public.product_inventory
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_product_inventory_active_status
ON public.product_inventory (active, stock_status);

CREATE TRIGGER touch_product_inventory_updated_at
BEFORE UPDATE ON public.product_inventory
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.product_inventory (slug, quantity_remaining, low_stock_threshold, active)
VALUES
  ('ic-mango-bliss', 50, 8, true),
  ('ic-strawberry-delight', 50, 8, true),
  ('ic-jackfruit-paradise', 50, 8, true),
  ('ic-classic-vanilla', 50, 8, true),
  ('ic-butterscotch-crunch', 50, 8, true),
  ('ic-chocolate-delight', 50, 8, true),
  ('ic-blackcurrant', 50, 8, true),
  ('ic-tender-coconut', 50, 8, true),
  ('ic-biscoff', 50, 8, true),
  ('ic-blueberry-cheesecake', 50, 8, true),
  ('ic-choco-nut-sundae', 40, 6, true),
  ('ic-almond-fudge-sundae', 40, 6, true),
  ('ic-trilogy-sundae', 40, 6, true),
  ('ic-banana-split', 40, 6, true),
  ('ic-gudbud', 40, 6, true),
  ('ic-death-by-chocolate', 40, 6, true),
  ('ic-gulab-jamun-icecream', 40, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  active = EXCLUDED.active,
  updated_at = now();

ALTER TABLE public.delivery_settings
  ADD COLUMN IF NOT EXISTS distance_mode text NOT NULL DEFAULT 'road',
  ADD COLUMN IF NOT EXISTS require_complete_address boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_gps_checkout boolean NOT NULL DEFAULT true;

UPDATE public.delivery_settings
SET
  business_address = 'C & It''s Magic, Lakkur, Malur Taluk, Kolar District, Karnataka 563160',
  delivery_radius_km = COALESCE(delivery_radius_km, 20),
  distance_mode = 'road',
  require_complete_address = true,
  allow_gps_checkout = true,
  updated_at = now();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_road_distance_km numeric,
  ADD COLUMN IF NOT EXISTS delivery_distance_method text,
  ADD COLUMN IF NOT EXISTS delivery_matched_address text,
  ADD COLUMN IF NOT EXISTS inventory_decremented_at timestamptz;

CREATE OR REPLACE FUNCTION public.decrement_inventory_for_confirmed_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed'
    AND OLD.status IS DISTINCT FROM NEW.status
    AND NEW.inventory_decremented_at IS NULL THEN

    UPDATE public.product_inventory pi
    SET
      quantity_remaining = GREATEST(pi.quantity_remaining - oi.total_qty, 0),
      updated_at = now()
    FROM (
      SELECT slug, SUM(qty)::integer AS total_qty
      FROM public.order_items
      WHERE order_id = NEW.id
      GROUP BY slug
    ) oi
    WHERE pi.slug = oi.slug;

    NEW.inventory_decremented_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS decrement_inventory_on_order_confirmation ON public.orders;
CREATE TRIGGER decrement_inventory_on_order_confirmation
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.decrement_inventory_for_confirmed_order();
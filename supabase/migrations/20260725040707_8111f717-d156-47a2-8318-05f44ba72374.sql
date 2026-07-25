
-- Delivery settings singleton table
CREATE TABLE public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
  business_lat NUMERIC(10,7) NOT NULL DEFAULT 12.9698,
  business_lng NUMERIC(10,7) NOT NULL DEFAULT 77.7500,
  business_address TEXT NOT NULL DEFAULT 'Lakkur, Malur, Karnataka 563160',
  delivery_radius_km NUMERIC(6,2) NOT NULL DEFAULT 20,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 199,
  base_delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 39,
  per_km_fee NUMERIC(10,2) NOT NULL DEFAULT 8,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 999,
  delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  serviceable_pincodes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT delivery_settings_singleton_chk CHECK (singleton = TRUE)
);

GRANT SELECT ON public.delivery_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.delivery_settings TO authenticated;
GRANT ALL ON public.delivery_settings TO service_role;

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read delivery settings"
  ON public.delivery_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert delivery settings"
  ON public.delivery_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update delivery settings"
  ON public.delivery_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER delivery_settings_touch_updated_at
  BEFORE UPDATE ON public.delivery_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed single row
INSERT INTO public.delivery_settings (singleton) VALUES (TRUE)
ON CONFLICT (singleton) DO NOTHING;

-- Add delivery metadata to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC(10,7);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

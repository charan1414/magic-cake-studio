DROP POLICY IF EXISTS "Anyone reads sections" ON public.site_sections;
CREATE POLICY "Anyone reads visible scheduled sections"
  ON public.site_sections FOR SELECT TO anon, authenticated
  USING (
    visible IS TRUE
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DROP POLICY IF EXISTS "offers public read" ON public.offers;
CREATE POLICY "offers public read active current offers"
  ON public.offers FOR SELECT TO anon, authenticated
  USING (
    active IS TRUE
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DROP POLICY IF EXISTS "recommendation_rules public read" ON public.recommendation_rules;
CREATE POLICY "recommendation_rules public read active rules"
  ON public.recommendation_rules FOR SELECT TO anon, authenticated
  USING (active IS TRUE);

DROP POLICY IF EXISTS "founder public read" ON public.founder_profile;
CREATE POLICY "founder public read singleton profile"
  ON public.founder_profile FOR SELECT TO anon, authenticated
  USING (id IS TRUE);

DROP POLICY IF EXISTS "Signed-in users read inventory" ON public.product_inventory;
CREATE POLICY "Signed-in users read active inventory or staff inventory"
  ON public.product_inventory FOR SELECT TO authenticated
  USING (
    active IS TRUE
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

DROP POLICY IF EXISTS "Anyone can read serviceable pincodes" ON public.serviceable_pincodes;
CREATE POLICY "Anyone can read active serviceable pincodes"
  ON public.serviceable_pincodes FOR SELECT TO anon, authenticated
  USING (active IS TRUE);

DROP POLICY IF EXISTS "Anyone can submit a signup lead" ON public.signup_leads;
CREATE POLICY "Anyone can submit a valid signup lead"
  ON public.signup_leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    AND discount_percent BETWEEN 1 AND 10
    AND (
      (email IS NOT NULL AND length(email) <= 254
        AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$')
      OR
      (phone IS NOT NULL AND length(phone) <= 16
        AND phone ~ '^\\+?[0-9][0-9 -]{7,14}$')
    )
  );

DROP POLICY IF EXISTS "upsell_items public read" ON public.upsell_items;
CREATE POLICY "upsell_items public read active scheduled items"
  ON public.upsell_items FOR SELECT TO anon, authenticated
  USING (
    active IS TRUE
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DROP POLICY IF EXISTS "upsell_settings public read" ON public.upsell_settings;
CREATE POLICY "upsell_settings public read singleton"
  ON public.upsell_settings FOR SELECT TO anon, authenticated
  USING (id IS TRUE);

DROP POLICY IF EXISTS "product_overrides public read" ON public.product_overrides;
CREATE POLICY "product_overrides public read active products"
  ON public.product_overrides FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Healthy settings are public" ON public.healthy_settings;
CREATE POLICY "Healthy settings public read singleton"
  ON public.healthy_settings FOR SELECT TO anon, authenticated
  USING (id IS TRUE);

DROP POLICY IF EXISTS "Anyone can read delivery settings" ON public.delivery_settings;
CREATE POLICY "Anyone can read singleton delivery settings"
  ON public.delivery_settings FOR SELECT TO anon, authenticated
  USING (singleton IS TRUE);

DROP POLICY IF EXISTS "Public reads product images" ON storage.objects;
CREATE POLICY "Staff reads product images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
    )
  );
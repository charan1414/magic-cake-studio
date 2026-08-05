REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

DROP POLICY "Anyone can read active inventory" ON public.product_inventory;

CREATE POLICY "Public can read active inventory"
  ON public.product_inventory FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Signed-in users read inventory"
  ON public.product_inventory FOR SELECT
  TO authenticated
  USING (true);